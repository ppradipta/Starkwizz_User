import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { forkJoin } from 'rxjs';
import { DateUtilService } from 'src/app/common/util/date-util.service';
import { FirebaseCollection } from 'src/app/model/common/firebase-collection';
import { UserDetails } from 'src/app/model/user';
import { AuthService } from 'src/app/services/auth.service';
import { EventService } from 'src/app/services/event.service';
import { LoadingService } from 'src/app/services/loading.service';
import { UserServiceService } from 'src/app/services/user-service.service';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-starkwizz-home',
  templateUrl: './starkwizz-home.component.html',
  styleUrls: ['./starkwizz-home.component.scss'],
})
export class StarkwizzHomeComponent implements OnInit {
  userDetails: UserDetails = {} as UserDetails;
  appVersion: string;
  appDetails: any = {};
  greetingText: string;
  notificationCount = 0;
  currentDate: any = {};
  subscription: any = {};
  rewardPont: number = 0;
  isLoading = false;
  constructor(
    private userService: UserServiceService,
    private dateUtilService: DateUtilService,
    private router: Router,
    private authService: AuthService,
    private firestore: AngularFirestore,
    private loadingService: LoadingService,
    private alertController: AlertController,
    private loading: LoadingService,
    private eventService: EventService,
  ) { }

