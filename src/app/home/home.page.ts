import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
//import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { AlertController, ModalController, Platform } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { register } from 'swiper/element/bundle';
import { LogoutModalComponent } from '../common/component/logout-modal/logout-modal.component';
import { FirebaseCollection } from '../model/common/firebase-collection';
import { UserDetails } from '../model/user';
import { UserServiceService } from '../services/user-service.service';
import { UtilServiceService } from '../services/util-service.service';

register();
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  appPages: any[] = [];
  userDetails: UserDetails = new UserDetails();
  subscribeUserDetails: any;
  version: string = environment.version;
  lastvideo: any;
  public online: boolean = false;
  public backOnline: boolean = false;
  constructor(
    private firestore: AngularFirestore,
    private userService: UserServiceService,
    private router: Router,
    //private appVersion: AppVersion,
    private platform: Platform,
    private alertController: AlertController,
    private util: UtilServiceService,
    private modalController: ModalController,
    private socialSharing: SocialSharing,
  ) {

  }

  ngOnInit() {
    this.initializeApp();
    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
      if (this.userDetails.parentId || 'PARENT' == this.userDetails.userType) {
        this.getPagesForParent();
      } else if ('student' == this.userDetails?.userType?.toLocaleLowerCase() || 'student' == this.userDetails.userType) {
        this.getPagesForStudent();
      }
    });

  }

  ionViewWillEnter() {
    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
      if (this.userDetails.parentId || 'PARENT' == this.userDetails.userType) {
        this.getPagesForParent();
      } else if ('student' == this.userDetails?.userType?.toLocaleLowerCase()) {
        this.getPagesForStudent();
      }
    });
  }
  async initializeApp() {
    this.platform.ready().then(() => {
      this.platform.backButton.subscribeWithPriority(10, () => {
        // Back handling for Tabs is centralized in `TabsPage`.
        // Do not show exit dialog on Events/My Cart from here.
        const url = this.router.url || '';
        if (url.includes('home/tabs/events/subscribedevents') || url.includes('home/tabs/events')) {
          return;
        }
      });
    });
  }





  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      // header: 'Confirm!',
      message: 'Are you sure you want to exit the app?',
      buttons: [{
        text: 'NO',
        role: 'NO',
        cssClass: 'secondary',
        handler: (blah) => {
          this.router.navigate(['home/tabs']);
        }
      }, {
        text: 'YES',
        handler: () => {
          //navigator['app'].exitApp();
        }
      }]
    });

    await alert.present();
  }

  changePage(page: any) {

    if (page.title === 'Logout') {
      this.presentAlertConfirmForLogOut();
    } else if (page.title == 'Profile') {
      this.router.navigate(['home/profile']);
    } else if (page.title == 'Dashboard') {
      this.router.navigate(['home/dashboard']);
    } else if (page.title == 'My Syllabus') {
      this.router.navigate(['home/syllabus']);
    } else if (page.title == 'Account') {
      this.router.navigate(['home/account']);
    } else if (page.title == 'Subscription') {
      this.router.navigate(['home/subscription']);
    } else if (page.title == 'Friends') {
      this.router.navigate(['home/friends']);
    } else if (page.title == 'Groups') {
      this.router.navigate(['home/groups']);
    } else if (page.title == 'Setting') {
      this.router.navigate(['home/setting']);
    } else if (page.title == 'Rank') {
      this.router.navigate(['home/rank']);
    } else if (page.title == 'Transaction') {
      this.router.navigate(['home/txnhistory']);
    } else if (page.title == 'Achievement') {
      this.router.navigate(['home/achievement']);
    } else if (page.title == 'My Wallet') {
      this.router.navigate(['home/reward']);
    } else if (page.title == 'Know More') {
      this.router.navigate(['home/KnowMore-info'], { queryParams: { TYPES: 'SUBSCRIPTION' } });
    } else if (page.title == 'Feedback') {
      this.router.navigate(['home/feedback']);
    } else if (page.title == 'Rating') {
      this.router.navigate(['home/rating']);
    } else if (page.title == 'Lesson') {
      this.router.navigate(['home/setup-lesson']);
    } else if (page.title == 'Subscription') {
      this.router.navigate(['home/subscription']);
    } else if (page.title == 'Claim') {
      this.router.navigate(['home/claim']);
    } else if (page.title == 'Deals') {
      this.router.navigate(['home/bookFest']);
    } else if (page.title == 'Share') {
      let shareText = `StarKwizz App your profile code  : ${this.userDetails.applicationId}\n`;
      this.socialSharing.share(shareText, "StarKwizz APP", '', "https://play.google.com/store/apps/details?id=com.lavni.starkwizz").then((res: any) => {
        console.log(res);
        this.util.showToast(('Share Sucessfully!!!'), 'success', 'bottom');
      }, (err: any) => {
        console.log(err);
        alert(err);
        this.util.showToast(('Unable to share!!!'), 'success', 'bottom');
      });
    } else if (page.title == 'FAQ') {
      this.router.navigate(['home/faq']);
    } else if (page.title == 'QR Code') {
      this.router.navigate(['home/qr-code']);
    } else if (page.title == 'Subscription Details') {
      this.router.navigate(['home/subscription-details']);
    }
  }

  async presentAlertConfirmForLogOut() {
    const modal = await this.modalController.create({
      component: LogoutModalComponent,
      cssClass: 'logoutModal',
      backdropDismiss: false,
    });
    await modal.present();
  }






  getUserDetails(uid: any) {
    this.firestore.collection('users').doc(uid).get().subscribe((respone: any) => {
      if (respone.exists) {
        this.userDetails = respone.data();
        this.userService.setUserDetails(this.userDetails);
        this.getUserSubcribeSubjects();
        this.subscribeUserDetails.unsubscribe();
      }
    })
  }

  getPagesForStudent() {
    this.appPages = [
      {
        title: "Profile",
        imageURL: "assets/images/menu-icons/profile.svg",
        // url: "home/profile",
        // routerDirection: "forward",
      },
      {
        title: "Dashboard",
        imageURL: "assets/images/menu-icons/showcase-icon.svg",
      },
      // {
      //   title: "My Syllabus",
      //   imageURL: "assets/images/menu-icons/book.svg",
      //   // url: "home/syllabus",
      //   // routerDirection: "forward",
      // },
      // {
      //   title: "Transaction",
      //   imageURL: "assets/images/menu-icons/friends.svg",
      //   url: "home/txnhistory",
      //   routerDirection: "forward",
      // },
      // {
      //   title: "Deals",
      //   imageURL: "assets/images/menu-icons/deal.svg",
      //   url: "home/bookFest",
      //   routerDirection: "forward",
      // },
      // { title: "Friends", imageURL: "assets/images/menu-icons/friends.svg" },
      // { title: "Groups", imageURL: "assets/images/menu-icons/groups.svg" },
      //  { title: "Lesson", imageURL: "reader" },
      {
        title: "Achievement",
        imageURL: "assets/images/menu-icons/achievement.svg",
        // url: "home/achievement",
        // routerDirection: "forward",
      },
      {title: "Subscription Details", imageURL: "assets/images/menu-icons/subscription.svg" },
      // {
      //   title: "My Wallet",
      //   imageURL: "assets/images/menu-icons/reward.svg",
      //   // url: "home/reward",
      //   // routerDirection: "forward",
      // },
      {
        title: "Know More",
        imageURL: "assets/images/knowledge.svg",
        // url: "home/KnowMore-info",
        // routerDirection: "forward",
      },
      // { title: "Rank", imageURL: "assets/images/menu-icons/rank.svg" },
      // { title: "Claim", imageURL: "assets/svg/cash-outline.svg" },
      { title: "Setting", imageURL: "assets/images/menu-icons/setting.svg" },
      { title: "Share", imageURL: "assets/images/menu-icons/share.svg" },
      { title: "Rating", imageURL: "assets/images/menu-icons/rating.svg" },
      // { title: "Whatsapp", imageURL: "assets/images/menu-icons/whatsapp.svg" },
      // { title: "Email", imageURL: "assets/images/menu-icons/email.svg" },
      {title: "FAQ", imageURL: "assets/images/menu-icons/faq.svg" },
      { title: "QR Code", imageURL: "assets/images/menu-icons/qr-code.svg" },
      {
        title: "Feedback",
        imageURL: "assets/images/menu-icons/feedback.svg",
        // url: "home/syllabus",
        // routerDirection: "forward",
      },
      { title: "Logout", imageURL: "assets/images/menu-icons/logout.svg" },

    ];
  }

  getPagesForParent() {
    this.appPages = [
      {
        title: "Profile",
        imageURL: "assets/images/menu-icons/profile.svg",
        // url: "home/profile",
        // routerDirection: "forward",
      },
      {
        title: "Dashboard",
        imageURL: "assets/images/menu-icons/showcase-icon.svg",
      },
      {
        title: "My Syllabus",
        imageURL: "assets/images/menu-icons/book.svg",
        // url: "home/syllabus",
        // routerDirection: "forward",
      },
      {
        title: "Account",
        imageURL: "assets/images/menu-icons/account.svg",
        // url: "home/account",
        // routerDirection: "forward",
      },
      {
        title: "Subscription",
        imageURL: "assets/images/menu-icons/subscriptions.svg",
        // url: "home/subscription",
        // routerDirection: "forward",
      },
      {
        title: "Achievement",
        imageURL: "assets/images/menu-icons/achievement.svg",
        // url: "home/achievement",
        // routerDirection: "forward",
      },
      // {
      //   title: "My Wallet",
      //   imageURL: "assets/images/menu-icons/reward.svg",
      //   // url: "home/reward",
      //   // routerDirection: "forward",
      // },
      {
        title: "Know More",
        imageURL: "assets/images/knowledge.svg",
        // url: "home/KnowMore-info",
        // routerDirection: "forward",
      },
      // { title: "Rank", imageURL: "assets/images/menu-icons/rank.svg" },
      // { title: "Claim", imageURL: "assets/svg/cash-outline.svg" },
      { title: "Setting", imageURL: "assets/images/menu-icons/setting.svg" },
      { title: "Share", imageURL: "assets/images/menu-icons/share.svg" },
      { title: "Rating", imageURL: "assets/images/menu-icons/rating.svg" },
      // { title: "Whatsapp", imageURL: "assets/images/menu-icons/whatsapp.svg" },
      // { title: "Email", imageURL: "assets/images/menu-icons/email.svg" },
      {title: "FAQ", imageURL: "assets/images/menu-icons/faq.svg" },
      { title: "QR Code", imageURL: "assets/images/menu-icons/qr-code.svg" },
      { title: "Logout", imageURL: "assets/images/menu-icons/logout.svg" },
    ];
  }

  getAppVersion() {
    // this.appVersion.getVersionNumber().then(result => {
    //   this.version = result;
    // })
  }


  getUserSubcribeSubjects() {
    const query = this.firestore.collection(FirebaseCollection.USER_SUBSCRIPTION);
    query.ref
      .where('userId', '==', this.userDetails.id)
      .get().then((subj: any) => {
        if (!subj.empty) {
          subj.forEach((data: any) => {
            let result = data.data();
            this.userService.setSubscribedSubjectDetails(result);
          });
        }
      });

  }
}
