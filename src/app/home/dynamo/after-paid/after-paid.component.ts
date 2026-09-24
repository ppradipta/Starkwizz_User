import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { DateUtilService } from 'src/app/common/util/date-util.service';
import { UserDetails } from 'src/app/model/user';
import { UserHelperService } from 'src/app/services/helper/user-helper.service';
import { UserServiceService } from 'src/app/services/user-service.service';
import { UtilServiceService } from 'src/app/services/util-service.service';

@Component({
  selector: 'app-after-paid',
  templateUrl: './after-paid.component.html',
  styleUrls: ['./after-paid.component.scss'],
})
export class AfterPaidComponent implements OnInit {

  subjectList = [
    {
      name: 'Scholastic',
      subject: [
        { name: 'English Grammer', colorCode: '#9663C4' },
        { name: 'Science', colorCode: '#2454B2' },
        { name: 'Mathematics', colorCode: '#E27676' },
        { name: 'Social Studies', colorCode: '#877AAA' },
        { name: 'Physics', colorCode: '#E18688' },
        { name: 'Chemistry', colorCode: '#288AB8' },
        { name: 'History & Civics', colorCode: '#44BFB8' },
        { name: 'Geography', colorCode: '#D395B9' },
        { name: 'Biology', colorCode: '#A373C8' },
        { name: 'General knowledge', colorCode: '#B47D96' },
        { name: 'EVS', colorCode: '#D58790' },
        { name: 'Computer', colorCode: '#3090BB' },
      ]
    },
    {
      name: 'Quiz Whizz',
      subject: [
        { name: 'Quiz Whizz', colorCode: '#9663C4' },
      ]
    },
    {
      name: 'Test',
      subject: [
        { name: 'Diagnostic Test', colorCode: '#9663C4' },
        { name: 'Progressive Test', colorCode: '#2454B2' },
        { name: 'Proficiency Test', colorCode: '#E27676' },
        { name: '1st Benchmark Test', colorCode: '#877AAA' },
        { name: '2st Benchmark Test', colorCode: '#E18688' },
        { name: 'Final Benchmark Test', colorCode: '#288AB8' },
      ]
    },
    {
      name: 'Events',
      subject: [
        { name: 'Scholarship Test', colorCode: '#9663C4' },
        { name: 'Award Event Test', colorCode: '#2454B2' },
        { name: 'Sponsred Event Test', colorCode: '#E27676' },
      ]
    },
  ];

  userSubjectSubscriptions: any;
  userDetails: UserDetails = new UserDetails();
  currentMonth: any;
  subscription: string = '';
  constructor(
    private navCtrl: NavController,
    private router: Router,
    private firestore: AngularFirestore,
    private userService: UserServiceService,
    private dateUtilService: DateUtilService,
    private userHelperService: UserHelperService,
    private route: ActivatedRoute,
    private util: UtilServiceService,
    private alertController: AlertController,
  ) { }

  ngOnInit() {

    this.currentMonth = this.dateUtilService.getMonth();
    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
    });
  //  this.validateAndCheckSubscriptionForEvent();
  }




  // validateAndCheckSubscriptionForEvent() {
  //   const query = this.firestore.collection("user_subscription").ref
  //     .where("userId", "==", this.userDetails.id)
  //     .where("boardName", "==", this.userDetails.boardName)
  //     .where("classId", "==", this.userDetails.classId);
  //   query
  //     .get().then((subscription: any) => {
  //       if (!subscription.empty) {
  //         subscription.forEach((data: any) => {
  //           let subscriptionDetails: any = data.data();
  //           let expiredDays = this.dateUtilService.getExpiredDays(subscriptionDetails.expiryDate);
  //           if (expiredDays > 1) {
  //             this.router.navigate(['home/combo-offer']);
  //           }
  //         });
  //       } else {
  //         this.router.navigate(['home/combo-offer']);
  //       }
  //     });

  // }

  goBack() {
    this.navCtrl.back();
  }

  async presentAlertForAppUpdate() {
    const alert = await this.alertController.create({
      message: 'Your Subscription has been expired, Please Renew',
      cssClass: 'customAlert updateVersion',
      header: 'Error',
      backdropDismiss: false,
      buttons: [{
        text: 'Renew',
        handler: () => {
          console.log('Confirm YES: Yeahh');

        }
      }]
    });
    await alert.present();
  }

  onClicksubscription() {
    this.router.navigate(['home/dynamo/subscription'], { queryParams: { freeTrial: false, subscriptionType: 'EXAM' } });
  }

  onClickFreeTrial() {
    if (this.userDetails.profileType.length > 0) {
      if (!this.userDetails.profileType.includes('FREETRAIL')) {
        this.userDetails.profileType.push('FREETRAIL');
        this.userService.setUserDetails(this.userDetails);
      }
    }
    this.router.navigate(['home/dynamo/subscription'], { queryParams: { freeTrial: true, subscriptionType: 'EXAM' } });
  }


}
