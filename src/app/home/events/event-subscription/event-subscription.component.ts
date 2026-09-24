import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { IonModal, ModalController } from '@ionic/angular';
import * as moment from 'moment-timezone';
import { DateUtilService } from 'src/app/common/util/date-util.service';
import { FirebaseCollection } from 'src/app/model/common/firebase-collection';
import { UserDetails } from 'src/app/model/user';
import { UserHelperService } from 'src/app/services/helper/user-helper.service';
import { LoadingService } from 'src/app/services/loading.service';
import { UserServiceService } from 'src/app/services/user-service.service';
import { UtilServiceService } from 'src/app/services/util-service.service';
import { SubjectAppearComponent } from '../../dynamo/subject-appear/subject-appear.component';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-event-subscription',
  templateUrl: './event-subscription.component.html',
  styleUrls: ['./event-subscription.component.scss'],
})
export class EventSubscriptionComponent implements OnInit {
  @ViewChild(IonModal) subEventInfoModal: IonModal = {} as IonModal;
  subscribedUserEvents: any[] = [];
  currentMonth: string = '';
  userDetails: UserDetails = {} as UserDetails;
  notificationCount: number = 0;
  appearedEvents: any[] = [];
  pendingEvents: any[] = [];
  isKyc: boolean = false;
  segmentValue: string = 'APPEAR';
  filteredEvents: any[] = [];
  appearLoader: boolean = false;
  viewScoreLoader: boolean = false;
  updateExamEvent: any;
  contenskeleton: boolean = true;
  useredEvents: any[] = [];
  selectedEvent: any = {};
  isEventInfoModalOpen: boolean = false;
  constructor(private userService: UserServiceService,
    private dateUtilService: DateUtilService,
    private router: Router,
    private route: ActivatedRoute,
    private firestore: AngularFirestore,
    private modalController: ModalController,
    private util: UtilServiceService,
    private userHelperService: UserHelperService,
    private loadingService: LoadingService,
    private eventService: EventService,
  ) { }

