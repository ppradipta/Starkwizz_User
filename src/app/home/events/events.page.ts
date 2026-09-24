import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { AlertController, IonModal, ModalController } from '@ionic/angular';
import * as moment from 'moment-timezone';
import { DateUtilService } from 'src/app/common/util/date-util.service';
import { FirebaseCollection } from 'src/app/model/common/firebase-collection';
import { UserDetails } from 'src/app/model/user';
import { EventService } from 'src/app/services/event.service';
import { UserHelperService } from 'src/app/services/helper/user-helper.service';
import { LoadingService } from 'src/app/services/loading.service';
import { UserServiceService } from 'src/app/services/user-service.service';
import { UserServiceService as UserServiceServiceAlias } from 'src/app/services/user-service.service';
import { UtilServiceService } from 'src/app/services/util-service.service';
import { environment } from 'src/environments/environment.prod';
import { register } from 'swiper/element/bundle';
import { SubjectAppearComponent } from '../dynamo/subject-appear/subject-appear.component';
import { Checkout } from 'capacitor-razorpay';
import { AuthService } from 'src/app/services/auth.service';
import { filter, take } from 'rxjs/operators';
register();
declare var RazorpayCheckout: any;

@Component({
  selector: 'app-events',
  templateUrl: './events.page.html',
  styleUrls: ['./events.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EventsPage implements OnInit {

  @ViewChild(IonModal) eventInfoModal: IonModal = {} as IonModal;
  userDetails: UserDetails = {} as UserDetails;
  notificationCount: number = 0;
  subscribedUserEvents: any[] = [];
  recentEvents: any[] = [];
  expiredEvents: any[] = [];
  freeEvents: any[] = [];
  discounts: any[] = [];
  selectedForSubscribe: any[] = [];
  discountedAmount: number = 0;
  totalAmount: number = 0;
  discountTypeValue: number = 0;
  gstAmount: number = 0;
  appliedDiscount: any;
  currentMonth: string = '';
  scrollImages: any[] = [];
  scrollskleton: boolean = true;
  contentskleton: boolean = true;
  segmentValue: string = 'PAIDEVENTS';
  eventScrollDetail: any = {};
  isEventInfoModalOpen: boolean = false;
  selectedEvent: any = {};
  gstDetails: any = {};
  appDetails: any = {};
  user: any = {};
  appVersion: string;
  subscriptionDetails: any = {};
  private userEventByEventId = new Map<string, any>();
  constructor(private userService: UserServiceService,
    private router: Router,
    private firestore: AngularFirestore,
    private util: UtilServiceService,
    private dateUtilService: DateUtilService,
    private userHelperService: UserHelperService,
    private modalController: ModalController,
    private alertController: AlertController,
    private eventService: EventService,
    private loading: LoadingService,
    private authService: AuthService,
  ) {
    // this.scrollImages = ['assets/images/event-banner-images/1.jpg', 'assets/images/event-banner-images/1_1.jpg', 'assets/images/event-banner-images/3_1.jpg', 'assets/images/event-banner-images/4.jpg', 'assets/images/event-banner-images/5.jpg', 'assets/images/event-banner-images/7.jpg'];
    this.firestore.collection('events_scroll_images', ref => ref.where('type', '==', 'EVENT')).valueChanges().subscribe((data: any) => {
      this.eventScrollDetail = data[0];
      if (null != this.eventScrollDetail) {
        this.scrollImages = this.eventScrollDetail?.images
      }
    });

  }

  ngOnInit() {
    localStorage.setItem("app_version_Key", JSON.stringify(environment.versionNumber));

    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
      this.user = userData;
    });



    this.userService.getGSTParamters();
    this.currentMonth = this.dateUtilService.getMonth();
    this.getDiscounts();

    this.userService.getSubscribedUserEvents().subscribe(events => {
      this.subscribedUserEvents = events || [];
      const subscribedEventIds = new Set(this.subscribedUserEvents.map(ev => ev.eventId));
      this.recentEvents.forEach(ev => ev.isSubscribed = subscribedEventIds.has(ev.eventId ?? ev.id));
      this.freeEvents.forEach(ev => ev.isSubscribed = subscribedEventIds.has(ev.eventId ?? ev.id));
    });

    this.appVersion = localStorage.getItem('app_version_Key');

    this.authService.getTypeParam('APP_UPDATE').subscribe((currentDetail: any) => {
      this.appDetails = currentDetail[0];
      this.checkForAppUpdate(this.appDetails);
    });

    // this.validateAndCheckSubscriptionForEvent();
    this.userService.getEventSubscription().subscribe(sub => {
      this.subscriptionDetails = sub;
    });
    this.ionViewWillEnter();


  }


  // validateAndCheckSubscriptionForEvent() {
  //   const query = this.firestore.collection("user_subscription_event").ref
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

  ionViewWillEnter() {
    this.getAllAppearedEvents();
    this.getAllAddedEvents();
    this.getAllFreeEvents();
    this.userService.getGSTParamter().subscribe(gst => {
      this.gstDetails = gst;
    })

    // this.checkForAppUpdate(this.user);

  }

  checkForAppUpdate(dbData) {
    const remoteVersionNumber = Number(dbData?.values?.versionNumber);
    const localVersionNumber = Number(this.appVersion);
    if (!Number.isFinite(remoteVersionNumber) || !Number.isFinite(localVersionNumber)) return;

    const lastShown = Number(localStorage.getItem('app_update_last_shown_version_number'));
    if (Number.isFinite(lastShown) && lastShown === remoteVersionNumber) return;

    if (remoteVersionNumber > localVersionNumber) {
      localStorage.setItem('app_update_last_shown_version_number', String(remoteVersionNumber));
      this.presentAlertForAppUpdate(dbData);
    }
  }

  async presentAlertForAppUpdate(dbData) {
    const alert = await this.alertController.create({
      message: `Get the latest App Version (${dbData.values?.version}). Updates available for you`,
      cssClass: 'customAlert updateVersion',
      header: "Update App",
      backdropDismiss: false,
      buttons: [{
        text: 'Update',
        handler: () => {
          console.log('Confirm YES: Yeahh');
          window.open(this.appDetails?.values?.url);
        }
      }]
    });
    await alert.present();
  }

  segmentChanged(event: any) {
    this.contentskleton = true;
    this.segmentValue = event.detail.value;
    this.ionViewWillEnter();
  }



  getEventScrollImages() {
    this.scrollskleton = false;
    // this.firestore.collection('events_scroll_images', ref => ref.where('type', '==', 'EVENT')).valueChanges().subscribe((data: any) => {
    //   this.scrollImages = data[0].images;
    //   this.scrollskleton = false;
    // })

  }


  getDiscounts() {
    const query = this.firestore.collection(FirebaseCollection.DISCOUNTS).ref.where("applicableFor", "==", "EVENT");
    query
      .get().then((fdiscounts: any) => {
        if (!fdiscounts.empty) {
          fdiscounts.forEach((data: any) => {
            this.discounts.push(data.data());
          });
          this.discounts.sort(function (a, b) {
            return b.requiredQuantity - a.requiredQuantity;
          });
        }
      });


  }

  getAllAppearedEvents() {
    if (!this.userDetails?.id) {
      this.userService.getUserDetails().pipe(
        filter((u: any) => !!u?.id),
        take(1),
      ).subscribe((u: any) => {
        this.userDetails = u;
        this.getAllAppearedEvents();
      });
      return;
    }

    this.firestore.collection(FirebaseCollection.USER_EVENTS, ref => ref
      .where('type', '==', 'EVENT')
      .where('userId', '==', this.userDetails.id))
      .valueChanges().subscribe((events: any[]) => {
        this.userEventByEventId.clear();
        (events || []).forEach((record: any) => {
          const eventId = String(record?.eventId || '');
          if (!eventId) return;

          const existing = this.userEventByEventId.get(eventId);
          this.userEventByEventId.set(eventId, this.pickBestUserEventRecord(existing, record));
        });

        this.applyUserEventStatuses();
        this.userService.setAppearedEvents(events);
      });

  }

  private normalizeUserExamStatus(value: any): string {
    return String(value ?? '').trim().toUpperCase();
  }

  private getUserEventEpoch(record: any): number {
    const candidate =
      record?.completedAtEpoch ??
      record?.appearedDateUnix ??
      record?.updatedAtEpoch ??
      record?.createdAtEpoch ??
      record?.eventDateUnix;
    const n = Number(candidate);
    return Number.isFinite(n) ? n : 0;
  }

  private pickBestUserEventRecord(a: any, b: any): any {
    if (!a) return b;
    if (!b) return a;

    const aStatus = this.normalizeUserExamStatus(a?.examStatus ?? a?.status);
    const bStatus = this.normalizeUserExamStatus(b?.examStatus ?? b?.status);

    if (aStatus === 'COMPLETED' && bStatus !== 'COMPLETED') return a;
    if (bStatus === 'COMPLETED' && aStatus !== 'COMPLETED') return b;

    return this.getUserEventEpoch(b) >= this.getUserEventEpoch(a) ? b : a;
  }

  private applyUserEventStatuses(): void {
    const applyTo = (list: any[]) => {
      (list || []).forEach((ev: any) => {
        const eventId = String(ev?.eventId ?? ev?.id ?? '');
        if (!eventId) return;
        const userEvent = this.userEventByEventId.get(eventId);
        if (!userEvent) return;

        const userStatus = this.normalizeUserExamStatus(userEvent?.examStatus ?? userEvent?.status);
        ev.userEventId = userEvent?.id;
        ev.userExamStatus = userStatus;

        // Override the button state based on user attempt status.
        if (userStatus === 'COMPLETED' || userStatus === 'INPROGRESS' || userStatus === 'STARTED') {
          ev.examStatus = userStatus;
        }
      });
    };

    applyTo(this.recentEvents);
    applyTo(this.freeEvents);
    applyTo(this.expiredEvents);
  }

  onClickCompletedExam(event: any) {
    const userEventId = event?.userEventId ?? event?.id;
    const eventId = event?.eventId ?? event?.id;
    const status = String(event?.userExamStatus ?? event?.examStatus ?? '').toUpperCase();

    // Only completed exams should open score screen.
    if (status !== 'COMPLETED') {
      // For STARTED/INPROGRESS, resume the exam flow (instructions -> Continue).
      this.onClickAppear(event);
      return;
    }

    this.loading.present();
    this.router.navigate(['home/dynamo/finalScore', { eventId: eventId, userEventId: userEventId, type: 'EVENT' }]);

  }

  getAllFreeEvents() {
    this.firestore.collection(FirebaseCollection.EVENTS, ref => ref
      .where('type', '==', 'EVENT')
      .where('classId', '==', this.userDetails.classId)
      .where('boardId', '==', this.userDetails.boardId)
      .where('applicableType', '==', 'FREE_TRAIL')
      .where('status', 'in', ['UPCOMING', 'ACTIVE'])
      .orderBy('eventDate', 'asc'))
      .get().subscribe((events: any) => {
        const subscribedEventIds = new Set((this.subscribedUserEvents || []).map(ev => ev.eventId));
        this.freeEvents = [];
        if (!events.empty) {
          events.forEach((fevent: any) => {
            let aevent = fevent.data();
            let rectindex = this.freeEvents.findIndex(suevnt => suevnt.eventId === aevent.id);
            let expiredindex = this.expiredEvents.findIndex(suevnt => suevnt.eventId === aevent.id);
            //  const minutes: number = Math.floor(aevent.totalHour / 60);
            aevent.displayTotalHour = moment.utc(aevent.totalHour * 1000).format('HH:mm:ss');
            if ((null == aevent.linkvalues || aevent.linkvalues.length == 0) || (aevent.linkvalues && aevent.linkvalues.length > 0 && aevent.linkvalues.includes(this.userDetails.schoolId))) {
              aevent.isAddedToCart = false;
              aevent.isSubscribed = subscribedEventIds.has(aevent.id);
              aevent.line1 = aevent.eventName;
              if (aevent.eventName.includes('#')) {
                let eventNames = aevent.eventName.split('#');
                if (eventNames[0] && eventNames.length > 0) {
                  aevent.line1 = eventNames[0];
                }
                if (eventNames[1] && eventNames.length > 1) {
                  aevent.line2 = eventNames[1];
                }
                if (eventNames[2] && eventNames.length > 2) {
                  aevent.line3 = eventNames[2];
                }
              }
              if (aevent.examStatus == null) {
                aevent.examStatus = 'APPEAR';
              }
              aevent['eventId'] = aevent.id;
              const isafterEndDate = (aevent.eventEndDate == this.dateUtilService.getCurrentDateWithYYYYMMDD()) ? false : this.dateUtilService.checkDateIsAfter(this.dateUtilService.getCurrentDateWithYYYYMMDD(), aevent.eventEndDate);
              const isafterStartDate = (aevent.eventStartDate == this.dateUtilService.getCurrentDateWithYYYYMMDD()) ? true : this.dateUtilService.checkDateIsAfter(this.dateUtilService.getCurrentDateWithYYYYMMDD(), aevent.eventStartDate);
              if (rectindex == -1) {
                if (!isafterEndDate && isafterStartDate) {
                  aevent.examStatus = 'APPEAR';
                  this.freeEvents.push(aevent);
                }
                if (!isafterEndDate && !isafterStartDate) {
                  aevent.examStatus = 'UPCOMING';
                  this.freeEvents.push(aevent);
                }
              }
              if (expiredindex == -1) {
                if (isafterEndDate) {
                  aevent.examStatus = 'EXPIRED';
                  this.expiredEvents.push(aevent);
                }
                }

            }
          });
          this.applyUserEventStatuses();
          this.contentskleton = false;
        }
      });

  }


  getAllAddedEvents() {
    this.firestore.collection(FirebaseCollection.EVENTS, ref => ref
      .where('type', '==', 'EVENT')
      .where('classId', '==', this.userDetails.classId)
      .where('boardId', '==', this.userDetails.boardId)
      .where('applicableType', '==', 'SUBSCRIBTION')
      .where('status', 'in', ['UPCOMING', 'ACTIVE'])
      .orderBy('eventDate', 'asc'))
      .get().subscribe((events: any) => {
        const subscribedEventIds = new Set((this.subscribedUserEvents || []).map(ev => ev.eventId));
        this.recentEvents = [];
        this.expiredEvents = [];
        if (!events.empty) {
          events.forEach((fevent: any) => {
            let aevent = fevent.data();
            aevent.displayTotalHour = moment.utc(aevent.totalHour * 1000).format('HH:mm:ss');
            if ((null == aevent.linkvalues || aevent.linkvalues.length == 0) || (aevent.linkvalues && aevent.linkvalues.length > 0 && aevent.linkvalues.includes(this.userDetails.schoolId))) {
              aevent.isAddedToCart = false;
              aevent.isSubscribed = subscribedEventIds.has(aevent.id);
              let rectindex = this.recentEvents.findIndex(suevnt => suevnt.eventId === aevent.id);
              let expiredindex = this.expiredEvents.findIndex(suevnt => suevnt.eventId === aevent.id);
              aevent.line1 = aevent.eventName;
              if (aevent.eventName.includes('#')) {
                let eventNames = aevent.eventName.split('#');
                if (eventNames[0] && eventNames.length > 0) {
                  aevent.line1 = eventNames[0];
                }
                if (eventNames[1] && eventNames.length > 1) {
                  aevent.line2 = eventNames[1];
                }
                if (eventNames[2] && eventNames.length > 2) {
                  aevent.line3 = eventNames[2];
                }
              }
              if (aevent.examStatus == null) {
                aevent.examStatus = 'APPEAR';
              }
              aevent['eventId'] = aevent.id;
              const isafter = this.dateUtilService.checkDateIsAfter(this.dateUtilService.getCurrentDateWithYYYYMMDD(), aevent.eventEndDate);
              if (rectindex == -1) {
                aevent.examStatus = isafter ? 'EXPIRED' : 'UPCOMING';
                this.recentEvents.push(aevent);
              }
              if (expiredindex == -1) {
                if (isafter) {
                  aevent.examStatus = 'EXPIRED';
                  this.expiredEvents.push(aevent);
                }
              }
            }
          });
          this.applyUserEventStatuses();
          //  this.recentEvents = this.dateUtilService.sortingBasedOnEventDate(this.recentEvents);
          this.contentskleton = false;
        }
      });

  }



  async onClickEventInfo(event: any) {
    this.loading.present();
    this.selectedEvent = event;
    this.firestore.collection("event_information").doc(event.id).get().subscribe((eventInsDetails: any) => {
      this.isEventInfoModalOpen = true;
      if (eventInsDetails.exists) {
        const record = eventInsDetails.data();
        this.selectedEvent.information = record.information;
        event.information = record.information;
      } else {
        event.information = '<p> No information available  </p>';
        this.selectedEvent.information = '<p> No information available  </p>';
      }
    });
  }

  goToNotification() {
    this.router.navigate(['home/notification']);
  }

  getAllNotifications() {
    this.firestore.collection(FirebaseCollection.USER_NOTIFICATION, ref => ref
      .where('userId', '==', this.userDetails.id))
      .valueChanges().subscribe((requests: any[]) => {
        this.notificationCount = requests.filter(message => message.status == 'ACTIVE').length;
      });
  }

  goBack() {
    this.router.navigate(['home/tabs']);

  }

  doRefresh(event: any) {
    this.getAllAddedEvents();
    this.selectedForSubscribe = [];
    event.target.complete();
  }


  onAddToCart(event: any) {
    this.loading.present();
    this.selectedForSubscribe.push(event);
    if (this.subscriptionDetails && this.subscriptionDetails.status == 'SUBSCRIBE') {
      this.discountedAmount = 0;
      this.gstAmount = 0;
      this.onClickSubscriptionPay();

    } else {
      this.calculateDiscount();
      let index = this.recentEvents.findIndex(suevnt => suevnt.id === event.id);
      if (index != -1) {
        this.recentEvents[index].isAddedToCart = true;
      }

    }

  }

  removeFromCart(event: any) {
    let index = this.recentEvents.findIndex(suevnt => suevnt.id === event.id);
    if (index != -1) {
      this.recentEvents[index].isAddedToCart = false;
    }
    let sindex = this.selectedForSubscribe.findIndex(suevnt => suevnt.id === event.id);
    if (sindex != -1) {
      this.selectedForSubscribe.splice(sindex, 1);

      if (this.selectedForSubscribe.length == 0) {
        this.appliedDiscount = null;
        this.totalAmount = 0;
        this.discountTypeValue = 0;
        this.discountedAmount = 0;
      } else {
        this.calculateDiscount();
      }
    }
  }

  onClickSkipPayment() {
    this.selectedForSubscribe = [];
    this.recentEvents.forEach(event => {
      event.isAddedToCart = false;
    });
    this.discountedAmount = 0;
  }

  calculateGST() {
    if (this.gstDetails) {
      this.gstAmount = parseFloat(((this.gstDetails.typeValue * this.discountedAmount) / 100).toFixed(2));
      this.discountedAmount = this.discountedAmount + this.gstAmount;
    }

  }

  calculateDiscount() {
    const discount = this.discounts.filter(dis => dis.requiredQuantity <= this.selectedForSubscribe.length)[0];
    this.totalAmount = this.selectedForSubscribe.map(item => item.price).reduce((prev, next) => prev + next);
    this.appliedDiscount = discount;
    if (discount) {
      this.discountTypeValue = discount.typeValue;
      let percentageAmount = parseFloat(((discount.typeValue * this.totalAmount) / 100).toFixed(2));
      this.discountedAmount = this.totalAmount - percentageAmount;
    } else {
      this.discountTypeValue = 0;
      this.discountedAmount = this.totalAmount;
    }

  }

  async onClickSubscriptionPay() {
    let payment_id = 'SUBSCRIBE';
    this.loading.presentLoading(2000);
    this.createSubscription(payment_id);
    this.router.navigate(['home/tabs/events/subscribedevents']);
    this.util.showToast(('Payment Successfully done'), 'success', 'bottom');
  }


  async onClickPay() {
    this.loading.presentLoading(2000);
    if (this.discountedAmount > 0) {
      let options = {
        description: 'Starkwizz Payments towards event subscription',
        image: 'https://starkwizzuser.web.app/assets/icon/favicon.png',
        currency: 'INR', // your 3 letter currency code
        key: environment.razorpayConfig.key, // your Key Id from Razorpay dashboard
        amount: (this.discountedAmount * 100).toFixed(2), // Payment amount in smallest denomiation e.g. cents for USD
        name: 'Starkwizz',
        prefill: {
          email: this.userDetails.emailId,
          contact: this.userDetails.mobileNo,
          name: this.userDetails.displayName
        },
        theme: {
          // color: '#3399cc'
          color: '#70CFED'
        }
      };


      try {
        let data = (await Checkout.open(options));
        let payment_id = data.response['razorpay_payment_id'];
        this.loading.presentLoading(2000);
        this.createSubscription(payment_id);
        this.router.navigate(['home/tabs/events/subscribedevents']);
        this.util.showToast(('Payment Successfully done'), 'success', 'bottom');
      } catch (error) {
        //  this.util.showToast(('Payment Failed'), 'danger', 'bottom');
        this.util.showToast((error.description), 'danger', 'bottom');
        this.router.navigate(['home/tabs/starkwizzHome']);
      }
    } else {
      this.util.showToast('Please check your payment amount', 'green', 'bottom');
    }

  }


  // registerForKyc() {
  //   this.router.navigate(['home/dynamo/subscription'], { queryParams: { freeTrial: false, subscriptionType: 'EVENT' } });
  // }
  viewSubscribedEvents() {
    this.selectedForSubscribe = [];
    this.router.navigate(['home/tabs/events/subscribedevents']);
  }

  createSubscription(payment_id: any) {
    let transactionId = this.util.generateAlphaNumericId();
    let eventTxnList: any[] = [];
    let eventTxnIds: any[] = [];
    this.selectedForSubscribe.forEach(event => {
      let eventData: any = {
        eventId: event.id,
        eventName: event.eventName,
        subjectId: event.subjectId,
        subjectName: event.subjectName,
        category: event.category,
        eventCode: event.eventCode,
        price: event?.price,
        classId: this.userDetails.classId,
        className: this.userDetails.className,
        boardName: this.userDetails.boardName,
        boardId: this.userDetails.boardId
      }
      eventTxnList.push(eventData);
      eventTxnIds.push(event.id);
    });

    let startDate = this.dateUtilService.getCurrentDateWithTime();
    let endDate = this.dateUtilService.addDayToCurrentData(365);

    let paymentData: any = {
      id: payment_id,
      date: this.dateUtilService.getCurrentDate(),
      status: 'SUCCESS',
      amount: this.discountedAmount,
      userid: this.userDetails.id,
      paymentfor: 'EVENT',
      paymentby: this.userDetails.id,
      paymentmode: 'ONLINE',
      subscriptionId: transactionId,
      txnNumber: this.util.generateAlphaNumericNumber(),
      txnDate: this.dateUtilService.getCurrentDateWithTime(),
      startDate: startDate,
      startDateUnix: this.dateUtilService.getUnixTime(startDate),
      endDate: endDate,
      endDateUnix: this.dateUtilService.getUnixTime(endDate),
      classId: this.userDetails.classId,
      className: this.userDetails.className,
      boardName: this.userDetails.boardName,
      boardId: this.userDetails.boardId,
      name: this.userDetails?.firstName + " " + this.userDetails?.lastName,
      paymentForIds: eventTxnIds,
      paymentForDetails: eventTxnList
    }
    this.userService.setSubscriptionToCollecton(paymentData);
    let subscribedSubjects = this.userHelperService.populateEventSubscriptionDetails(this.selectedForSubscribe, this.userDetails, this.totalAmount, this.discountedAmount, this.discountTypeValue, this.appliedDiscount, payment_id, transactionId);
    this.userService.setEventsscriptionSubjectsToCollecton(subscribedSubjects);
    this.userDetails.profileType.push('EVENT_SUBSCRIBED');
    this.userService.updateUserAfterPaymentToCollecton(this.userDetails, 'EVENT_SUBSCRIBED', paymentData.id);
    this.userService.setUserDetails(this.userDetails);
    this.selectedForSubscribe = [];
  }


  onClickAppear(suevent: any) {
    const query = this.firestore.collection('events').ref
      .where("id", "==", suevent.eventId);
    query.get().then((userevnt: any) => {
      if (!userevnt.empty) {
        userevnt.forEach((data: any) => {
          let eventRecord = data.data();
          if (eventRecord.questions.length > 0) {
            this.proceedForExamAppear(eventRecord)
          } else {
            this.util.showToast(('No question added for this event '), 'danger', 'bottom');
          }
        });
      } else {
        this.util.showToast(('No events exist,Please check with support'), 'danger', 'bottom');
      }

    });

  }

  proceedForExamAppear(event: any) {
    this.firestore.collection("user_events", ref => ref
      .where("eventId", "==", event.id)
      .where("userId", "==", this.userDetails.id))
      .get().subscribe(data => {
        if (!data.empty) {
          data.forEach((res: any) => {
            let userEvnt = res.data();
            if (userEvnt.status == 'COMPLETED') {
              //this.util.showToast(('You have already Completed this Exam'), 'danger', 'bottom')
              this.eventService.setTestEvent(event);
              this.router.navigate(['home/dynamo/finalScore', { eventId: userEvnt.eventId, userEventId: userEvnt.id, type: event.type }]);
            }
            if (userEvnt.status == 'INPROGRESS') {
              this.updateUserExam(event, userEvnt.id);
            }
            if (userEvnt.status == 'STARTED') {
              this.updateUserExam(event, userEvnt.id);
            }
          });
        } else {
          this.createUserExam(event);
        }
      });
  }

  async updateUserExam(userEventData: any, id: any) {
    const modal = await this.modalController.create({
      component: SubjectAppearComponent,
      cssClass: 'fullScreenModal',
      componentProps: {
        event: userEventData,
        userEventId: id
      }
    });
    await modal.present();
  }
  async createUserExam(event: any) {
    let quesData = this.userHelperService.populateUserEventData(null, event, this.userDetails, 'STARTED', 'EVENT', event.category);
    this.userService.setUserEventsToCollections(quesData)
    const modal = await this.modalController.create({
      component: SubjectAppearComponent,
      cssClass: 'fullScreenModal',
      componentProps: {
        event: event,
        userEventId: quesData.id
      }
    });
    await modal.present();
  }

  modalDismiss() {
    this.isEventInfoModalOpen = false;
    this.eventInfoModal.dismiss(null, 'cancel');
  }


}
