import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { AlertController, IonModal, ModalController, ToastController } from '@ionic/angular';
import * as moment from 'moment-timezone';
import { DateUtilService } from 'src/app/common/util/date-util.service';
import { buildQuizwhizzDigitalBadgeRecord } from 'src/app/common/util/quizwhizz-digital-badge.util';
import { EventService } from 'src/app/services/event.service';
import { UserHelperService } from 'src/app/services/helper/user-helper.service';
import { UserServiceService } from 'src/app/services/user-service.service';
import { register } from 'swiper/element/bundle';
import { take } from 'rxjs/operators';
import { SubjectAppearComponent } from '../home/dynamo/subject-appear/subject-appear.component';
import { FirebaseCollection } from '../model/common/firebase-collection';
import { UserDetails } from '../model/user';
import { UtilServiceService } from '../services/util-service.service';

register();

@Component({
  selector: 'app-quizwhizz',
  templateUrl: './quizwhizz.component.html',
  styleUrls: ['./quizwhizz.component.scss'],
})
export class QuizwhizzComponent implements OnInit {
  @ViewChild(IonModal) quizwhizzInfoModal: IonModal = {} as IonModal;
  isQuizWHizzInfoModalOpen: boolean = false;
  subjForSubscription: any[] = [];
  subjForSubscriptionMap = new Map<String, any[]>();
  userDetails: UserDetails = new UserDetails();
  currentMonth: string = '';
  subjectList: any[] = [];
  viewType: string = 'PAYMENT_PENDING';
  segmentValue: string = '';
  notificationCount = 0;
  isFreeTrial: boolean = false;
  subscriptionType: string = '';
  userSubscribedSujects: any[] = [];
  eventlist: any[] = [];
  viewScoreLoader: boolean = false;
  appearLoader: boolean = false;
  scrollskleton: boolean = false;
  quizWhizzImages: any[] = [];
  appearedEvents: any[] = [];
  eventScrollDetail: any = {};
  selectedQuizWhizzEvent: any = {};
  subscription: string = '';
  everyMonthSunday: any[] = [];
  lastSunday: any[] = [];
  currentYear = moment().format('YYYY');
  private hasAutoSelectedSegment = false;
  private readonly QUIZWHIZZ_SUNDAY_CONTEST_CATEGORIES_LABEL = 'GK * CURRENT AFFAIRS * REASONING';
  constructor(
    private firestore: AngularFirestore,
    private userService: UserServiceService,
    private dateUtilService: DateUtilService,
    private userHelperService: UserHelperService,
    private eventService: EventService,
    private router: Router,
    private toastController: ToastController,
    private util: UtilServiceService,
    private modalController: ModalController,
    private alertController: AlertController,
  ) {
    //  this.quizWhizzImages = ['assets/images/quizwhizz-banner-images/2_1.jpg', 'assets/images/quizwhizz-banner-images/2.jpg', 'assets/images/quizwhizz-banner-images/3.jpg', 'assets/images/quizwhizz-banner-images/4_1.jpg', 'assets/images/quizwhizz-banner-images/6.jpg', 'assets/images/quizwhizz-banner-images/8.jpg'];
    this.firestore.collection('events_scroll_images', ref => ref.where('type', '==', 'QUIZWHIZZ')).valueChanges().subscribe((data: any) => {
      this.eventScrollDetail = data[0];
      if (null != this.eventScrollDetail) {
        this.quizWhizzImages = this.eventScrollDetail?.images
      }
    });
  }