  ngOnInit() {
    this.isKyc = this.route.snapshot.queryParams['isKyc'];
    this.currentMonth = this.dateUtilService.getMonth();
    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
      if (null != this.userDetails && null != this.userDetails.profileType) {
        if ((this.userDetails.profileType.includes('FREETRAIL') || this.userDetails.profileType.includes('EVENT_SUBSCRIBED')) && (null != this.userDetails.cityId && null != this.userDetails.stateId && this.userDetails.districtId && this.userDetails.schoolId)
        ) {
          this.isKyc = true;
        } else {
          this.isKyc = false;
        }
      }

    });
    this.userService.getAppearedEvents().subscribe(appearedEvent => {
      this.useredEvents = appearedEvent;
    });
    this.getAllNotifications();
    this.getUpdateEventsForUsers();


  }

  getUpdateEventsForUsers() {
    this.userService.getUpdateExamEvent().subscribe(event => {
      this.updateExamEvent = event;
      let eventIndex = this.pendingEvents.findIndex(cee => cee.id === event.eventId);
      if (eventIndex != -1) {
        this.pendingEvents[eventIndex].examStatus = event.examStatus;
      }
    });
  }

  ionViewWillEnter() {
    this.appearedEvents = [];
    this.pendingEvents = [];
    this.getAllSubScribedEvents();
    //  this.getAllFreeEvents();

  }




  getAllSubScribedEvents() {
    this.contenskeleton = false;
    this.userService.getSubscribedUserEvents().subscribe(events => {
      if (null != events && events.length > 0) {
        events.forEach(evnt => {
          // const minutes: number = Math.floor(evnt.totalHour / 60);
          evnt.displayTotalHour = moment.utc(evnt.totalHour * 1000).format('HH:mm:ss');
          evnt.line1 = evnt.eventName;
          if (evnt.status == 'SUBSCRIBED') {
            evnt.applicableType = 'SUBSCRIBTION';
          }
          if (evnt.eventName.includes('#')) {
            let eventNames = evnt.eventName.split('#');
            if (eventNames[0] && eventNames.length > 0) {
              evnt.line1 = eventNames[0];
            }
            if (eventNames[1] && eventNames.length > 1) {
              evnt.line2 = eventNames[1];
            }
            if (eventNames[2] && eventNames.length > 2) {
              evnt.line3 = eventNames[2];
            }
          }
          let userEvent = this.useredEvents.find(usrevet => usrevet.eventId == evnt.id);
          if (null != userEvent) {
            evnt["eventId"] = evnt.id;
            evnt["userEventId"] = userEvent.id;
            evnt.examStatus = userEvent.examStatus ?? userEvent.status;
            evnt.appearedDate = userEvent.appearedDate;
          }

          const normalizedStatus = String(evnt.examStatus || '').toUpperCase();
          if (normalizedStatus === 'COMPLETED') {
            let index = this.appearedEvents.findIndex(apevt => apevt.eventId == evnt.eventId);
            if (index == -1) {
              evnt["id"] = evnt.eventId;
              this.appearedEvents.push(evnt);
            }
          } else {
            let index = this.pendingEvents.findIndex(apevt => apevt.eventId == evnt.eventId);
            if (index == -1) {
              evnt["id"] = evnt.eventId;

              // Fix: if user has STARTED/INPROGRESS but backed out without attempting,
              // keep it as APPEAR so they can continue the exam.
              if (normalizedStatus === 'STARTED' || normalizedStatus === 'INPROGRESS') {
                evnt.examStatus = 'APPEAR';
              }

              const isBefore = this.dateUtilService.checkDateBefore(this.dateUtilService.getCurrentDateWithYYYYMMDD(), evnt.eventStartDate);
              if (isBefore) {
                evnt.examStatus = 'UPCOMING';
              }

              const isafter = this.dateUtilService.checkDateIsAfter(this.dateUtilService.getCurrentDateWithYYYYMMDD(), evnt.eventEndDate);
              if (isafter) {
                evnt.examStatus = 'EXPIRED';
              }
              if (evnt.examStatus == null) {
                evnt.examStatus = 'APPEAR';
              }
              this.pendingEvents.push(evnt);

            }
          }
        });
        let freeCompletedEvents = this.useredEvents.filter(uev => (uev.applicableType == 'FREE_TRAIL' && uev.examStatus == 'COMPLETED'));
        if (null != freeCompletedEvents && freeCompletedEvents.length > 0) {
          this.appearedEvents = [...freeCompletedEvents];
        }

        this.appearedEvents = this.dateUtilService.sortingBasedOnAppearedDate(this.appearedEvents);
        this.pendingEvents = this.dateUtilService.sortingBasedOnEventDate(this.pendingEvents);
        this.filteredEvents = this.pendingEvents.filter(pev => pev.examStatus === this.segmentValue);
        this.contenskeleton = false;
      }
    });
  }

  segmentChanged(event: any) {
    this.contenskeleton = true;
    this.segmentValue = event.detail.value;
    this.ionViewWillEnter();
  }

  goBack() {
    this.router.navigate(['home/tabs/events']);
  }

  doRefresh(event: any) {
    this.contenskeleton = true;
    this.ionViewWillEnter();
    event.target.complete();
  }



  onClickAppear(suevent: any) {
    this.appearLoader = true;
    if (this.isKyc) {
      const query = this.firestore.collection('events').ref
        .where("id", "==", suevent.eventId);
      query.get().then((userevnt: any) => {
        if (!userevnt.empty) {
          userevnt.forEach((data: any) => {
            this.appearLoader = false;
            let eventRecord = data.data();
            if (eventRecord.questions.length > 0) {
              this.proceedForExamAppear(eventRecord)
            } else {
              this.appearLoader = false;
              this.util.showToast(('No question added for this event '), 'danger', 'bottom');
            }
          });
        } else {
          this.appearLoader = false;
          this.util.showToast(('No events exist,Please check with support'), 'danger', 'bottom');
        }

      });
    } else {
      this.appearLoader = false;
      this.router.navigate(['home/dynamo/subscription'], { queryParams: { freeTrial: suevent.applicableType, subscriptionType: 'EVENT', backURL: 'home/tabs/events/subscribedevents' } });
    }



  }

  proceedForExamAppear(event: any) {
    this.userService.setUserDetails(this.userDetails);
    this.firestore.collection("user_events", ref => ref
      .where("eventId", "==", event.id)
      .where("userId", "==", this.userDetails.id))
      .get().subscribe(data => {
        if (!data.empty) {
          data.forEach((res: any) => {
            this.appearLoader = false;
            let userEvnt = res.data();
            if (userEvnt.status == 'COMPLETED') {
              this.util.showToast(('You have already Completed this Exam'), 'danger', 'bottom')
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
      breakpoints: [1],
      initialBreakpoint: 0.75,
      backdropDismiss: true,
      cssClass: 'fullScreenModal, eventModal',
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
      breakpoints: [1],
      initialBreakpoint: 0.75,
      backdropDismiss: true,
      cssClass: 'fullScreenModal, eventModal',
      componentProps: {
        event: event,
        userEventId: quesData.id
      }
    });
    await modal.present();
  }

  getAllNotifications() {
    this.firestore.collection(FirebaseCollection.USER_NOTIFICATION, ref => ref
      .where('userId', '==', this.userDetails.id))
      .valueChanges().subscribe((requests: any[]) => {
        this.notificationCount = requests.filter(message => message.status == 'ACTIVE').length;
      });
  }


  goToNotification() {
    this.router.navigate(['home/notification']);
  }



  modalDismiss() {
    this.isEventInfoModalOpen = false;
    this.subEventInfoModal.dismiss(null, 'cancel');
  }


  onClickCompletedExam(event: any) {
    this.eventService.setTestEvent(event);
    this.viewScoreLoader = true;
    this.viewScoreLoader = false;
    const userEventId = event?.userEventId ?? event?.id;
    this.router.navigate(['home/dynamo/finalScore', { eventId: event.eventId, userEventId: userEventId, type: event.type }]);
  }

  async onClickEventInfo(event: any) {
    this.loadingService.present();
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
}
