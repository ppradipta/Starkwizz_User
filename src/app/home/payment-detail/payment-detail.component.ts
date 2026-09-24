import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { Checkout } from 'capacitor-razorpay';
import { ReferralCodeModalComponent } from 'src/app/common/component/referral-code-modal/referral-code-modal.component';
import { DateUtilService } from 'src/app/common/util/date-util.service';
import { FirebaseCollection } from 'src/app/model/common/firebase-collection';
import { UserDetails } from 'src/app/model/user';
import { UserHelperService } from 'src/app/services/helper/user-helper.service';
import { LoadingService } from 'src/app/services/loading.service';
import { UserServiceService } from 'src/app/services/user-service.service';
import { UtilServiceService } from 'src/app/services/util-service.service';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-payment-detail',
  templateUrl: './payment-detail.component.html',
  styleUrls: ['./payment-detail.component.scss'],
})
export class PaymentDetailComponent implements OnInit {
  subscriptions = true;
  subjectList: any[] = [];
  totalPrice: any = 0;
  discounts: any = {};
  discountedPrice: any = 0;
  userDetails: UserDetails = new UserDetails();
  paymentId: any = '';
  isFreeTrial: boolean = false;
  subscriptionType: any;
  userReferal: any = {};
  totalDiscountTypeValue: any = 0;
  gstDetails: any = {};
  gstAmount: number = 0;
  payTotal: any = 0;
  applyCouponAmt: any = 0;
  quizSubscription: any = {};
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userHelperService: UserHelperService,
    private firestore: AngularFirestore,
    private userService: UserServiceService,
    private util: UtilServiceService,
    private dateUtilService: DateUtilService,
    private loading: LoadingService,
    private modalController: ModalController,
    private navCtrl: NavController
  ) {
    this.isFreeTrial = this.route.snapshot.queryParams['freeTrial'];
    this.subscriptionType = this.route.snapshot.queryParams['typeSubscription'];
  }

  ngOnInit() {
    this.loading.present();
    this.userService.getGSTParamters();
    this.userService.getUserReferalType().subscribe((userRefl) => {
      this.userReferal = userRefl;
    });

    this.userHelperService.getSubjectsList().subscribe(data => {
      this.subjectList = data;
      if (this.subjectList.length > 0) {
        this.calculateTotalAmount();
      } else {
        this.totalPrice = 0;
        this.totalDiscountTypeValue = 0;
      }
    });
    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;

      if (null != this.userDetails && this.userDetails.profileType.includes('FREETRAIL')) {
        this.isFreeTrial = true;
      }
    });
    this.userService.getGSTParamter().subscribe(gst => {
      this.gstDetails = gst;
    })

    this.userService.getUserQuizType().subscribe((userQuiz) => {
      this.quizSubscription = userQuiz;
      this.quizSubscription.startDate = this.dateUtilService.getCurrentDateWithTime();
      this.quizSubscription.endDate = this.dateUtilService.addDayToCurrentData(365);
    });

    this.getDiscount();

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
        //order_id: this.util.generateAlphaNumericNumber(),
        prefill: {
          email: this.userDetails.emailId,
          contact: this.userDetails.mobileNo,
          name: this.userDetails.displayName
        },
        theme: {
          color: '#3399cc'
        }
      };

      console.log('options: ', options);

      try {
        let data = (await Checkout.open(options));
        console.log(data.response + "AcmeCorp");
        let payment_id = data.response['razorpay_payment_id'];
        if (this.subscriptionType == 'QUIZ_WHIZZ') {
          this.createQuizWhizzSubscription(payment_id);
        } else {
          this.createSubscription(payment_id);
        }
      } catch (error) {
        //  this.util.showToast(('Payment Failed'), 'danger', 'bottom');
        this.util.showToast((error.description), 'danger', 'bottom');
        this.userService.setPageViewType('PAYMENT_PENDING');
        this.router.navigate(['home/dynamo']);
      }

      // let successCallback = function (payment_id: any) {
      //   if (payment_id) {
      //     root.loading.presentLoading(2000);
      //     root.createSubscription(payment_id);
      //   }
      //   else {
      //     root.util.showToast(('Payment Failed'), 'danger', 'bottom');
      //   }
      // };

      // let cancelCallback = function (error: any) {
      //   root.util.showToast((error.description), 'danger', 'bottom');
      //   root.userService.setPageViewType('PAYMENT_PENDING');
      //   root.router.navigate(['home/dynamo']);
      // };

      // RazorpayCheckout.open(options, successCallback, cancelCallback);
    }
    // else if (this.isFreeTrial) {
    //   this.createSubscription(environment.starkwizz.trailkey + this.userDetails.mobileNo);
    // } 
    else {
      this.util.showToast('Please check your payment amount', 'green', 'bottom');
    }

  }


  calculateTotalAmount() {
    this.totalPrice = 0;
    this.totalDiscountTypeValue = 0;
    this.subjectList.forEach(data => {
      if (data && data.price && data.isChecked) {
        this.totalPrice += data.price;
      }
    });
    this.calculateDiscount();
  }

  getDiscount() {
    if (this.subscriptionType == 'QUIZ_WHIZZ') {
      this.totalPrice = this.quizSubscription?.subscriptionAmount;

      const query = this.firestore.collection(FirebaseCollection.DISCOUNTS).ref
        .where("applicableFor", "==", "QUIZWHIZZ EXAM")
        .where("boardId", "==", this.quizSubscription.boardId)
        .where("classId", "==", this.quizSubscription.classId)
      query
        .get().then((classes: any) => {
          if (!classes.empty) {
            classes.forEach((data: any) => {
              this.discounts = data.data();
              this.calculateDiscount();
            });
          }
        });
    } else {
      const query = this.firestore.collection(FirebaseCollection.DISCOUNTS).ref
        .where("applicableFor", "==", "DYNAMO EXAM")
        .where("boardId", "==", this.userDetails.boardId)
        .where("classId", "==", this.userDetails.classId)
      query
        .get().then((classes: any) => {
          if (!classes.empty) {
            classes.forEach((data: any) => {
              this.discounts = data.data();
              this.calculateTotalAmount();
            });
          }
        });
    }


    // if(this.userReferal.discountId) {
    //   const query = this.firestore.collection(FirebaseCollection.DISCOUNTS).ref
    //     // .where("applicableFor", "==", "SUBJECT");
    //     .where("id", "==", this.userReferal.discountId);
    //   query
    //     .get().then((classes: any) => {
    //       if (!classes.empty) {
    //         classes.forEach((data: any) => {
    //           this.discounts = data.data();
    //           this.calculateTotalAmount();
    //         });
    //       }
    //     });
    // }
  }


  // calculateGST() {
  //   if (this.gstDetails) {
  //     this.gstAmount = parseFloat(((this.gstDetails.typeValue * this.discountedPrice) / 100).toFixed(2));
  //     this.discountedPrice = this.discountedPrice + this.gstAmount;
  //   }

  // }

  calculateDiscount() {
    if (null != this.discounts && null != this.discounts.code && this.totalPrice) {
      this.discountedPrice = Number(this.discounts.typeValue).toFixed(2);
    }
    if (this.userReferal.isDiscountLink && null != this.userReferal.discount && this.userReferal.discount.type == 'PERCENTAGE') {
      // this.totalDiscountTypeValue = this.totalDiscountTypeValue + this.userReferal.discount.typeValue;
      this.applyCouponAmt = Number((this.userReferal.discount.typeValue * this.totalPrice) / 100).toFixed(2);
      // this.discountedPrice = Math.round(parseFloat((this.totalPrice - totalDiscounted).toFixed(2)));
    }
    else if (this.userReferal.isDiscountLink && null != this.userReferal.discount && this.userReferal.discount.type == 'FLAT') {
      this.applyCouponAmt = Number(this.userReferal.discount.typeValue).toFixed(2);
      // this.discountedPrice = Math.round(parseFloat((this.totalPrice - this.totalDiscountTypeValue).toFixed(2)));
    } else {
      // this.discountedPrice = this.totalPrice;
    }
    // this.calculateGST();
    let totalDiscountTypeValue = Number(this.discountedPrice) + Number(this.applyCouponAmt);
    this.totalDiscountTypeValue = Number(totalDiscountTypeValue).toFixed(2);
    let payTotal = Number(this.totalPrice) - Number(totalDiscountTypeValue);
    this.payTotal = Number(payTotal).toFixed(2);
    this.totalPrice = Number(this.totalPrice).toFixed(2);

  }

  createSubscription(payment_id: any) {
    let transactionId = this.util.generateAlphaNumericId();
    let subjTxnList: any[] = [];
    let subjTxnIds: any[] = [];
    this.subjectList.forEach(subject => {
      if (subject.isChecked) {
        let subjData: any = {
          subjectId: subject.id,
          subjectName: subject.displayName,
          category: subject?.category,
          price: subject?.price,
          classId: this.userDetails?.classId,
          className: this.userDetails?.className,
          boardName: this.userDetails?.boardName,
          boardId: this.userDetails?.boardId
        }
        subjTxnList.push(subjData);
        subjTxnIds.push(subject.id);
      }
    });

    let startDate = this.dateUtilService.getCurrentDateWithTime();
    let endDate = this.dateUtilService.addDayToCurrentData(365);

    let paymentData = {
      id: payment_id,
      date: this.dateUtilService.getCurrentDate(),
      dateUnix: this.dateUtilService.getCurrentEpochTime(),
      status: 'SUCCESS',
      amount: this.payTotal,
      appliedDiscountTypeValue: this.totalDiscountTypeValue,
      discountTypeValue: 'PERCENTAGE',
      userid: this.userDetails?.id,
      name: this.userDetails?.firstName + " " + this.userDetails?.lastName,
      paymentfor: 'EXAM',
      paymentby: this.userDetails?.id,
      paymentmode: 'ONLINE',
      subscriptionId: transactionId,
      txnNumber: this.util.generateAlphaNumericNumber(),
      txnDate: this.dateUtilService.getCurrentDateWithTime(),
      startDate: startDate,
      startDateUnix: this.dateUtilService.getUnixTime(startDate),
      endDate: endDate,
      endDateUnix: this.dateUtilService.getUnixTime(endDate),
      paymentForIds: subjTxnIds,
      paymentForDetails: subjTxnList,
      classId: this.userDetails?.classId,
      className: this.userDetails?.className,
      boardName: this.userDetails?.boardName,
      boardId: this.userDetails?.boardId,
    }
    this.userService.setSubscriptionToCollecton(paymentData);
    let subscribedSubjects = this.userHelperService.populateSubjectSubscription(this.subjectList, this.userDetails, this.totalPrice, this.payTotal, this.totalDiscountTypeValue, 'PERCENTAGE', payment_id, transactionId, this.userDetails.emailId,"SUBJECT",null, this.subscriptionType);
    subscribedSubjects.applicationDiscounts = this.discounts;
    subscribedSubjects.referralDiscount = this.userReferal.discount;
    this.userService.setSubscriptionSubjectsToCollecton(subscribedSubjects);
    this.userService.setSubscribedUserExamSubjects(subscribedSubjects.subject);
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
    this.router.navigate(['home/dynamo/beforePaid']);
    this.util.showToast(('Payment Successfully done'), 'success', 'bottom');
  }


  async onClickOpenModal() {
    const modal = await this.modalController.create({
      component: ReferralCodeModalComponent,
      cssClass: 'centerModal',
      backdropDismiss: false,
      componentProps: {},
    });
    await modal.present();
  }

  onClickSkipPayment() {
    this.loading.present();
    this.navCtrl.back();
  }

  createQuizWhizzSubscription(payment_id: any) {
    let transactionId = this.util.generateAlphaNumericId();
    let startDate = this.dateUtilService.getCurrentDateWithTime();
    let endDate = this.dateUtilService.addDayToCurrentData(365);

    let paymentData = {
      id: payment_id,
      date: this.dateUtilService.getCurrentDate(),
      dateUnix: this.dateUtilService.getCurrentEpochTime(),
      status: 'SUCCESS',
      amount: this.payTotal,
      appliedDiscountTypeValue: this.totalDiscountTypeValue,
      discountTypeValue: 'PERCENTAGE',
      userid: this.userDetails?.id,
      name: this.userDetails?.firstName + " " + this.userDetails?.lastName,
      paymentfor: 'EXAM',
      paymentby: this.userDetails?.id,
      paymentmode: 'ONLINE',
      subscriptionId: transactionId,
      txnNumber: this.util.generateAlphaNumericNumber(),
      txnDate: this.dateUtilService.getCurrentDateWithTime(),
      startDate: startDate,
      startDateUnix: this.dateUtilService.getUnixTime(startDate),
      endDate: endDate,
      endDateUnix: this.dateUtilService.getUnixTime(endDate),
      paymentForIds: this.quizSubscription.id,
      paymentForDetails: this.quizSubscription,
      classId: this.userDetails?.classId,
      className: this.userDetails?.className,
      boardName: this.userDetails?.boardName,
      boardId: this.userDetails?.boardId,
    }
    this.userService.setSubscriptionToCollecton(paymentData);
    let subscribedSubjects = this.userHelperService.populateQuizSubscription(this.quizSubscription, this.userDetails, this.totalPrice, this.payTotal, this.totalDiscountTypeValue, 'PERCENTAGE', payment_id, transactionId, this.userDetails.emailId,'SUBJECT',null, this.subscriptionType);
    subscribedSubjects.applicationDiscounts = this.discounts;
    subscribedSubjects.referralDiscount = this.userReferal.discount;
    this.userService.setQuizWhizzSubscriptionToCollecton(subscribedSubjects);
    this.userService.setSubscribedUserExamQuiz(this.quizSubscription);
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
    this.router.navigate(['home/dynamo/beforePaid']);
    this.util.showToast(('Payment Successfully done'), 'success', 'bottom');
  }

}
