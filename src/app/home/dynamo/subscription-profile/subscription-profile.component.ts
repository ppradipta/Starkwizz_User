import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { UserDetails } from 'src/app/model/user';
import { VerifyOtpComponent } from 'src/app/public/modal/verify-otp/verify-otp.component';
import { LoadingService } from 'src/app/services/loading.service';
import { UserServiceService } from 'src/app/services/user-service.service';
import { UtilServiceService } from 'src/app/services/util-service.service';
import { environment } from 'src/environments/environment';
declare var RazorpayCheckout: any;
@Component({
  selector: 'app-subscription-profile',
  templateUrl: './subscription-profile.component.html',
  styleUrls: ['./subscription-profile.component.scss'],
})
export class SubscriptionProfileComponent implements OnInit {
  name: any
  email: string = '';
  subscriptions = true;
  stateList: any = [] = [];
  districts: any[] = [];
  cities: any[] = [];
  userDetails: UserDetails = new UserDetails();
  schools: any[] = [];
  isFreeTrial = true;
  subscriptionType: string = '';
  backURL: string = '';
  referralCode: string = '';
  referralUser: any = {};
  //discountDetails: any;
  //subscribedUserEvents: any[] = [];
  typeSubscription: string = '';
  quizSubscription: any = {};
  totalPrice: number = 0;
  discountedPrice: number = 0;
  constructor(
    private navCtrl: NavController,
    private router: Router,
    private firestore: AngularFirestore,
    private modalController: ModalController,
    private userService: UserServiceService,
    private util: UtilServiceService,
    private route: ActivatedRoute,
    private loading: LoadingService,
  ) { }

