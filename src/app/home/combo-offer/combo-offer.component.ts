import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, IonModal, NavController } from '@ionic/angular';
import { DateUtilService } from 'src/app/common/util/date-util.service';
import { AuthService } from 'src/app/services/auth.service';
import { EventService } from 'src/app/services/event.service';
import { UserHelperService } from 'src/app/services/helper/user-helper.service';
import { LoadingService } from 'src/app/services/loading.service';
import { UserServiceService } from 'src/app/services/user-service.service';
import { UtilServiceService } from 'src/app/services/util-service.service';
import { ToWords } from 'to-words';

@Component({
  selector: 'app-combo-offer',
  templateUrl: './combo-offer.component.html',
  styleUrls: ['./combo-offer.component.scss'],
})
export class ComboOfferComponent implements OnInit {
  comboOffer: any = {};
  userDetails: any = {};
  freeTrial: any = {};
  selectedOffer: any = [];
  selectedOfferDiscount: number = 0;
  selectedOfferPrice: number = 0;
  isFreeTrialUser: boolean = false;
  private forceHideFreeTrial: boolean = false;
  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private navCtrl: NavController,
    private eventService: EventService,
    private loading: LoadingService,
    private util: UtilServiceService,
    private userService: UserServiceService,
    private firestore: AngularFirestore,
    private alertController: AlertController,
    private dateUtilService: DateUtilService,
    private userHelperService: UserHelperService
  ) { }

  ngOnInit() {
    // If user comes from "Subscribe Now" CTA during free trial, hide Free Trial button on this page.
    this.route.queryParams.subscribe((params: any) => {
      const qp = params?.hideFreeTrial;
      this.forceHideFreeTrial = qp === true || String(qp ?? '').toLowerCase() === 'true';
      this.isFreeTrialUser = this.forceHideFreeTrial || this.isFreeTrialUserProfile();
    });
  }

  ionViewWillEnter() {
    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
      this.isFreeTrialUser = this.forceHideFreeTrial || this.isFreeTrialUserProfile();

      // Free trial configuration is based on boardId/classId, so wait until userDetails is available.
      this.authService.getFreeTrialSubscription(this.userDetails.boardId, this.userDetails.classId).subscribe((trial: any) => {
        this.freeTrial = trial[0];
      });
    });

    this.authService.getComboSubscription().subscribe((offer: any) => {
      this.comboOffer = offer[0];
      this.comboOffer.offerApplicables.forEach(el => {
        el.isSelected = true;
      });
    });
  }

  private isFreeTrialUserProfile(): boolean {
    const profileTypes = (this.userDetails?.profileType ?? []).map((t: any) => String(t ?? '').toUpperCase());
    return profileTypes.includes('FREETRAIL') || profileTypes.includes('FREETRIAL');
  }


  handleRefresh(event) {
    setTimeout(() => {
      this.ngOnInit();
      event.target.complete();
    }, 3000);
  }

  goBack() {
    this.navCtrl.back();
  }

  onClickOfferDetail() {
    this.loading.present();
    let transactions = this.comboOffer.offerApplicables.filter(so => so.isSelected == true);
    if (transactions && transactions.length > 0) {
      this.comboOffer.offerApplicables = transactions;
      this.comboOffer.totalPrice = transactions.reduce((sum, item) => sum + item.price, 0);
      if (this.selectedOfferDiscount > 0) {
        this.comboOffer.discount = this.selectedOfferDiscount;

      }
      this.eventService.setComboOfferSubs(this.comboOffer);
      this.router.navigate(['home/category-offer'], { queryParams: { subscription: 'SUBSCRIBE' } });
    } else {
      this.util.showToast(('Please Select Events'), 'danger', 'bottom');
    }
  }

  onClickFreeTrial() {
    // Free trial can be claimed only once per user/board/class.
    this.firestore.collection("user_subscription", ref => ref
      .where("userId", "==", this.userDetails.id)
      .where("boardName", "==", this.userDetails.boardName)
      .where("classId", "==", this.userDetails.classId)
      .where("subscriptionType", "==", 'FREETRIAL')
    ).get().subscribe((results: any) => {
      if (!results.empty) {
        this.presentAlertForAppUpdate();
      } else {
        this.loading.present();
        this.createFreeTrialSubscriptions();
      }
    });
  }

  async presentAlertForAppUpdate() {
    const alert = await this.alertController.create({
      message: 'Your freetrial allready expired, Please proceed for subscription',
      cssClass: 'customAlert updateVersion',
      header: 'Expired Freetrial',
      backdropDismiss: false,
      buttons: [{
        text: 'OK',
        handler: () => {
          // Redirect to subscription page
          this.router.navigate(['home/combo-offer'], { queryParams: { subscription: 'EXPIRED' } });
        }
      }]
    });
    await alert.present();
  }

  goToMore(offer) {
    this.router.navigate(['home/KnowMore-info'], { queryParams: { OFFERTYPE: offer.type } });
  }

  selectOrderForAction(order: any) {
    return true
    // this.loading.present();
    let index = this.comboOffer.offerApplicables.findIndex(ser => ser.id == order.id);
    if (index != -1) {
      let findOrder = this.comboOffer.offerApplicables[index];
      findOrder.isSelected = findOrder.isSelected == false ? true : false;
      this.comboOffer.offerApplicables[index].isSelected = findOrder.isSelected;
    }

    this.selectedOffer = this.comboOffer.offerApplicables.filter(so => so.isSelected == true);
    if (this.selectedOffer.length < 3) {
      this.selectedOfferDiscount = this.selectedOffer.reduce((sum, item) => sum + item.discount, 0);
      this.selectedOfferPrice = this.selectedOffer.reduce((sum, item) => sum + item.price, 0);

    } else if (this.selectedOffer.length > 2) {
      this.selectedOfferDiscount = 0;
      this.selectedOfferPrice = 0;
      this.comboOffer.discount = this.comboOffer.discount;
      this.comboOffer.totalPrice = this.comboOffer.totalPrice;
    }
  }

  createFreeTrialSubscriptions() {
    let payment_id = 'FREETRAIL';
    const toWords = new ToWords();
    let amountText = toWords.convert(0, { currency: true, ignoreDecimal: true });

    let dynamoIndex: number = this.comboOffer?.offerApplicables.findIndex(off => off.type == 'DYNAMO');
    if (dynamoIndex != -1) {
      this.createSubscription(payment_id, dynamoIndex, amountText);
    }
    let quizWhizzIndex: number = this.comboOffer?.offerApplicables.findIndex(off => off.type == 'QUIZWHIZZ');
    if (quizWhizzIndex != -1) {
      this.createQuizWhizzSubscription(payment_id, quizWhizzIndex, amountText);
    }
    // Events are excluded from free trial. Users can access Events without free-trial subscription.
    this.router.navigate(['home/tabs/starkwizzHome']);
    this.util.showToast(('Free Trial Activated Successfully'), 'success', 'bottom');
  }

  createSubscription(payment_id: any, index: number, amountText: string) {
    let transactionId = this.util.generateAlphaNumericId();
    let startDate = this.dateUtilService.getCurrentDateWithTime();
    let endDate = this.dateUtilService.addDayToCurrentData(this.freeTrial.totalDays);
    let offerDetails: any[] = [];
    if (null != this.comboOffer) {
      this.comboOffer?.offerApplicables.forEach(offer => {
        offerDetails.push(offer.type);
      });
    }
    let paymentData = {
      id: payment_id,
      date: this.dateUtilService.getCurrentDate(),
      dateUnix: this.dateUtilService.getCurrentEpochTime(),
      status: 'SUCCESS',
      amount: 0,
      amountText: amountText,
      appliedDiscountTypeValue: 0,
      discountTypeValue: 'PERCENTAGE',
      userid: this.userDetails?.id,
      name: this.userDetails?.firstName + " " + this.userDetails?.lastName,
      paymentfor: offerDetails,
      paymentby: this.userDetails?.id,
      paymentmode: 'FREETRIAL',
      subscriptionId: transactionId,
      offerType: 'DYNAMO',
      txnNumber: this.util.generateAlphaNumericNumber(),
      txnDate: this.dateUtilService.getCurrentDateWithTime(),
      startDate: startDate,
      startDateUnix: this.dateUtilService.getUnixTime(startDate),
      endDate: endDate,
      endDateUnix: this.dateUtilService.getUnixTime(endDate),
      month: this.dateUtilService.getCurrentMonth(),
      year: this.dateUtilService.getCurrentYear(),
      referralCode: '',
      paymentForDetails: this.comboOffer?.offerApplicables,
      classId: this.userDetails?.classId,
      className: this.userDetails?.className,
      boardName: this.userDetails?.boardName,
      boardId: this.userDetails?.boardId,
      mobileNo: this.userDetails?.mobileNo,
      emailId: this.userDetails?.emailId,
      subsType: 'FREETRIAL',
    }
    this.userService.setSubscriptionToCollecton(paymentData);
    let subscribedSubjects: any;
    subscribedSubjects = this.userHelperService.populateSubjectSubscription([], this.userDetails, 0, 0, 0, 'PERCENTAGE', payment_id, transactionId, this.userDetails.emailId, 'FREETRIAL', endDate, 'FREETRIAL');
    subscribedSubjects.applicationDiscounts = 0;
    subscribedSubjects.referralDiscount = {};
    subscribedSubjects.offerType = 'DYNAMO';
    // Free Trial limitations for Dynamo
    subscribedSubjects.isFreeTrial = true;
    subscribedSubjects.allowedSubjects = 1; // User can select one SUBJECT only
    subscribedSubjects.allowedTests = ['DIAGNOSTIC', 'PROGRESSIVE']; // Only Diagnostic and Progressive Tests
    subscribedSubjects.maxProgressiveAttempts = 5; // Up to 5 attempts for Progressive Test
    subscribedSubjects.excludedTests = ['QUARTERLY', 'PROFICIENCY', 'BENCHMARK']; // NA for these
    this.userService.setSubscriptionSubjectsToCollecton(subscribedSubjects);
    if (this.userDetails.profileType.includes('FREETRAIL')) {
      let findIndex = this.userDetails.profileType.findIndex(pt => pt === 'FREETRAIL');
      if (findIndex != -1) {
        this.userDetails.profileType.splice(findIndex);
      }
    }
    this.userDetails.profileType.push('SUBSCRIBE');
    this.userService.updateUserAfterPaymentToCollecton(this.userDetails, 'SUBSCRIBE', paymentData.id);
    this.userService.removeFreeTrailUserAfterPaymentToCollecton(this.userDetails, 'FREETRAIL');
    this.userService.setUserDetails(this.userDetails);
  }

  createQuizWhizzSubscription(payment_id: any, index: number, amountText: string) {
    let transactionId = this.util.generateAlphaNumericId();
    let startDate = this.dateUtilService.getCurrentDateWithTime();
    let endDate = this.dateUtilService.addDayToCurrentData(this.freeTrial.totalDays);
    let offerDetails: any[] = [];
    if (null != this.comboOffer) {
      this.comboOffer?.offerApplicables.forEach(offer => {
        offerDetails.push(offer.type);
      });
    }
    let paymentData = {
      id: payment_id,
      date: this.dateUtilService.getCurrentDate(),
      dateUnix: this.dateUtilService.getCurrentEpochTime(),
      status: 'SUCCESS',
      amount: 0,
      amountText: amountText,
      appliedDiscountTypeValue: 0,
      discountTypeValue: 'PERCENTAGE',
      userid: this.userDetails?.id,
      name: this.userDetails?.firstName + " " + this.userDetails?.lastName,
      paymentfor: offerDetails,
      paymentby: this.userDetails?.id,
      paymentmode: 'FREETRIAL',
      subscriptionId: transactionId,
      offerType: 'QUIZWHIZZ',
      txnNumber: this.util.generateAlphaNumericNumber(),
      txnDate: this.dateUtilService.getCurrentDateWithTime(),
      startDate: startDate,
      month: this.dateUtilService.getCurrentMonth(),
      year: this.dateUtilService.getCurrentYear(),
      startDateUnix: this.dateUtilService.getUnixTime(startDate),
      endDate: endDate,
      endDateUnix: this.dateUtilService.getUnixTime(endDate),
      referralCode: '',
      paymentForDetails: this.comboOffer?.offerApplicables,
      classId: this.userDetails?.classId,
      className: this.userDetails?.className,
      boardName: this.userDetails?.boardName,
      boardId: this.userDetails?.boardId,
      mobileNo: this.userDetails?.mobileNo,
      emailId: this.userDetails?.emailId,
      subsType: 'FREETRIAL',
    }
    this.userService.setSubscriptionToCollecton(paymentData);
    let subscribedSubjects: any;
    subscribedSubjects = this.userHelperService.populateQuizSubscription(null, this.userDetails, 0, 0, 0, 'PERCENTAGE', payment_id, transactionId, this.userDetails.emailId, 'FREETRIAL', endDate, 'FREETRIAL');
    subscribedSubjects.applicationDiscounts = 0;
    subscribedSubjects.referralDiscount = {};
    subscribedSubjects.offerType = 'QUIZWHIZZ';
    // Free Trial limitations for Quiz-Whizz
    subscribedSubjects.isFreeTrial = true;
    subscribedSubjects.allowedContests = 1; // One (SUNDAY) Contest
    subscribedSubjects.allowedContestType = 'SUNDAY';
    this.userService.setQuizWhizzSubscriptionToCollecton(subscribedSubjects);
    this.userDetails.profileType.push('QUIZZ_WHIZZ_SUBSCRIBE');
    this.userService.updateUserAfterPaymentToCollecton(this.userDetails, 'QUIZZ_WHIZZ_SUBSCRIBE', paymentData.id);
    this.userService.removeFreeTrailUserAfterPaymentToCollecton(this.userDetails, 'FREETRAIL');
    this.userService.setUserDetails(this.userDetails);
  }

  createEventSubscription(payment_id: any, index: number, amountText: string) {
    let transactionId = this.util.generateAlphaNumericId();
    let startDate = this.dateUtilService.getCurrentDateWithTime();
    let endDate = this.dateUtilService.addDayToCurrentData(this.freeTrial.totalDays);
    let offerDetails: any[] = [];
    if (null != this.comboOffer) {
      this.comboOffer?.offerApplicables.forEach(offer => {
        offerDetails.push(offer.type);
      });
    }
    let paymentData = {
      id: payment_id,
      date: this.dateUtilService.getCurrentDate(),
      dateUnix: this.dateUtilService.getCurrentEpochTime(),
      status: 'SUCCESS',
      amount: 0,
      amountText: amountText,
      appliedDiscountTypeValue: 0,
      discountTypeValue: 'PERCENTAGE',
      userid: this.userDetails?.id,
      name: this.userDetails?.firstName + " " + this.userDetails?.lastName,
      paymentfor: offerDetails,
      paymentby: this.userDetails?.id,
      paymentmode: 'FREETRIAL',
      subscriptionId: transactionId,
      offerType: 'EVENT',
      txnNumber: this.util.generateAlphaNumericNumber(),
      txnDate: this.dateUtilService.getCurrentDateWithTime(),
      startDate: startDate,
      month: this.dateUtilService.getCurrentMonth(),
      year: this.dateUtilService.getCurrentYear(),
      startDateUnix: this.dateUtilService.getUnixTime(startDate),
      endDate: endDate,
      endDateUnix: this.dateUtilService.getUnixTime(endDate),
      referralCode: '',
      paymentForDetails: this.comboOffer?.offerApplicables,
      classId: this.userDetails?.classId,
      className: this.userDetails?.className,
      boardName: this.userDetails?.boardName,
      boardId: this.userDetails?.boardId,
      mobileNo: this.userDetails?.mobileNo,
      emailId: this.userDetails?.emailId,
      subsType: 'FREETRIAL',
    }
    this.userService.setSubscriptionToCollecton(paymentData);
    let subscribedSubjects: any;
    subscribedSubjects = this.userHelperService.populateQuizSubscription(null, this.userDetails, 0, 0, 0, 'PERCENTAGE', payment_id, transactionId, this.userDetails.emailId, 'FREETRIAL', endDate, 'FREETRIAL');
    subscribedSubjects.applicationDiscounts = 0;
    subscribedSubjects.referralDiscount = {};
    subscribedSubjects.offerType = 'EVENT';
    this.userService.setEventToCollecton(subscribedSubjects);
    this.userDetails.profileType.push('EVENT_SUBSCRIBE');
    this.userService.updateUserAfterPaymentToCollecton(this.userDetails, 'EVENT_SUBSCRIBE', paymentData.id);
    this.userService.removeFreeTrailUserAfterPaymentToCollecton(this.userDetails, 'FREETRAIL');
    this.userService.setUserDetails(this.userDetails);
  }
}
