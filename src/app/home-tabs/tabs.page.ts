import { Component, OnInit } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { Router } from "@angular/router";
//import { Network } from "@awesome-cordova-plugins/networ";
import { AlertController, ModalController, Platform } from "@ionic/angular";
import { forkJoin } from "rxjs";
import { DateUtilService } from "../common/util/date-util.service";
import { FirebaseCollection } from "../model/common/firebase-collection";
import { UserDetails } from "../model/user";
import { AuthGuardService } from "../services/auth-guard.service";
import { EventService } from "../services/event.service";
import { LoadingService } from "../services/loading.service";
import { UserServiceService } from "../services/user-service.service";
import { UtilServiceService } from "../services/util-service.service";
declare var navigator: any;

@Component({
  selector: "app-tabs",
  templateUrl: "./tabs.page.html",
  styleUrls: ["./tabs.page.scss"]
})
export class TabsPage implements OnInit {
  userDetails: UserDetails = new UserDetails();
  lastvideo: any;
  public online: boolean = false;
  public backOnline: boolean = false;
  viewType: string = '';
  expiredDays: number = 0;
  constructor(
    private router: Router,
    private userService: UserServiceService,
    private firestore: AngularFirestore,
    private platform: Platform,
    private util: UtilServiceService,
    private alertController: AlertController,
    private modalController: ModalController,
    // private network: Network,
    private authGuardService: AuthGuardService,
    private eventService: EventService,
    private userServiceService: UserServiceService,
    private dateUtilService: DateUtilService,
    private loadingService: LoadingService
  ) { }