  ngOnInit() {
    this.currentMonth = this.dateUtilService.getCurrentMonth();
    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
      if (this.userDetails?.id) {
        this.getAllAppearedEventsForQuizWhizz();
      }
    });


    // let applicableDate = '2025-04-10';
    // let isBefore = this.dateUtilService.checkDateBefore(this.dateUtilService.getCurrentDateWithYYYYMMDD(), applicableDate);
    // if (isBefore) {
    //   this.presentAlertForAppUpdate();
    // }


    //this.validateAndCheckSubscriptionForEvent();
    this.segmentValue = this.dateUtilService.getNextSunday();
    this.updateLastSundaySelection();
  }

  ionViewWillEnter() {
    this.getAllAppearedEventsForQuizWhizz();
  }

  async presentAlertForAppUpdate() {
    const alert = await this.alertController.create({
      message: 'The platform will be available to users starting from the first day of the Starkwizz academic session, April 10, 2025.',
      cssClass: 'customAlert popAlert',
      header: "Quizwhizz Alert",
      backdropDismiss: false,
      buttons: [{
        text: 'Proceed',
        handler: () => {
          console.log('Confirm YES: Yeahh');
          this.router.navigate(['/home/tabs/starkwizzHome']);
        }
      }]
    });
    await alert.present();
  }

  // validateAndCheckSubscriptionForEvent() {
  //   const query = this.firestore.collection("user_subscription_quizwhizz").ref
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
  //           } else {
  //             this.getAllAppearedEventsForQuizWhizz();
  //             this.getViewType();
  //           }
  //         });
  //       } else {
  //         this.router.navigate(['home/combo-offer']);
  //       }
  //     });

  // }

  segmentChanged(event: any) {
    this.segmentValue = event.detail.value;
    this.hasAutoSelectedSegment = true;
    this.updateLastSundaySelection();
    this.ionViewWillEnter();
  }

  private updateLastSundaySelection() {
    if (!this.segmentValue) {
      this.lastSunday = [];
      return;
    }
    this.generateLastSundays(this.currentYear);
    this.lastSunday = this.everyMonthSunday.filter(clas => clas.lastSunday == this.segmentValue);
  }

  private autoSelectUpcomingSegmentIfNeeded() {
    const grouped: any = this.subjForSubscriptionMap as any;
    const keys: string[] = grouped ? Object.keys(grouped) : [];
    if (keys.length === 0) {
      if (!this.hasAutoSelectedSegment) this.segmentValue = '';
      this.lastSunday = [];
      return;
    }

    if (this.segmentValue && keys.includes(this.segmentValue)) {
      this.updateLastSundaySelection();
      return;
    }

    if (this.hasAutoSelectedSegment) return;

    const today = this.dateUtilService.getCurrentDateWithYYYYMMDD();
    const sorted = keys.sort((a, b) => moment(a, 'YYYY-MM-DD').valueOf() - moment(b, 'YYYY-MM-DD').valueOf());
    const upcoming = sorted.filter(k => !this.dateUtilService.checkDateIsAfter(today, k));
    const selected = upcoming.length > 0 ? upcoming[0] : sorted[sorted.length - 1];

    this.segmentValue = selected;
    this.updateLastSundaySelection();
  }

  getAllAppearedEventsForQuizWhizz() {
    if (!this.userDetails?.id || !this.userDetails?.classId || !this.userDetails?.boardId) return;
    this.firestore.collection('user_quizwhizz_events', ref => ref
      .where('userId', '==', this.userDetails.id)
      .where('classId', '==', this.userDetails.classId)
      .where('boardId', '==', this.userDetails.boardId)).get()
      .subscribe((items: any) => {
        this.appearedEvents = [];
        if (!items.empty) {
          items.forEach(item => {
            let record = item.data();
            this.appearedEvents.push(record);
          });
        }
        // Rebuild event list after appeared events are loaded so `examStatus` and `userEventId`
        // map correctly for the merged Sunday contest.
        this.getAllDetailsEvents();
      });


    // this.eventService.getQuizWhizzSubjectEvents().subscribe(events => {
    //   this.appearedEvents = events;
    // });
  }

  ionViewDidEnter() {
    this.getAllAppearedEventsForQuizWhizz();
  }

  doRefresh(event: any) {
    this.getAllAppearedEventsForQuizWhizz();
    event.target.complete();
  }

  goBack() {
    this.router.navigate(['home/tabs/starkwizzHome']);
  }

  getViewType() {
    this.userService.getPageViewType().subscribe(view => {
      this.viewType = view;
    });
    this.userService.getSubscribedUserExamSubjects().subscribe(subjects => {
      this.userSubscribedSujects = subjects;
    });
  }



  getAllDetailsEvents() {
    if (!this.userDetails?.id || !this.userDetails?.classId || !this.userDetails?.boardId) return;
    // this.firestore.collection(FirebaseCollection.EVENTS, ref => ref
    //   .where('type', '==', 'QUIZWHIZZ EXAM')
    //   .where('classId', '==', this.userDetails.classId)
    //   .where('boardId', '==', this.userDetails.boardId)
    //   .where('eventMonth', '==', this.currentMonth)
    //   .where('status', 'in', ['UPCOMING', 'ACTIVE', 'COMPLETED']))
    //   .get().subscribe((events: any) => {
    this.userService.getQuizzWhizzEvents().pipe(take(1)).subscribe(events => {
      const rawEvents: any[] = [];
      let currentDate = this.dateUtilService.getCurrentDateWithYYYYMMDD();
      if (events) {
        events.forEach((fevent: any) => {
          let feventdetails = fevent.data();
          let formatedEndDate = this.dateUtilService.fomrmatDateToMonthAndDate(feventdetails.eventEndDate);
          feventdetails['formattedEndDate'] = formatedEndDate;
          feventdetails.displayTotalHour = moment.utc(feventdetails.totalHour * 1000).format('HH:mm:ss');
           let index = this.appearedEvents.findIndex(apevt => apevt.eventId == feventdetails.id);
           if (index != -1) {
            const appeared = this.appearedEvents[index];
            const appearedStatus = String(appeared?.status ?? appeared?.examStatus ?? '').toUpperCase();
            feventdetails.examStatus = appeared?.status ?? appeared?.examStatus;
            feventdetails["userEventId"] = appeared?.id;
            feventdetails["appearedDetails"] = appeared;

            // Allow user to continue if the exam is STARTED/INPROGRESS.
            // Only lock when it's actually COMPLETED.
            feventdetails["isAllowToApper"] = appearedStatus !== 'COMPLETED';
           } else {
             const isafter = this.dateUtilService.checkDateIsAfter(currentDate, feventdetails.eventEndDate);
             if (isafter) {
               feventdetails.examStatus = 'EXPIRED';
               feventdetails.applicableType = 'EXPIRED';
              feventdetails["isAllowToApper"] = false;
            }
            let inBetween = this.dateUtilService.checkDateInBetween(currentDate, feventdetails.eventStartDate, feventdetails.eventEndDate);
            //console.log('inBetween  ',inBetween,'start date', feventdetails.eventStartDate, 'End date',feventdetails.eventEndDate);
            if (inBetween) {
              feventdetails["isAllowToApper"] = true;
            } else {
              feventdetails["isAllowToApper"] = false;
            }

          }

          rawEvents.push(feventdetails);
        });
        this.eventlist = this.buildSundayContestEvents(rawEvents);
        this.subjForSubscriptionMap = this.eventlist.reduce(function (r: any, a: any) {
          r[a.eventEndDate] = r[a.eventEndDate] || [];
          r[a.eventEndDate].push(a);
          return r;
        }, Object.create(null));
        this.eventService.setAppreadedEvents(this.eventlist);
        this.autoSelectUpcomingSegmentIfNeeded();

      }
    });
  }

  private buildSundayContestEvents(rawEvents: any[]): any[] {
    const grouped = (rawEvents || []).reduce(function (r: any, a: any) {
      const key = String(a?.eventEndDate || '').trim();
      if (!key) return r;
      r[key] = r[key] || [];
      r[key].push(a);
      return r;
    }, Object.create(null));

    const result: any[] = [];
    Object.keys(grouped).forEach((eventEndDate) => {
      const eventsForDate: any[] = grouped[eventEndDate] || [];
      if (eventsForDate.length === 0) return;
      result.push(this.mergeSundayContestForDate(eventEndDate, eventsForDate));
    });

    return result.sort(
      (a, b) =>
        moment(String(a?.eventEndDate), 'YYYY-MM-DD').valueOf() -
        moment(String(b?.eventEndDate), 'YYYY-MM-DD').valueOf(),
    );
  }

  private mergeSundayContestForDate(eventEndDate: string, eventsForDate: any[]): any {
    const contestLevelLabel = this.isLastSundayOfMonth(eventEndDate) ? 'Horse Ride' : 'Turtle Drive';
    const sample = eventsForDate[0] || {};
    const classId = String(sample?.classId || '').trim();
    const boardId = String(sample?.boardId || '').trim();
    const contestId = `quizwhizz_sunday_${eventEndDate}_${boardId || 'board'}_${classId || 'class'}`;

    const syntheticAppeared = (this.appearedEvents || []).find((a: any) => a?.eventId === contestId);
    const mergedQuestions = this.mergeQuizwhizzQuestionsByCategorySequence(eventsForDate);
    const totalSeconds = this.pickContestDurationSeconds(eventsForDate);
    const totalMarks = this.pickContestTotalMarks(eventsForDate, mergedQuestions.length);

    const merged: any = {
      ...sample,
      id: contestId,
      type: 'QUIZWHIZZ EXAM',
      eventName: contestLevelLabel,
      category: 'QUIZWHIZZ CONTEST',
      categoryId: 'QUIZWHIZZ_CONTEST',
      eventEndDate,
      eventStartDate: sample?.eventStartDate || eventEndDate,
      formattedEndDate: this.dateUtilService.fomrmatDateToMonthAndDate(eventEndDate),
      totalHour: totalSeconds,
      perQuestionHour: sample?.perQuestionHour,
      displayTotalHour: moment.utc(totalSeconds * 1000).format('HH:mm:ss'),
      eventMarks: totalMarks,
      questionPattern: 'SEQUENCE',
      questionToAttemp: 25,
      questions: mergedQuestions,
      quizwhizzContestCategoriesLabel: this.QUIZWHIZZ_SUNDAY_CONTEST_CATEGORIES_LABEL,
      quizwhizzContestLevelLabel: contestLevelLabel,
      quizwhizzContestDateLabel: moment(eventEndDate, 'YYYY-MM-DD').isValid()
        ? moment(eventEndDate, 'YYYY-MM-DD').format('DD-MM-YYYY')
        : eventEndDate,
      quizwhizzContestDurationLabel: this.formatMinutesLabel(totalSeconds),
      sourceEvents: eventsForDate,
    };

    if (syntheticAppeared) {
      const appearedStatus = String(syntheticAppeared?.status ?? syntheticAppeared?.examStatus ?? '').toUpperCase();
      merged.examStatus = syntheticAppeared?.status ?? syntheticAppeared?.examStatus;
      merged["userEventId"] = syntheticAppeared.id;
      merged["appearedDetails"] = syntheticAppeared;
      merged["isAllowToApper"] = appearedStatus !== 'COMPLETED';
      return merged;
    }

    const completed = eventsForDate.filter((e) => String(e?.examStatus || '').toUpperCase() === 'COMPLETED');
    const inprogress = eventsForDate.filter((e) =>
      ['INPROGRESS', 'STARTED'].includes(String(e?.examStatus || '').toUpperCase()),
    );
    if (completed.length > 0 && completed.length === eventsForDate.length) {
      merged.examStatus = 'COMPLETED';
      merged["isAllowToApper"] = false;
    } else if (inprogress.length > 0) {
      merged.examStatus = 'INPROGRESS';
      merged["isAllowToApper"] = false;
    } else {
      merged["isAllowToApper"] = !!eventsForDate.find((e) => !!e?.isAllowToApper);
    }
    return merged;
  }

  private mergeQuizwhizzQuestionsByCategorySequence(eventsForDate: any[]): any[] {
    const safeEvents = Array.isArray(eventsForDate) ? eventsForDate : [];

    // If admin already created a single "merged" contest with 25+ questions,
    // use it as-is (do not re-slice by category detection).
    if (safeEvents.length === 1) {
      const direct = Array.isArray(safeEvents[0]?.questions) ? safeEvents[0].questions : [];
      if (direct.length >= 25) return direct.slice(0, 25);
    }

    const getKey = (e: any) => this.normalizeQuizwhizzCategoryKey(e?.category, e?.eventName);
    const gkEvent = safeEvents.find((e) => getKey(e) === 'GK');
    const caEvent = safeEvents.find((e) => getKey(e) === 'CURRENT_AFFAIRS');
    const reasoningEvent = safeEvents.find((e) => getKey(e) === 'REASONING');

    const gk = Array.isArray(gkEvent?.questions) ? gkEvent.questions.slice(0, 10) : [];
    const ca = Array.isArray(caEvent?.questions) ? caEvent.questions.slice(0, 10) : [];
    const reasoning = Array.isArray(reasoningEvent?.questions) ? reasoningEvent.questions.slice(0, 5) : [];

    const preferred = [...gk, ...ca, ...reasoning].slice(0, 25);
    if (preferred.length === 25) return preferred;

    // Fallback: take all questions across events in a deterministic order.
    // This prevents false "missing 25 questions" when category detection only finds GK and slices to 10.
    const priorityOf = (e: any) => {
      const k = getKey(e);
      if (k === 'GK') return 1;
      if (k === 'CURRENT_AFFAIRS') return 2;
      if (k === 'REASONING') return 3;
      return 99;
    };
    const sorted = safeEvents
      .slice()
      .sort((a, b) => priorityOf(a) - priorityOf(b) || String(a?.category || '').localeCompare(String(b?.category || '')));
    const all = sorted.reduce((acc: any[], e: any) => {
      const q = Array.isArray(e?.questions) ? e.questions : [];
      return acc.concat(q);
    }, []);
    return all.slice(0, 25);
  }

  private normalizeQuizwhizzCategoryKey(categoryRaw: any, eventNameRaw: any): 'GK' | 'CURRENT_AFFAIRS' | 'REASONING' | null {
    const combined = `${String(categoryRaw || '')} ${String(eventNameRaw || '')}`.toLowerCase();
    if (!combined.trim()) return null;
    if (combined.includes('general knowledge') || /\bgk\b/.test(combined)) return 'GK';
    if (combined.includes('current') && combined.includes('affair')) return 'CURRENT_AFFAIRS';
    if (combined.includes('reason') || combined.includes('mental ability') || combined.includes('ability')) return 'REASONING';
    return null;
  }

  private pickContestDurationSeconds(eventsForDate: any[]): number {
    const sum = (eventsForDate || []).reduce((acc, e) => acc + (Number(e?.totalHour) || 0), 0);
    if (Number.isFinite(sum) && sum > 0) return Math.floor(sum);
    return 15 * 60;
  }

  private pickContestTotalMarks(eventsForDate: any[], totalQuestions: number): number {
    const sum = (eventsForDate || []).reduce((acc, e) => acc + (Number(e?.eventMarks) || 0), 0);
    if (Number.isFinite(sum) && sum > 0) return Math.floor(sum);
    const q = Number(totalQuestions) || 0;
    return q > 0 ? q * 2 : 0;
  }

  private isLastSundayOfMonth(dateYYYYMMDD: string): boolean {
    if (!dateYYYYMMDD) return false;
    this.generateLastSundays(this.currentYear);
    return (this.everyMonthSunday || []).some((s: any) => String(s?.lastSunday) === String(dateYYYYMMDD));
  }

  private formatMinutesLabel(totalSeconds: any): string {
    const raw = Number(totalSeconds);
    if (!Number.isFinite(raw) || raw <= 0) return '-';
    const minutes = Math.max(1, Math.round(raw / 60));
    return `${minutes} ${minutes === 1 ? 'Minute' : 'Minutes'}`;
  }


  onClickSubjectDetail(subject: any) {
    this.getUserEventForSelectedSubject(subject);
    this.eventService.setQizWhizzSubject(subject);

  }


  getUserEventForSelectedSubject(subject: any) {
    const query = this.firestore.collection("user_quizwhizz_events");
    query.ref
      .where('userId', '==', this.userDetails.id)
      .where('classId', '==', this.userDetails.classId)
      .where('boardId', '==', this.userDetails.boardId)
      .where("subjectId", "==", subject.id)
      .get().then((subjects: any) => {
        let appreadEvents: any[] = [];
        if (!subjects.empty) {
          subjects.forEach((data: any) => {
            let subject = data.data();
            appreadEvents.push(subject);
          });
        }
        this.eventService.setQuizWhizzSubjectEvents(appreadEvents);
        // this.router.navigate(['home/quizwhizz-details']);
      })

  }





  getAllNotifications() {
    this.firestore.collection(FirebaseCollection.USER_NOTIFICATION, ref => ref
      .where('userId', '==', this.userDetails.id))
      .valueChanges().subscribe((requests: any[]) => {
        this.notificationCount = requests.filter(message => true && message.status == 'ACTIVE').length;
      });
  }


  onClickAppear(suevent: any) {
    if (null != suevent) {
      if (suevent.questions.length > 0) {
        if (String(suevent?.id || '').startsWith('quizwhizz_sunday_') && suevent.questions.length < 25) {
          this.util.showToast(('This Sunday contest needs 25 questions (GK 10 + Current Affairs 10 + Reasoning 5). Please check with support/admin.'), 'danger', 'bottom');
          return;
        }
        this.proceedForExamAppear(suevent)
      } else {
        this.util.showToast(('No question added for this event '), 'danger', 'bottom');
      }
    } else {
      this.util.showToast(('No Quizz Whizz exam exist,Please check with support'), 'danger', 'bottom');
    }
  }



  proceedForExamAppear(event: any) {
    this.firestore.collection("user_quizwhizz_events", ref => ref
      .where("eventId", "==", event.id)
      .where("userId", "==", this.userDetails.id))
      .get().subscribe(data => {
        if (!data.empty) {
          data.forEach((res: any) => {
            let userEvnt = res.data();
            if (userEvnt.status == 'COMPLETED') {
              this.util.showErrorAlert('You have already Completed this Exam')
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
    let quesData = this.userHelperService.populateUserEventData(null, event, this.userDetails, 'STARTED', 'QUIZWHIZZ EXAM', event.category);
    this.userService.setUserEventsQuizWhizzToCollections(quesData)
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


  goToNotification() {
    this.router.navigate(['home/notification']);
  }

  onClickViewScore(exam: any) {
    this.eventService.setTestEvent(exam);

    const resolvedUserEventId = exam?.userEventId || exam?.appearedDetails?.id;
    if (resolvedUserEventId) {
      this.router.navigate(['home/dynamo/finalScore', { eventId: exam.id, userEventId: resolvedUserEventId, type: exam.type }]);
      return;
    }

    // Fallback: if UI state is stale (e.g., appeared events didn't load yet), fetch the user event id.
    if (!this.userDetails?.id) {
      this.presentToast('Please wait… try again.');
      return;
    }

    this.firestore
      .collection('user_quizwhizz_events', (ref) => ref.where('eventId', '==', exam.id).where('userId', '==', this.userDetails.id))
      .get()
      .pipe(take(1))
      .subscribe((snap: any) => {
        let id: string | null = null;
        snap.forEach((doc: any) => {
          const data = typeof doc?.data === 'function' ? doc.data() : doc;
          id = String(data?.id || '').trim() || String(doc?.id || '').trim() || id;
        });
        if (!id) {
          this.presentToast('Score not found for this test.');
          return;
        }
        this.router.navigate(['home/dynamo/finalScore', { eventId: exam.id, userEventId: id, type: exam.type }]);
      });
  }


  viewTotalScore(key: any, subjForSubscriptionMap: any) {
    let allAppreadedEvents: any[] = subjForSubscriptionMap[key] || [];
    if (allAppreadedEvents.length === 1 && Array.isArray(allAppreadedEvents[0]?.sourceEvents)) {
      const merged = allAppreadedEvents[0];
      const mergedHasOwnAttempt = !!merged?.appearedDetails || !!merged?.userEventId;
      if (!mergedHasOwnAttempt) {
        const source = allAppreadedEvents[0].sourceEvents as any[];
        const sourceHasAppeared = source.some((e) => !!e?.appearedDetails || !!e?.examStatus);
        if (sourceHasAppeared) allAppreadedEvents = source;
      }
    }
    let totalResult = {
      correctAnswers: 0,
      inCorrectAnswers: 0,
      skippedQuestions: 0,
      totalScore: 0,
      totalQuestions: 0,
      totalMarks: 0,
      totalExamTime: 0,
      displayName: '',
      totalExamTimeDisplay: '',
      records: allAppreadedEvents,
      isDownloadAnsAllow: false,
      isPublishRankAllow: false,
      isReviewAnsAllow: false,
      className: '',
      boardName: '',
      eventDate: '',
    }
    if (null != allAppreadedEvents && allAppreadedEvents.length > 0) {
      let allCompletedEvents = allAppreadedEvents.filter(ape => ape.examStatus === 'COMPLETED');
      if (null != allCompletedEvents && allCompletedEvents.length > 0) {
        totalResult.displayName = allCompletedEvents[0]["appearedDetails"].userDisplayName;
        totalResult.records = [];
          allCompletedEvents.forEach(alldet => {
            if (null != alldet && null != alldet.examStatus && alldet.examStatus == 'COMPLETED') {
              totalResult.correctAnswers = totalResult.correctAnswers + alldet["appearedDetails"].totalCorrect;
              totalResult.inCorrectAnswers = totalResult.inCorrectAnswers + alldet["appearedDetails"].totalInCorrect;
              totalResult.skippedQuestions = totalResult.skippedQuestions + alldet["appearedDetails"].totalSkipQuestions;
              totalResult.totalScore = totalResult.totalScore + alldet["appearedDetails"].totalSecuredMark;
              totalResult.totalQuestions = totalResult.totalQuestions + alldet["appearedDetails"].totalAppearQuesiton;
              const marks =
                Number(alldet["appearedDetails"]?.totalMarks ?? 0) ||
                Number(alldet["appearedDetails"]?.eventMarks ?? 0) ||
                Number(alldet?.eventMarks ?? 0) ||
                0;
              totalResult.totalMarks = totalResult.totalMarks + marks;
              totalResult.totalExamTime = totalResult.totalExamTime + alldet["appearedDetails"].totalExamTime;
              totalResult.className = alldet["appearedDetails"].className;
              totalResult.boardName = alldet["appearedDetails"].boardName;
              totalResult.eventDate = key;
              totalResult.records.push(alldet["appearedDetails"]);
            }
          });

          if (!Number.isFinite(totalResult.totalMarks) || totalResult.totalMarks <= 0) {
            const q = Number(totalResult.totalQuestions) || 0;
            totalResult.totalMarks = q > 0 ? q * 2 : 0;
          }
          totalResult.totalExamTimeDisplay = this.dateUtilService.formattTimeDifferenceInSeconds(totalResult.totalExamTime);

        const badge = buildQuizwhizzDigitalBadgeRecord({
          userId: this.userDetails?.id,
          boardId: this.userDetails?.boardId,
          classId: this.userDetails?.classId,
          contestDate: key,
          createdAtEpoch: this.dateUtilService.getCurrentMilliSeconds(),
          totalScore: totalResult.totalScore,
          totalMarks: totalResult.totalMarks,
        });
        if (badge) {
          this.firestore
            .collection(FirebaseCollection.QUIZWHIZZ_DIGITAL_BADGES)
            .doc(badge.id)
            .set(badge, { merge: true })
            .catch(() => undefined);
          totalResult['digitalBadge'] = badge;
        }

        this.eventService.setResultDetails(totalResult);
        this.eventService.setAllAppreadedEvents(allAppreadedEvents);
        this.router.navigate(['home/quizwhizz-details'], { queryParams: { eventEndDate: key } });
      }
      else {
        this.presentToast('Please appear any one exam to view total score');
      }


    }

  }



  async onClickEventInfo(event: any) {
    // this.firestore.collection("event_information").doc(event.id).get().subscribe((eventInsDetails: any) => {
    //   this.isQuizWHizzInfoModalOpen = true;
    //   if (eventInsDetails.exists) {
    //     const record = eventInsDetails.data();
    //     this.selectedQuizWhizzEvent.information = record.information;
    //     event.information = record.information;
    //   } else {
    //     event.information = '<p> No information available  </p>';
    //     this.selectedQuizWhizzEvent.information = '<p> No information available  </p>';
    //   }
    // });

    this.isQuizWHizzInfoModalOpen = true;

  }

  async presentToast(msg: any) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 3000,
      position: "bottom",
      color: 'dark',
      cssClass: 'customDarkToaster'
    });
    toast.present();
  }

  modalDismiss() {
    this.isQuizWHizzInfoModalOpen = false;
    this.quizwhizzInfoModal.dismiss(null, 'cancel');
  }

  generateLastSundays(year) {
    this.everyMonthSunday = [];
    for (let month = 0; month < 12; month++) {
      const lastDay = new Date(year, month + 1, 0);
      const dayOfWeek = lastDay.getDay();
      const diff = dayOfWeek === 0 ? 0 : dayOfWeek;
      lastDay.setDate(lastDay.getDate() - diff);

      let sundayLast: any = {
        lastSunday: moment(lastDay, "YYYY-MM-DD").format('YYYY-MM-DD'),
        month: moment(lastDay, "YYYY-MM-DD").format('MMM'),
      }
      this.everyMonthSunday.push(sundayLast);
    }
  }

}
