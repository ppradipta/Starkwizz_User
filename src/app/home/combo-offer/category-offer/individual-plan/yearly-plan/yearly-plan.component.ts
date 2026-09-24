import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Checkout } from 'capacitor-razorpay';
import { DateUtilService } from 'src/app/common/util/date-util.service';
import { UserDetails } from 'src/app/model/user';
import { AuthService } from 'src/app/services/auth.service';
import { EventService } from 'src/app/services/event.service';
import { UserHelperService } from 'src/app/services/helper/user-helper.service';
import { LoadingService } from 'src/app/services/loading.service';
import { UserServiceService } from 'src/app/services/user-service.service';
import { UtilServiceService } from 'src/app/services/util-service.service';
import { environment } from 'src/environments/environment';
import { ToWords } from 'to-words';


@Component({
  selector: 'app-yearly-plan',
  templateUrl: './yearly-plan.component.html',
  styleUrls: ['./yearly-plan.component.scss'],
})
export class YearlyPlanComponent  implements OnInit {
  comboOffer: any = {};
  referralCode: string = '';
  referralUser: any = {};
  discountAmt: number = 0;
  payTotal: number = 0;
  netAmountAfterDiscount: number = 0;
  userDetails: UserDetails = new UserDetails();
  isFreeTrial: boolean = false;
  subjectList: any[] = [];
  quizSubscription: any = {};
  subscriptionType: string = '';
  freeTrial: any = {};
  offerType: any;
  afterDiscountTotal: number = 0;
  planType: string = 'yearly';
  constructor(
    private eventService: EventService,
    private firestore: AngularFirestore,
    private util: UtilServiceService,
    private navCtrl: NavController,
    private loading: LoadingService,
    private userService: UserServiceService,
    private router: Router,
    private userHelperService: UserHelperService,
    private dateUtilService: DateUtilService,
    private route: ActivatedRoute,
    private authService: AuthService,
  ) {
    this.subscriptionType = this.route.snapshot.queryParams['subscription'];
  }