  ngOnInit() {
    this.initializeApp();
    this.getGSTParamterDetails();
    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
    });

    if (null != this.userDetails) {
      this.updateFCMToken(this.userDetails);
    }

    // this.validateAndCheckSubscriptionForEvent();

  }

  private isHomeRootUrl(url: string): boolean {
    if (!url) return false;

    // If Events tab outlet is present, it's not "Home root" even if Home outlet is also present.
    if (url.includes('(events:events') || url.includes('/events')) return false;

    const normalized = url.startsWith('/') ? url.slice(1) : url;
    if (/^home\/tabs\/?($|[?#;])/.test(normalized)) return true;
    if (/^home\/tabs\/starkwizzHome\/?($|[?#;])/.test(normalized)) return true;

    return url.includes('(starkwizzHome:starkwizzHome');
  }

  private isSubscribedEventsUrl(url: string): boolean {
    if (!url) return false;
    return (
      url.includes('home/tabs/events/subscribedevents') ||
      url.includes('(events:events/subscribedevents')
    );
  }

  private isEventsMainUrl(url: string): boolean {
    if (!url) return false;

    const normalized = url.startsWith('/') ? url.slice(1) : url;
    if (/^home\/tabs\/events\/?($|[?#;])/.test(normalized)) return true;

    if (url.includes('(events:events') && !url.includes('(events:events/')) return true;

    return false;
  }


  async initializeApp() {
    this.platform.ready().then(() => {
      this.platform.backButton.subscribeWithPriority(100, async () => {
        const topModal = await this.modalController.getTop();
        if (topModal) {
          await topModal.dismiss();
          return;
        }

        const url = this.router.url || '';

        // Custom back behavior:
        // - My Cart -> Events
        // - Events -> Home
        if (this.isSubscribedEventsUrl(url)) {
          this.router.navigate(['home/tabs/events'], { replaceUrl: true });
          return;
        }

        if (this.isEventsMainUrl(url)) {
          this.router.navigate(['home/tabs/starkwizzHome'], { replaceUrl: true });
          return;
        }

        if (this.isHomeRootUrl(url)) {
          this.presentAlertConfirm();
          return;
        }

        if (url.includes('home/tabs')) {
          // For any other tab screen, take the user back to the Home tab first.
          this.router.navigate(['home/tabs/starkwizzHome'], { replaceUrl: true });
          return;
        }
      });
      this.checkNetwork();

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
          navigator['app'].exitApp();
        }
      }]
    });

    await alert.present();
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

  private isFreeTrialUserProfile(): boolean {
    const profileTypes = (this.userDetails?.profileType ?? []).map((t: any) => String(t ?? '').toUpperCase());
    const hasPaid = profileTypes.includes('SUBSCRIBE');
    const hasFreeTrial = profileTypes.includes('FREETRAIL') || profileTypes.includes('FREETRIAL');
    return hasFreeTrial && !hasPaid;
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

  checkNetwork() {
    window.addEventListener('offline', () => {
      this.online = false;
      this.util.showToast('network was disconnected', 'red', 'bottom');
    });
    window.addEventListener('online', () => {
      this.online = true;
      this.backOnline = true;
      this.util.showToast('network Connected', 'green', 'bottom');
      setTimeout(data => {
        this.backOnline = false;
      }, 2000);
    });
    // watch network for a disconnection
    // this.network.onDisconnect().subscribe(() => {
    //   console.log('network was disconnected :-(');
    //   this.util.showToast('network was disconnected', 'red', 'bottom');
    //   this.online = false;
    // });
  }


  updateFCMToken(user: any) {
    this.authGuardService.getFCMToken().subscribe(token => {
      if (null != user && token) {
        this.firestore.collection("users").doc(user.id).update({
          token: token
        }).then(result => {
          console.log('token update');
          user.token = token;
          this.userService.setUserDetails(user);
        });
      }
    });
  }

  onClickDeals() {
    this.router.navigate(['home/bookFest']);
  }


  onClickHomes() {
    this.loadingService.presentLoading(3000);
    this.router.navigate(['home/tabs/starkwizzHome']);
  }

  onClickHubs() {
    this.loadingService.present();
    this.router.navigate(['home/hubs']);
  }

  onClickShowcase() {
    this.router.navigate(['home/tabs/showcase']);
  }

  onClickDynamo() {
    this.loadingService.present();
    this.validateAndCheckSubscriptionForDynamo();
  }

  onClickEvents() {
    this.loadingService.present();
    this.router.navigate(['home/tabs/events']);
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


  onClickQuizWhizz() {
    this.loadingService.present();
    this.validateAndCheckSubscriptionForQuizWhizz();
  }


  validateAndCheckSubscriptionForDynamo() {
    const query = this.firestore.collection("user_subscription").ref
      .where("userId", "==", this.userDetails.id)
      .where("boardName", "==", this.userDetails.boardName)
      .where("classId", "==", this.userDetails.classId)
      // Don't filter by status: we need to detect expired free-trial too (e.g. FREETRIAL/FREETRAIL variations).
    query
      .get()
      .then(async (subscription: any) => {
        if (subscription.empty) {
          this.userService.setDynamoSubscription(null);
          this.router.navigate(['home/combo-offer'], { queryParams: { subscription: 'NEW' } });
          return;
        }

        let activeSubscription: any = null;
        const expiredRecords: Array<{ id: string; wasFreeTrial: boolean }> = [];
        let expiredFreeTrialId: string | null = null;

        subscription.forEach((data: any) => {
          const subscriptionDetails: any = data.data();
          const docId = subscriptionDetails?.id ?? data.id;
          const isExpired = this.dateUtilService.isExpired(subscriptionDetails.expiryDate);

          if (isExpired) {
            const wasFreeTrial = this.isFreeTrialSubscription(subscriptionDetails);
            if (docId) expiredRecords.push({ id: docId, wasFreeTrial });
            if (!expiredFreeTrialId && wasFreeTrial && docId) {
              expiredFreeTrialId = docId;
            }
          } else {
            activeSubscription = subscriptionDetails;
          }
        });

        await Promise.all(
          expiredRecords.map(({ id, wasFreeTrial }) =>
            this.firestore.collection('user_subscription').doc(id).update(
              wasFreeTrial ? { status: 'EXPIRED', wasFreeTrial: true } : { status: 'EXPIRED' }
            )
          ),
        );

        if (activeSubscription) {
          this.userService.setDynamoSubscription(activeSubscription);
          this.router.navigate(['home/dynamo/beforePaid']);
          return;
        }

        if (expiredFreeTrialId || this.isFreeTrialUserProfile()) {
          await this.presentFreeTrialEndedAlert('DYNAMO');
        }
        this.router.navigate(['home/combo-offer'], { queryParams: { subscription: 'EXPIRED' } });
      })
      .catch(() => {
        this.userService.setDynamoSubscription(null);
        this.router.navigate(['home/combo-offer'], { queryParams: { subscription: 'NEW' } });
      });

  }


  validateAndCheckSubscriptionForQuizWhizz() {
    const query = this.firestore.collection("user_subscription_quizwhizz").ref
      .where("userId", "==", this.userDetails.id)
      .where("boardName", "==", this.userDetails.boardName)
      .where("classId", "==", this.userDetails.classId)
      // Don't filter by status: we need to detect expired free-trial too (e.g. FREETRIAL/FREETRAIL variations).
    query
      .get()
      .then(async (subscription: any) => {
        if (subscription.empty) {
          this.userService.setQuizWhizzSubjectSubscribed(null);
          this.router.navigate(['home/combo-offer'], { queryParams: { subscription: 'NEW' } });
          return;
        }

        let activeSubscription: any = null;
        const expiredRecords: Array<{ id: string; wasFreeTrial: boolean }> = [];
        let expiredFreeTrialId: string | null = null;

        subscription.forEach((data: any) => {
          const subscriptionDetails: any = data.data();
          const docId = subscriptionDetails?.id ?? data.id;
          const isExpired = this.dateUtilService.isExpired(subscriptionDetails.expiryDate);

          if (isExpired) {
            const wasFreeTrial = this.isFreeTrialSubscription(subscriptionDetails);
            if (docId) expiredRecords.push({ id: docId, wasFreeTrial });
            if (!expiredFreeTrialId && wasFreeTrial && docId) {
              expiredFreeTrialId = docId;
            }
          } else {
            activeSubscription = subscriptionDetails;
          }
        });

        await Promise.all(
          expiredRecords.map(({ id, wasFreeTrial }) =>
            this.firestore.collection('user_subscription_quizwhizz').doc(id).update(
              wasFreeTrial ? { status: 'EXPIRED', wasFreeTrial: true } : { status: 'EXPIRED' }
            )
          ),
        );

        if (activeSubscription) {
          this.loadingService.presentLoading(3000);
          this.userService.setQuizWhizzSubjectSubscribed(activeSubscription);
          this.getAllQuizWhizzEvents();
          return;
        }

        if (expiredFreeTrialId || this.isFreeTrialUserProfile()) {
          await this.presentFreeTrialEndedAlert('QUIZWHIZZ');
        }
        this.router.navigate(['home/combo-offer'], { queryParams: { subscription: 'EXPIRED' } });
      })
      .catch(() => {
        this.userService.setQuizWhizzSubjectSubscribed(null);
        this.router.navigate(['home/combo-offer'], { queryParams: { subscription: 'NEW' } });
      });

  }


  validateAndCheckSubscriptionForEvent() {
    // Events are not gated by free trial/subscription checks. Always allow navigation.
    this.router.navigate(['home/tabs/events']);
  }

  getGSTParamterDetails() {
    this.userServiceService.getGSTParamters();
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

}