  ngOnInit() {
    localStorage.setItem("app_version_Key", JSON.stringify(environment.versionNumber));

    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
    });

    this.appVersion = localStorage.getItem('app_version_Key');

    this.greetingText = this.dateUtilService.generateGreetings();

  }

  handleRefresh(event) {
    setTimeout(() => {
      this.ngOnInit();
      event.target.complete();
    }, 3000);
  }

  goToNotification() {
    this.router.navigate(['home/notification']);
  }

  goToProfile() {
    this.router.navigate(['home/profile']);
  }

  onClickDynamo() {
    this.loading.present();
    // Query for ALL subscriptions (don't filter by status to catch expired ones too)
    const query = this.firestore.collection("user_subscription").ref
      .where("userId", "==", this.userDetails.id)
      .where("boardName", "==", this.userDetails.boardName)
      .where("classId", "==", this.userDetails.classId);
    
    query.get().then((subscription: any) => {
      if (!subscription.empty) {
        let hasActiveSubscription = false;
        let expiredSubscriptionId: string = '';
        let wasFreeTrial = (this.userDetails?.profileType ?? []).map((t: any) => String(t ?? '').toUpperCase()).some((t) => t === 'FREETRAIL' || t === 'FREETRIAL');
        
        subscription.forEach((data: any) => {
          let subscriptionDetails: any = data.data();
          const isExpired = this.dateUtilService.isExpired(subscriptionDetails.expiryDate);
          
          if (!isExpired) {
            // Found an active (non-expired) subscription
            hasActiveSubscription = true;
            this.userService.setDynamoSubscription(subscriptionDetails);
          } else {
            // Subscription is expired - update status in Firestore
            const isFreeTrial = this.isFreeTrialSubscription(subscriptionDetails);
            wasFreeTrial = wasFreeTrial || isFreeTrial;
            expiredSubscriptionId = subscriptionDetails.id;
            this.firestore.collection('user_subscription').doc(subscriptionDetails.id).update({
              status: 'EXPIRED',
              ...(isFreeTrial ? { wasFreeTrial: true } : {}),
            });
          }
        });
        
        if (hasActiveSubscription) {
          // User has active subscription - allow access
          this.router.navigate(['home/dynamo/beforePaid']);
        } else {
          // All subscriptions are expired - redirect to subscription page
          if (wasFreeTrial) {
            this.presentFreeTrialEndedAlert('DYNAMO').then(() => {
              this.router.navigate(['home/combo-offer'], { queryParams: { subscription: 'EXPIRED' } });
            });
            return;
          }
          this.router.navigate(['home/combo-offer'], { queryParams: { subscription: 'EXPIRED' } });
        }
      } else {
        // No subscription found - new user
        this.userService.setDynamoSubscription(null);
        this.router.navigate(['home/combo-offer'], { queryParams: { subscription: 'NEW' } });
      }
    }).catch((error) => {
      console.error('Error checking subscription:', error);
      this.router.navigate(['home/combo-offer'], { queryParams: { subscription: 'NEW' } });
    });
  }

  onClickEvents() {
    this.loading.present();
    // Events are excluded from free trial gating. Always allow navigation.
    this.router.navigate(['home/tabs/events']);
  }

  private isFreeTrialSubscription(subscriptionDetails: any): boolean {
    const status = String(subscriptionDetails?.status ?? '').toUpperCase();
    const subscriptionType = String(subscriptionDetails?.subscriptionType ?? '').toUpperCase();
    const subsType = String(subscriptionDetails?.subsType ?? '').toUpperCase();
    const recordType = String(subscriptionDetails?.type ?? '').toUpperCase();
    const paymentMode = String(subscriptionDetails?.paymentmode ?? subscriptionDetails?.paymentMode ?? '').toUpperCase();
    const paymentId = String(subscriptionDetails?.paymentId ?? '').toUpperCase();
    return (
      Boolean(subscriptionDetails?.wasFreeTrial) ||
      status === 'FREETRIAL' ||
      status === 'FREETRAIL' ||
      subscriptionType === 'FREETRIAL' ||
      subscriptionType === 'FREETRAIL' ||
      subsType === 'FREETRIAL' ||
      subsType === 'FREETRAIL' ||
      recordType === 'FREETRIAL' ||
      recordType === 'FREETRAIL' ||
      paymentMode === 'FREETRIAL' ||
      paymentMode === 'FREETRAIL' ||
      paymentId === 'FREETRIAL' ||
      paymentId === 'FREETRAIL' ||
      Boolean(subscriptionDetails?.isFreeTrial)
    );
  }

  private freeTrialEndedMessage(context: 'DYNAMO' | 'QUIZWHIZZ'): string {
    if (context === 'DYNAMO') {
    //   return [
    //     "You’ve completed your free learning trial for the Dynamo Test series!",
    //     "Congratulations, you’ve already taken the first step toward better understanding, confidence, and performance.",
    //     "Subscribe now and unlock full access to continue learn, practice, and growth without limits.",
    //   ].join('\n');
    // }

    // return [
    //   "You’ve completed your free learning trial for the Quiz-Whizz contest!",
    //   "Congratulations, you’ve already taken the first step toward better understanding, confidence, and performance.",
    //   'Unlock full access to continue participate in the contests and gain unlimited academic and informative knowledge without limits.',
    // ].join('\n');
    return [
        
        "✅ You’ve completed your free practice for Dynamo.",
        "🚀 Great Effort! You’re Doing Great!",
        "Unlock full access to continue practicing all subjects and chapters.",
        "✔ All Subjects & Chapters, Unlimited Tests.",
        "✔ Quarterly, Mid-Term, & Benchmark Tests.",
        "✔ Solutions & Explanation.",
        "✔ Instant Results, & Detailed Report.",
        "👉 Unlock all subjects, chapters, tests, quizzes, and talent search to continue learning without limits.",
        "Ask your parent to complete the subscription.",
        "✔ No auto-renewal",
        "✔ No Ads.",
        "✔ Safe & child-friendly",
      ].join('\n');
    }
    return [
       
        "✅ You’ve completed your free practice for Quiz-Whizz.",
        "👍 Great job participating in Quiz-Whizz!",
        "🧠 Ready for the Next Challenge?",
        "Unlock full access to participate in weekly quizzes and competitions.",
        "✔ Sunday Quiz Battles – Mind Game.",
        "✔ Real-World Questions, Exciting Leaderboard.",
        "✔ Earned Points, Unlock Exciting Badges & Rewards.",
        "✔ View Your Rank On School, District, State, & National Level.",
        "👉 Unlock all quiz contests, practice tests, and events to continue learning without limits. ",
        "Ask your parent to complete the subscription.",
        "✔ No auto-renewal",
        "✔ No Ads.",
        "✔ Safe & child-friendly",
    ].join('\n');
  }

  async presentFreeTrialEndedAlert(context: 'DYNAMO' | 'QUIZWHIZZ') {
    const alert = await this.alertController.create({
      header: 'Free Trial Ended',
      message: this.freeTrialEndedMessage(context),
      cssClass: 'customAlert updateVersion freeTrialAlert',
      backdropDismiss: false,
      buttons: [
        {
          text: 'OK',
        }
      ]
    });

    await alert.present();
  }

  onClickQuizWhizz() {
    this.loading.present();
    // Query for ALL subscriptions (don't filter by status to catch expired ones too)
    const query = this.firestore.collection("user_subscription_quizwhizz").ref
      .where("userId", "==", this.userDetails.id)
      .where("boardName", "==", this.userDetails.boardName)
      .where("classId", "==", this.userDetails.classId);
    
    query.get().then((subscription: any) => {
      if (!subscription.empty) {
        let hasActiveSubscription = false;
        let expiredSubscriptionId: string = '';
        let wasFreeTrial = (this.userDetails?.profileType ?? []).map((t: any) => String(t ?? '').toUpperCase()).some((t) => t === 'FREETRAIL' || t === 'FREETRIAL');
        
        subscription.forEach((data: any) => {
          let subscriptionDetails: any = data.data();
          const isExpired = this.dateUtilService.isExpired(subscriptionDetails.expiryDate);
          
          if (!isExpired) {
            // Found an active (non-expired) subscription
            hasActiveSubscription = true;
            this.userService.setQuizWhizzSubjectSubscribed(subscriptionDetails);
          } else {
            // Subscription is expired - update status in Firestore
            const isFreeTrial = this.isFreeTrialSubscription(subscriptionDetails);
            wasFreeTrial = wasFreeTrial || isFreeTrial;
            expiredSubscriptionId = subscriptionDetails.id;
            this.firestore.collection('user_subscription_quizwhizz').doc(subscriptionDetails.id).update({
              status: 'EXPIRED',
              ...(isFreeTrial ? { wasFreeTrial: true } : {}),
            });
          }
        });
        
        if (hasActiveSubscription) {
          // User has active subscription - allow access
          this.loadingService.presentLoading(3000);
          this.getAllQuizWhizzEvents();
        } else {
          // All subscriptions are expired - redirect to subscription page
          if (wasFreeTrial) {
            this.presentFreeTrialEndedAlert('QUIZWHIZZ').then(() => {
              this.router.navigate(['home/combo-offer'], { queryParams: { subscription: 'EXPIRED' } });
            });
            return;
          }
          this.router.navigate(['home/combo-offer'], { queryParams: { subscription: 'EXPIRED' } });
        }
      } else {
        // No subscription found - new user
        this.userService.setQuizWhizzSubjectSubscribed(null);
        this.router.navigate(['home/combo-offer'], { queryParams: { subscription: 'NEW' } });
      }
    }).catch((error) => {
      console.error('Error checking subscription:', error);
      this.router.navigate(['home/combo-offer'], { queryParams: { subscription: 'NEW' } });
    });
  }

  onClickHubs() {
    this.loading.present();
    this.router.navigate(['home/hubs']);
  }

  getAllSubscribedEvents(userDetails: any) {
    this.firestore.collection('user_event_subscription', ref => ref
      .where('userId', '==', userDetails.id))
      .valueChanges().subscribe((events: any[]) => {
        let allevents: any[] = [];
        if (null != events && events.length > 0) {
          events.forEach(subscribeRecord => {
            if (null != subscribeRecord && null != subscribeRecord.events) {
              allevents.push(...subscribeRecord.events);
            }
          });
        }
        this.userService.setSubscribedUserEvents(allevents);
      });

  }

  getAllQuizWhizzEvents() {
    const currentMonth = this.dateUtilService.getCurrentMonth();
    const nextMonth = this.dateUtilService.get12Months()?.[1]?.title ?? currentMonth;

    const queryByMonth = (month: string) =>
      this.firestore.collection(FirebaseCollection.EVENTS, ref => ref
        .where('type', '==', 'QUIZWHIZZ EXAM')
        .where('classId', '==', this.userDetails.classId)
        .where('boardId', '==', this.userDetails.boardId)
        .where('eventMonth', '==', month)
        .where('status', 'in', ['UPCOMING', 'ACTIVE', 'COMPLETED']))
        .get();

    forkJoin([queryByMonth(currentMonth), queryByMonth(nextMonth)]).subscribe(([curSnap, nextSnap]: any[]) => {
      const docs = [...(curSnap?.docs ?? []), ...(nextSnap?.docs ?? [])];
      const uniqueById = new Map<string, any>();
      docs.forEach((d: any) => uniqueById.set(d.id, d));
      this.userService.setQuizzWhizzEvents(Array.from(uniqueById.values()));
      this.router.navigate(['home/quizwhizz']);
    });
  }

  getAllNotifications() {
    this.loading.presentLoading(2000);
    this.firestore.collection(FirebaseCollection.USER_NOTIFICATION, ref => ref
      .where('userId', '==', this.userDetails.id))
      .valueChanges().subscribe((requests: any[]) => {
        this.notificationCount = requests.filter(message => true && message.status == 'ACTIVE').length;
      });
  }

  onClickCancelSubscription() {
    this.loading.presentLoading(2000);

    let currentDate = this.dateUtilService.getCurrentDateWithYYYYMMDD();

    const query = this.firestore.collection("transaction").ref
      .where("userid", "==", this.userDetails.id)
      .where("subsType", "==", 'SUBSCRIBE')
    query
      .get().then((subscription: any) => {
        if (!subscription.empty) {
          subscription.forEach((data: any) => {
            this.subscription = data.data();
            let afterThreeDay = this.dateUtilService.addDaysToInputDate(this.subscription.startDate, 3);
            let inBetween = this.dateUtilService.checkDateInBetween(currentDate, this.subscription.startDate, afterThreeDay);
            if (inBetween) {
              this.subscription.subscriptionCancel = 'ACTIVE';
            } else {
              this.subscription.subscriptionCancel = 'INACTIVE';
            }
          });
        }
      });
  }

  goToSubscription() {
    this.onClickCancelSubscription();
    this.router.navigate(['home/cancel-subscription']);
  }

}