  ngOnInit() {
    this.isFreeTrial = this.route.snapshot.queryParams['freeTrial'];
    this.subscriptionType = this.route.snapshot.queryParams['subscriptionType'];
    this.typeSubscription = this.route.snapshot.queryParams['typeSubscription'];
    this.backURL = this.route.snapshot.queryParams['backURL'];
    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
      if (null != this.userDetails) {
        this.email = this.userDetails.emailId;
        this.stateList = [{
          displayName: this.userDetails.stateName,
          id: this.userDetails.stateId
        }];
        this.districts = [{
          displayName: this.userDetails.districtName,
          id: this.userDetails.districtId
        }];

        this.cities = [{
          displayName: this.userDetails.cityName,
          id: this.userDetails.cityId
        }];
        this.schools = [{
          displayName: this.userDetails.schoolName,
          id: this.userDetails.schoolId
        }];
      }
    });
    //this.getQuizWhizzSubscriptions();
  }

  goBack() {
    this.navCtrl.back();
  }


  selectState(event: any) {
    //this.loading.presentLoading(2000);
    this.stateList = [];
    this.userDetails.stateId = '';
    this.userDetails.stateName = '';
    this.userDetails.districtName = '';
    this.userDetails.districtId = '';
    this.userDetails.districtName = '';
    this.userDetails.cityId = '';
    this.userDetails.cityName = '';
    this.userDetails.schoolId = '';
    this.userDetails.schoolName = '';
    this.firestore.collection('state').get().subscribe((staes: any) => {
      if (!staes.empty) {
        staes.forEach((state: any) => {
          this.stateList.push(state.data());
        });
        this.stateList = this.stateList.sort((a: any, b: any) => {
          if (a.displayName.toLowerCase() > b.displayName.toLowerCase())
            return 1;
          if (a.displayName.toLowerCase() < b.displayName.toLowerCase())
            return -1;
          return 0;
        });
      }
    });

  }
  selectDistrict(event: any) {
    // this.loading.presentLoading(2000);
    this.districts = [];
    this.userDetails.districtName = '';
    this.userDetails.districtId = '';
    this.userDetails.districtName = '';
    this.userDetails.cityId = '';
    this.userDetails.cityName = '';
    this.userDetails.schoolId = '';
    this.userDetails.schoolName = '';
    this.firestore.collection("district", ref => ref.where("stateid", "==", this.userDetails.stateId)).get().subscribe(data => {
      data.forEach(res => {
        this.districts.push(res.data());
      })

      this.districts = this.districts.sort((a, b) => {
        if (a.displayName.toLowerCase() > b.displayName.toLowerCase())
          return 1;
        if (a.displayName.toLowerCase() < b.displayName.toLowerCase())
          return -1;
        return 0;
      });
    });
  }
  selectCity(event: any) {
    //this.loading.presentLoading(2000);
    this.cities = [];
    this.userDetails.cityId = '';
    this.userDetails.cityName = '';
    this.userDetails.schoolId = '';
    this.userDetails.schoolName = '';
    this.firestore.collection("cities", ref => ref.where("districtid", "==", this.userDetails.districtId)).get().subscribe(data => {
      data.forEach(res => {
        this.cities.push(res.data());
      });
      this.cities = this.cities.sort((a, b) => {
        if (a.displayName.toLowerCase() > b.displayName.toLowerCase())
          return 1;
        if (a.displayName.toLowerCase() < b.displayName.toLowerCase())
          return -1;
        return 0;
      });
    });

  }

  selectSchool(event: any) {
    //  this.loading.presentLoading(2000);
    this.userDetails.schoolId = '';
    this.userDetails.schoolName = '';
    this.schools = [];
    this.firestore.collection("school", ref => ref.where("districtid", "==", this.userDetails.districtId)
      .where("board", "==", this.userDetails.boardName)).get().subscribe((data: any) => {
        data.forEach((res: any) => {
          this.schools.push(res.data());
        })
        this.schools = this.schools.sort((a, b) => {
          if (a.displayName.toLowerCase() > b.displayName.toLowerCase())
            return 1;
          if (a.displayName.toLowerCase() < b.displayName.toLowerCase())
            return -1;
          return 0;
        });
      });


  }

  sendEmailOtp() {
    //this.loading.presentLoading(3000);
    let profileType = 'FREETRAIL';
    if (!this.userDetails.profileType.includes('FREETRAIL')) {
      this.userDetails.profileType.push(profileType);
    }

    if (this.subscriptionType == 'EVENT') {
      if (!this.userDetails.profileType.includes('EVENT_SUBSCRIBED')) {
        this.userDetails.profileType.push('EVENT_SUBSCRIBED');
        profileType = 'EVENT_SUBSCRIBED';
      }
    }
    this.userDetails.emailId = this.email;
    this.userDetails.isEmailVerified = true;
    this.userDetails.referralCode = this.referralCode;
    this.userService.updateUserEmailAfterVerificationToCollecton(this.userDetails, profileType);
    if (this.userDetails.stateId && this.userDetails.districtId && this.userDetails.cityId && this.userDetails.schoolId) {
      this.updateProfileDetails();
      // if (!this.userDetails.isEmailVerified) {
      //   this.updateProfileDetails();
      //  let otpDetails = this.userHelperService.populateEmailOtpDetails(this.userDetails.emailId);
      //send data to opt
      // this.userService.setOtpDetailsToCollecton(otpDetails).then(data => {
      //   this.onClickVerify(this.userDetails.emailId);
      // })
      // } else if (null != this.userDetails.emailId && this.userDetails.emailId != this.email) {
      //   this.updateProfileDetails();
      // let otpDetails = this.userHelperService.populateEmailOtpDetails(this.userDetails.emailId);
      //send data to opt
      // this.userService.setOtpDetailsToCollecton(otpDetails).then(data => {
      //   this.onClickVerify(this.userDetails.emailId);
      // })
      // } 
      if (this.userDetails.isEmailVerified && this.userDetails.emailId == this.email && this.subscriptionType == 'EXAM') {
        this.router.navigate(['home/dynamo/beforePaid'], { queryParams: { freeTrial: this.isFreeTrial, subscriptionType: 'EXAM' } });
      } else if (this.userDetails.isEmailVerified && this.userDetails.emailId == this.email && this.subscriptionType == 'EVENT') {
        this.userDetails.profileType.push('EVENT_SUBSCRIBED');
        this.userService.setUserDetails(this.userDetails);
        this.router.navigate([this.backURL], { queryParams: { isKyc: true } });
        this.util.showInfoAlert('Your required Information Sucessfully Completed');
        if (environment.push.includes('USER_PROFILE_KYC')) {
          this.userService.processProfileUpdateNotification(this.userDetails, 'USER_PROFILE_KYC', null);
        }
        if (environment.sms.includes('USER_PROFILE_KYC')) {
          this.userService.processProfileUpdateSMS(this.userDetails, this.userDetails.mobileNo, 'USER_PROFILE_KYC', null);
        }
      }

    } else {
      this.util.showErrorAlert('Please fill genearl section state, disctrict, city, school');
    }


  }
  async onClickVerify(email: any) {
    this.userService.setUserDetails(this.userDetails);
    const modal = await this.modalController.create({
      component: VerifyOtpComponent,
      cssClass: 'centerModal_2',
      backdropDismiss: true,
      componentProps: {
        email: email,
        type: 'EMAIL_VERIFY',
        freeTrial: this.isFreeTrial,
        subscriptionType: this.subscriptionType,
        backURL: this.backURL
      }
    });
    await modal.present();
  }

  updateProfileDetails() {
    let stateIndex = this.stateList.findIndex((stat: any) => stat.id == this.userDetails.stateId);
    if (stateIndex != -1) {
      this.userDetails.stateName = this.stateList[stateIndex].displayName;
    }

    let distIndex = this.districts.findIndex(dist => dist.id == this.userDetails.districtId);
    if (distIndex != -1) {
      this.userDetails.districtName = this.districts[distIndex].displayName;
    }

    let cityIndex = this.cities.findIndex(cit => cit.id == this.userDetails.cityId);
    if (cityIndex != -1) {
      this.userDetails.cityName = this.cities[cityIndex].displayName;
    }

    let sclIndex = this.schools.findIndex(scl => scl.id == this.userDetails.schoolId);
    if (sclIndex != -1) {
      this.userDetails.schoolName = this.schools[sclIndex].displayName;
    }
    this.userService.updateUserAddressDetailsToCollecton(this.userDetails);
    this.userService.updateUserProfileAddressDetailsToCollecton(this.userDetails);
    this.userService.setUserDetails(this.userDetails);
  }

  onInputReferralCode(event: any) {
    let refCode = event.target.value;
    if (null != refCode && refCode.length >= 6) {
      this.firestore.collection("user_associates", ref => ref.where("code", "==", refCode)).get().subscribe((data: any) => {
        if (!data.empty) {
          data.forEach((res: any) => {
            this.referralUser = res.data();
            this.userService.setUserReferalType(this.referralUser);
          })
        } else {
          this.util.showToast('No such refeeral code exist!!', 'danger', 'bottom');
        }

      });
    }

  }

  getQuizWhizzSubscriptions() {
    this.firestore.collection('quizWhizz_subscription', ref => ref
      .where('classId', '==', this.userDetails?.classId)
      .where('boardId', '==', this.userDetails?.boardId))
      .get().subscribe((subs: any) => {
        let quizSubsList = [];
        if (!subs.empty) {
          subs.forEach((data: any) => {
            this.quizSubscription = data.data();
            quizSubsList.push(this.quizSubscription);
          });
        }
        this.totalPrice = Number(this.quizSubscription.subscriptionAmount);
        this.discountedPrice = Number(this.quizSubscription.subscriptionAmount);
      });
  }

  onClickView() {
    this.loading.present();
    let profileType = 'FREETRAIL';
    if (!this.userDetails.profileType.includes('FREETRAIL')) {
      this.userDetails.profileType.push(profileType);
    }

    if (this.subscriptionType == 'EVENT') {
      if (!this.userDetails.profileType.includes('EVENT_SUBSCRIBED')) {
        this.userDetails.profileType.push('EVENT_SUBSCRIBED');
        profileType = 'EVENT_SUBSCRIBED';
      }
    }
    this.userDetails.emailId = this.email;
    this.userDetails.isEmailVerified = true;
    this.userDetails.referralCode = this.referralCode;
    this.userService.updateUserEmailAfterVerificationToCollecton(this.userDetails, profileType);
    if (this.userDetails.stateId && this.userDetails.districtId && this.userDetails.cityId && this.userDetails.schoolId) {
      this.updateProfileDetails();
      this.userService.setUserQuizType(this.quizSubscription);
      this.router.navigate(['home/payment-detail'], { queryParams: { typeSubscription: 'QUIZ_WHIZZ' } });
    } else {
      this.util.showErrorAlert('Please fill genearl section state, disctrict, city, school');
    }



  }

  onClickSkipPayment() {
    this.loading.present();
    this.navCtrl.back();
  }

}