  ngOnInit() {
    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;

      if (null != this.userDetails && this.userDetails.profileType.includes('FREETRAIL')) {
        this.isFreeTrial = true;
      }
    });

    this.userHelperService.getSubjectsList().subscribe(data => {
      this.subjectList = data;
    });

    // Set comboOffer for individual plan
    this.comboOffer = { offerApplicables: [{type: 'DYNAMO'},{type: 'QUIZWHIZZ'}, {type: 'EVENT'}] };

    // Fetch price from price management system
    this.firestore.collection('price_management').doc('prices').valueChanges().subscribe((prices: any) => {
      if (prices && prices.individual && prices.individual.yearly) {
        this.payTotal = prices.individual.yearly;
        this.afterDiscountTotal = prices.individual.yearly;
      }
    });

    if (this.subscriptionType == 'FREETRIAL') {
      this.authService.getFreeTrialSubscription(this.userDetails.boardId, this.userDetails.classId).subscribe((trial: any) => {
        this.freeTrial = trial[0];
        this.payTotal = 0;
      });
    }

    this.userService.getUserQuizType().subscribe((userQuiz) => {
      this.quizSubscription = userQuiz;
      this.quizSubscription.startDate = this.dateUtilService.getCurrentDateWithTime();
      this.quizSubscription.endDate = this.dateUtilService.addDayToCurrentData(365);
    });
  }

  goBack() {
    this.navCtrl.back();
  }

  onClickAddCoupon() {
    this.discountAmt = 0;
    // Use the dynamic price instead of comboOffer
    this.firestore.collection('price_management').doc('prices').valueChanges().subscribe((prices: any) => {
      if (prices && prices.individual && prices.individual.yearly) {
        this.payTotal = prices.individual.yearly;
        if (null != this.referralCode && this.referralCode.length >= 6) {
          this.firestore.collection("user_associates", ref => ref.where("code", "==", this.referralCode)).get().subscribe((data: any) => {
            if (!data.empty) {
              data.forEach((res: any) => {
                this.referralUser = res.data();
                let discountDetail = this.referralUser.discount;
                if (discountDetail.type == 'PERCENTAGE') {
                  this.discountAmt = parseFloat(((this.payTotal * this.referralUser.discount?.typeValue) / 100).toFixed(2));
                  this.payTotal = this.payTotal - Number(this.discountAmt != null ? this.discountAmt : 0);
                } else if (discountDetail.type == 'FLAT') {
                  this.discountAmt = this.referralUser.discount?.typeValue;
                  this.payTotal = this.payTotal - Number(this.discountAmt != null ? this.discountAmt : 0);
                }
                this.netAmountAfterDiscount = this.payTotal;
              })
            } else {
              this.util.showToast('No such referral code exist!!', 'danger', 'bottom');
            }
          });
        }
      }
    });
  }


  async onClickPay() {
    this.loading.present();

    if (this.payTotal > 0) {
      let options = {
        description: 'Starkwizz Payments towards exam subscription',
        image: 'https://starkwizzuser.web.app/assets/icon/favicon.png',
        currency: 'INR', // your 3 letter currency code
        key: environment.razorpayConfig.key, // your Key Id from Razorpay dashboard
        amount: (this.payTotal * 100).toFixed(2), // Payment amount in smallest denomiation e.g. cents for USD
        name: 'Starkwizz',
        prefill: {
          email: this.userDetails.emailId,
          contact: this.userDetails.mobileNo,
          name: this.userDetails.displayName
        },
        theme: {
          color: '#3399cc'
        }
      };


      try {
        let data = (await Checkout.open(options));
        let payment_id = data.response['razorpay_payment_id'];
        if (this.comboOffer.offerApplicables.length == 3) {
          this.offerType = 'ALL';
          this.createAllSubscription(payment_id);
        } else {
          this.offerType = 'INDVIDUAL';
        }

        const toWords = new ToWords();
        let amountText = toWords.convert(this.payTotal, { currency: true, ignoreDecimal: true });

        let dynamoIndex: number = this.comboOffer?.offerApplicables.findIndex(off => off.type == 'DYNAMO');
        if (dynamoIndex != -1) {
          this.createSubscription(payment_id, dynamoIndex, amountText);
        }
        let quizWhizzIndex: number = this.comboOffer?.offerApplicables.findIndex(off => off.type == 'QUIZWHIZZ');
        if (quizWhizzIndex != -1) {
          this.createQuizWhizzSubscription(payment_id, quizWhizzIndex, amountText);
        }
        let eventIndex: number = this.comboOffer?.offerApplicables.findIndex(off => off.type == 'EVENT');
        if (eventIndex != -1) {
          this.createEventSubscription(payment_id, eventIndex, amountText);
        }
        this.router.navigate(['home/tabs/starkwizzHome']);
        this.util.showToast(('Payment Successfully done'), 'success', 'bottom');
      } catch (error) {
        //  this.util.showToast(('Payment Failed'), 'danger', 'bottom');
        this.util.showToast((error.description), 'danger', 'bottom');
        this.router.navigate(['home/combo-offer']);
      }
    } else {
      this.util.showToast('Please check your payment amount', 'green', 'bottom');

    }

  }

  onClickFreeTrial() {
    this.loading.present();
    let payment_id = 'FREETRAIL';
    const toWords = new ToWords();
    let amountText = toWords.convert(this.payTotal, { currency: true, ignoreDecimal: true });

    let dynamoIndex: number = this.comboOffer?.offerApplicables.findIndex(off => off.type == 'DYNAMO');
    if (dynamoIndex != -1) {
      this.createSubscription(payment_id, dynamoIndex, amountText);
    }
    let quizWhizzIndex: number = this.comboOffer?.offerApplicables.findIndex(off => off.type == 'QUIZWHIZZ');
    if (quizWhizzIndex != -1) {
      this.createQuizWhizzSubscription(payment_id, quizWhizzIndex, amountText);
    }
    let eventIndex: number = this.comboOffer?.offerApplicables.findIndex(off => off.type == 'EVENT');
    if (eventIndex != -1) {
      this.createEventSubscription(payment_id, eventIndex, amountText);
    }
    this.router.navigate(['home/tabs/starkwizzHome']);
    this.util.showToast(('Payment Successfully done'), 'success', 'bottom');
  }



  createSubscription(payment_id: any, index: number, amountText: string) {
    let transactionId = this.util.generateAlphaNumericId();
    let startDate = this.dateUtilService.getCurrentDateWithTime();
    let endDate = '';
    if (this.subscriptionType == 'SUBSCRIBE') {
      if (this.planType == 'monthly') {
        endDate = this.dateUtilService.addDayToCurrentData(30);
      } else if (this.planType == 'quarterly') {
        endDate = this.dateUtilService.addDayToCurrentData(90);
      } else {
        endDate = this.dateUtilService.addDayToCurrentData(365);
      }
    } else if (this.subscriptionType == 'FREETRIAL') {
      endDate = this.dateUtilService.addDayToCurrentData(this.freeTrial.totalDays);
    }
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
      amount: this.payTotal,
      amountText: amountText,
      appliedDiscountTypeValue: this.discountAmt,
      discountTypeValue: 'PERCENTAGE',
      userid: this.userDetails?.id,
      name: this.userDetails?.firstName + " " + this.userDetails?.lastName,
      paymentfor: offerDetails,
      paymentby: this.userDetails?.id,
      paymentmode: 'ONLINE',
      subscriptionId: transactionId,
      offerType: this.offerType == 'ALL' ? 'ALL' : 'DYNAMO',
      txnNumber: this.util.generateAlphaNumericNumber(),
      txnDate: this.dateUtilService.getCurrentDateWithTime(),
      startDate: startDate,
      startDateUnix: this.dateUtilService.getUnixTime(startDate),
      endDate: endDate,
      endDateUnix: this.dateUtilService.getUnixTime(endDate),
      month: this.dateUtilService.getCurrentMonth(),
      year: this.dateUtilService.getCurrentYear(),
      referralCode: this.referralCode,
      paymentForDetails: this.comboOffer?.offerApplicables,
      classId: this.userDetails?.classId,
      className: this.userDetails?.className,
      boardName: this.userDetails?.boardName,
      boardId: this.userDetails?.boardId,
      mobileNo: this.userDetails?.mobileNo,
      emailId: this.userDetails?.emailId,
      subsType: this.subscriptionType,
      planCategory: 'Individual',
    }
    this.userService.setSubscriptionToCollecton(paymentData);
    let subscribedSubjects: any;
    if (this.subscriptionType == 'FREETRIAL') {
      subscribedSubjects = this.userHelperService.populateSubjectSubscription(this.subjectList, this.userDetails, 0, this.payTotal, this.discountAmt, 'PERCENTAGE', payment_id, transactionId, this.userDetails.emailId, 'FREETRIAL', endDate, this.subscriptionType);
    } else {
      subscribedSubjects = this.userHelperService.populateSubjectSubscription(this.subjectList, this.userDetails, this.comboOffer.totalPrice, this.payTotal, this.discountAmt, 'PERCENTAGE', payment_id, transactionId, this.userDetails.emailId, 'SUBSCRIBE', endDate, this.subscriptionType);
    }
    subscribedSubjects.applicationDiscounts = this.discountAmt;
    subscribedSubjects.referralDiscount = this.referralUser.discount;
    subscribedSubjects.offerType = this.offerType == 'ALL' ? 'ALL' : 'DYNAMO';
    subscribedSubjects.planCategory = 'Individual';
    this.userService.setSubscriptionSubjectsToCollecton(subscribedSubjects);
    // this.userService.setSubscribedUserExamSubjects(subscribedSubjects.subject);
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
    let endDate = '';
    if (this.subscriptionType == 'SUBSCRIBE') {
      endDate = this.dateUtilService.addDayToCurrentData(365);
    } else if (this.subscriptionType == 'FREETRIAL') {
      endDate = this.dateUtilService.addDayToCurrentData(this.freeTrial.totalDays);
    }
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
      amount: this.payTotal,
      amountText: amountText,
      appliedDiscountTypeValue: this.discountAmt,
      discountTypeValue: 'PERCENTAGE',
      userid: this.userDetails?.id,
      name: this.userDetails?.firstName + " " + this.userDetails?.lastName,
      paymentfor: offerDetails,
      paymentby: this.userDetails?.id,
      paymentmode: 'ONLINE',
      subscriptionId: transactionId,
      offerType: this.offerType == 'ALL' ? 'ALL' : 'QUIZWHIZZ',
      txnNumber: this.util.generateAlphaNumericNumber(),
      txnDate: this.dateUtilService.getCurrentDateWithTime(),
      startDate: startDate,
      month: this.dateUtilService.getCurrentMonth(),
      year: this.dateUtilService.getCurrentYear(),
      startDateUnix: this.dateUtilService.getUnixTime(startDate),
      endDate: endDate,
      endDateUnix: this.dateUtilService.getUnixTime(endDate),
      referralCode: this.referralCode,
      paymentForDetails: this.comboOffer?.offerApplicables,
      classId: this.userDetails?.classId,
      className: this.userDetails?.className,
      boardName: this.userDetails?.boardName,
      boardId: this.userDetails?.boardId,
      mobileNo: this.userDetails?.mobileNo,
      emailId: this.userDetails?.emailId,
      subsType: this.subscriptionType,
      planCategory: 'Individual',
    }
    this.userService.setSubscriptionToCollecton(paymentData);
    let subscribedSubjects: any;
    if (this.subscriptionType == 'FREETRIAL') {
      subscribedSubjects = this.userHelperService.populateQuizSubscription(null, this.userDetails, 0, this.payTotal, this.discountAmt, 'PERCENTAGE', payment_id, transactionId, this.userDetails.emailId, 'FREETRIAL', endDate, this.subscriptionType);
    } else {
      subscribedSubjects = this.userHelperService.populateQuizSubscription(null, this.userDetails, this.comboOffer.totalPrice, this.payTotal, this.discountAmt, 'PERCENTAGE', payment_id, transactionId, this.userDetails.emailId, 'SUBSCRIBE', endDate, this.subscriptionType);
    }
    subscribedSubjects.applicationDiscounts = this.discountAmt;
    subscribedSubjects.referralDiscount = this.referralUser.discount;
    subscribedSubjects.offerType = this.offerType == 'ALL' ? 'ALL' : 'QUIZWHIZZ';
    subscribedSubjects.planCategory = 'Individual';
    this.userService.setQuizWhizzSubscriptionToCollecton(subscribedSubjects);
    this.userDetails.profileType.push('QUIZZ_WHIZZ_SUBSCRIBE');
    this.userService.updateUserAfterPaymentToCollecton(this.userDetails, 'QUIZZ_WHIZZ_SUBSCRIBE', paymentData.id);
    this.userService.removeFreeTrailUserAfterPaymentToCollecton(this.userDetails, 'FREETRAIL');
    this.userService.setUserDetails(this.userDetails);
  }


  createEventSubscription(payment_id: any, index: number, amountText: string) {
    let transactionId = this.util.generateAlphaNumericId();
    let startDate = this.dateUtilService.getCurrentDateWithTime();
    let endDate = '';
    if (this.subscriptionType == 'SUBSCRIBE') {
      endDate = this.dateUtilService.addDayToCurrentData(365);
    } else if (this.subscriptionType == 'FREETRIAL') {
      endDate = this.dateUtilService.addDayToCurrentData(this.freeTrial.totalDays);
    }
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
      amount: this.payTotal,
      amountText: amountText,
      appliedDiscountTypeValue: this.discountAmt,
      discountTypeValue: 'PERCENTAGE',
      userid: this.userDetails?.id,
      name: this.userDetails?.firstName + " " + this.userDetails?.lastName,
      paymentfor: offerDetails,
      paymentby: this.userDetails?.id,
      paymentmode: 'ONLINE',
      subscriptionId: transactionId,
      offerType: this.offerType == 'ALL' ? 'ALL' : 'EVENT',
      txnNumber: this.util.generateAlphaNumericNumber(),
      txnDate: this.dateUtilService.getCurrentDateWithTime(),
      startDate: startDate,
      month: this.dateUtilService.getCurrentMonth(),
      year: this.dateUtilService.getCurrentYear(),
      startDateUnix: this.dateUtilService.getUnixTime(startDate),
      endDate: endDate,
      endDateUnix: this.dateUtilService.getUnixTime(endDate),
      referralCode: this.referralCode,
      paymentForDetails: this.comboOffer?.offerApplicables,
      classId: this.userDetails?.classId,
      className: this.userDetails?.className,
      boardName: this.userDetails?.boardName,
      boardId: this.userDetails?.boardId,
      mobileNo: this.userDetails?.mobileNo,
      emailId: this.userDetails?.emailId,
      subsType: this.subscriptionType,
      planCategory: 'Individual',
    }
    this.userService.setSubscriptionToCollecton(paymentData);
    let subscribedSubjects: any;
    if (this.subscriptionType == 'FREETRIAL') {
      subscribedSubjects = this.userHelperService.populateQuizSubscription(this.quizSubscription, this.userDetails, 0, this.payTotal, this.discountAmt, 'PERCENTAGE', payment_id, transactionId, this.userDetails.emailId, 'FREETRIAL', endDate, this.subscriptionType);
    } else {
      subscribedSubjects = this.userHelperService.populateQuizSubscription(this.quizSubscription, this.userDetails, this.comboOffer.totalPrice, this.payTotal, this.discountAmt, 'PERCENTAGE', payment_id, transactionId, this.userDetails.emailId, 'SUBSCRIBE', endDate, this.subscriptionType);
    }
    subscribedSubjects.applicationDiscounts = this.discountAmt;
    subscribedSubjects.referralDiscount = this.referralUser.discount;
    subscribedSubjects.offerType = this.offerType == 'ALL' ? 'ALL' : 'EVENT';
    subscribedSubjects.planCategory = 'Individual';
    this.userService.setEventToCollecton(subscribedSubjects);
    this.userDetails.profileType.push('EVENT_SUBSCRIBE');
    this.userService.updateUserAfterPaymentToCollecton(this.userDetails, 'EVENT_SUBSCRIBE', paymentData.id);
    this.userService.removeFreeTrailUserAfterPaymentToCollecton(this.userDetails, 'FREETRAIL');
    this.userService.setUserDetails(this.userDetails);
  }


  createAllSubscription(payment_id: any) {
    let transactionId = this.util.generateAlphaNumericId();
    let endDate = '';
    if (this.subscriptionType == 'SUBSCRIBE') {
      endDate = this.dateUtilService.addDayToCurrentData(365);
    } else if (this.subscriptionType == 'FREETRIAL') {
      endDate = this.dateUtilService.addDayToCurrentData(this.freeTrial.totalDays);
    }
    let subscribedSubjects: any;
    subscribedSubjects = this.userHelperService.populateSubjectSubscription(this.subjectList, this.userDetails, 0, this.payTotal, this.discountAmt, 'PERCENTAGE', payment_id, transactionId, this.userDetails.emailId, 'FREETRIAL', endDate, this.subscriptionType);

    subscribedSubjects.offerType = 'ALL';
    subscribedSubjects.applicationDiscounts = this.discountAmt;
    subscribedSubjects.referralDiscount = this.referralUser.discount;
    this.userService.setUserAllSubscription(subscribedSubjects);
  }

}
