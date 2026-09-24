import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, IonModal, ModalController, ToastController } from '@ionic/angular';
import { DescriptionModalComponent } from 'src/app/common/component/description-modal/description-modal.component';
import { DateUtilService } from 'src/app/common/util/date-util.service';
import { FirebaseCollection } from 'src/app/model/common/firebase-collection';
import { Event } from 'src/app/model/event';
import { EventService } from 'src/app/services/event.service';
import { UserHelperService } from 'src/app/services/helper/user-helper.service';
import { LoadingService } from 'src/app/services/loading.service';
import { UserServiceService } from 'src/app/services/user-service.service';
import { UtilServiceService } from 'src/app/services/util-service.service';
//import SwiperCore, { Autoplay, Keyboard, Pagination, Scrollbar, Zoom } from 'swiper';
import { CancelExamAlertComponent } from '../cancel-exam-alert/cancel-exam-alert.component';
import { SubjectAppearComponent } from '../subject-appear/subject-appear.component';
//SwiperCore.use([Autoplay, Keyboard, Pagination, Scrollbar, Zoom]);

@Component({
  selector: 'app-subject-detail',
  templateUrl: './subject-detail.component.html',
  styleUrls: ['./subject-detail.component.scss'],
})
export class SubjectDetailComponent implements OnInit {
  @ViewChild(IonModal) eventInfoModal: IonModal = {} as IonModal;
  selectedEvent: any = {};
  subjectDtls: any[] = [];
  slideOpts = {
    slidesPerView: 1.15,
    spaceBetween: 20,
    speed: 400
  };
  events: Event[] = [];
  userDetails: any = {};
  selectedSubject: any;
  benchMark: any = {
    status: 'NOQUESTION',
    allowToAttempt: false,
    isPublishRankAllow: false,
    type: 'DYNAMO EXAM'
  };
  proficiencyTwo: any = {
    status: 'NOQUESTION',
    allowToAttempt: false,
    isPublishRankAllow: false,
    type: 'DYNAMO EXAM'
  };
  proficiencyOne: any = {
    status: 'NOQUESTION',
    allowToAttempt: false,
    isPublishRankAllow: false,
    type: 'DYNAMO EXAM'
  };
  quarterFour: any = {
    status: 'NOQUESTION',
    allowToAttempt: false,
    subjectCountRequired: 25,
    isPublishRankAllow: false,
    type: 'DYNAMO EXAM'
  };
  quarterThree: any = {
    status: 'NOQUESTION',
    allowToAttempt: false,
    subjectCountRequired: 25,
    isPublishRankAllow: false,
    type: 'DYNAMO EXAM'
  };
  quarterTwo: any = {
    status: 'NOQUESTION',
    allowToAttempt: false,
    subjectCountRequired: 25,
    isPublishRankAllow: false,
    type: 'DYNAMO EXAM'
  };
  quarterOne: any = {
    status: 'NOQUESTION',
    allowToAttempt: false,
    isPublishRankAllow: false,
    subjectCountRequired: 25,
    type: 'DYNAMO EXAM'
  };
  currenMonth: string = '';
  currentDate: string = '';
  notificationCount = 0;
  eventsOfSelectedSubject: any[] = [];
  contenskeleton: boolean = true;
  parameters: any[] = [];
  sortedRecords: Map<String, any[]> = new Map<String, any[]>();
  appearedUserEvent: any = {};
  dynamoExams: any[] = [];
  moduleList: any[] = [];
  private moduleOrderById = new Map<string, number>();
  isEventInfoModalOpen: boolean = false;
  selectedCategory: any = {};
  questionsForModules: Map<String, any[]> = new Map<String, any[]>();
  segmentValue: string = 'DYNAMO_CS';

  getCategoryCount(category: string, events: any[] | null | undefined): number {
    if (!Array.isArray(events) || events.length === 0) return 0;

    return events.length;
  }

  constructor(
    private modalController: ModalController,
    private firestore: AngularFirestore,
    private route: ActivatedRoute,
    private eventService: EventService,
    private userService: UserServiceService,
    private userHelperService: UserHelperService,
    private util: UtilServiceService,
    private router: Router,
    private dateUtilService: DateUtilService,
    private loading: LoadingService,
    private bottomSheet: MatBottomSheet,
    private toastController: ToastController,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    // this.loadingService.present();
    this.currentDate = this.dateUtilService.getCurrentDateWithYYYYMMDD();
    this.userService.getEventParameters().subscribe(parms => {
      this.parameters = parms;
    });
    this.getUserDetails();
    this.getEventsForSelectedSubjects();
    this.getSelectedSubject();
    this.currenMonth = this.dateUtilService.getMonth();
    this.getAllNotifications();
    this.eventService.getDynamoExamForSelectedSubject().subscribe(dynamoExams => {
      this.dynamoExams = dynamoExams;
    });

    setTimeout(() => {
      this.contenskeleton = false;
    }, 6000);

  }

  getEventsForSelectedSubjects() {
    this.eventService.getEventsForSelectedSubject().subscribe(events => {
      this.eventsOfSelectedSubject = events;
    });

  }

  doRefresh(event: any) {
    // this.firestore.collection("user_events", ref => ref
    // .where('userId', '==', this.userDetails.id)
    // .where('classId', '==', this.userDetails.classId)
    // .where('boardId', '==', this.userDetails.boardId)
    // .where("subjectId", "==", this.selectedSubject.id))
    // .valueChanges().subscribe((requests: any[]) => {
    //   this.eventService.setEventsForSelectedSubject(requests);
    // });
    this.getEventsForSelectedSubjects();
    this.getSelectedSubject();
    event.target.complete();
  }


  initializedExams() {
    this.benchMark = {
      status: 'NOQUESTION',
      allowToAttempt: false,
      isPublishRankAllow: false,
      type: 'DYNAMO EXAM'
    };
    this.proficiencyTwo = {
      status: 'NOQUESTION',
      allowToAttempt: false,
      isPublishRankAllow: false,
      type: 'DYNAMO EXAM'
    };
    this.proficiencyOne = {
      status: 'NOQUESTION',
      allowToAttempt: false,
      isPublishRankAllow: false,
      type: 'DYNAMO EXAM'
    };
    this.quarterFour = {
      status: 'NOQUESTION',
      allowToAttempt: false,
      isPublishRankAllow: false,
      subjectCountRequired: 25,
      type: 'DYNAMO EXAM'
    };
    this.quarterThree = {
      status: 'NOQUESTION',
      allowToAttempt: false,
      isPublishRankAllow: false,
      subjectCountRequired: 25,
      type: 'DYNAMO EXAM'
    };
    this.quarterTwo = {
      status: 'NOQUESTION',
      allowToAttempt: false,
      isPublishRankAllow: false,
      subjectCountRequired: 25,
      type: 'DYNAMO EXAM'
    };
    this.quarterOne = {
      status: 'NOQUESTION',
      allowToAttempt: false,
      isPublishRankAllow: false,
      subjectCountRequired: 25,
      type: 'DYNAMO EXAM'
    };
  }

  goBack() {
    this.router.navigate(['home/dynamo/beforePaid']);
  }

  async onClickAppear(eventView: any) {
    const canProceed = await this.confirmProgressiveAttemptIfNeeded(eventView);
    if (!canProceed) return;

    this.loading.present();
    if (eventView.type == 'DYNAMO EXAM') {
      eventView.questions = [];
      let questionToAttemp: number = eventView.questionToAttemp != null ? eventView.questionToAttemp : 10;
      if (eventView.moduleIds.length > 0) {
        let quotient = Math.floor(questionToAttemp / eventView.moduleIds.length);
        for (let i = 0; i < eventView.moduleIds.length; i++) {
          let limitcount = quotient;
          if (i == eventView.moduleIds.length - 1) {
            limitcount = questionToAttemp - eventView.questions.length;
            let fetchQuestions: any[] = this.questionsForModules[eventView.moduleIds[i]];
            let randomNumbers: any[] = this.util.getRandomWithRang(0, fetchQuestions.length, limitcount);
            for (let k = 0; k <= limitcount; k++) {
              let question = fetchQuestions[randomNumbers[k]];
              if (question) {
                eventView.questions.push({ "correctAnswer": question.answers, "id": question.id });
              }
            }
            if (eventView.questions.length == questionToAttemp) {
              this.proceedForExamAppear(eventView);
            }
            if (eventView.questions.length > questionToAttemp) {
              eventView.questions.slice(0, questionToAttemp);
              this.proceedForExamAppear(eventView);
            }
          } else {
            let fetchQuestions: any[] = this.questionsForModules[eventView.moduleIds[i]];
            let randomNumbers = this.util.getRandomWithRang(0, fetchQuestions.length, limitcount);
            for (let k = 0; k < limitcount; k++) {
              let question = fetchQuestions[randomNumbers[k]];
              if (question) {
                let questionIndex = eventView.questions.findIndex(qst => qst.id == question.id);
                if (questionIndex == -1) {
                  eventView.questions.push({ "correctAnswer": question.answers, "id": question.id });
                }
              }
            }
          }

        }
      }

    } else {
      this.proceedForExamAppear(eventView)
    }
  }

  private getAttemptRecordsForEvent(eventView: any): any[] {
    const eventId = eventView?.id;
    if (!eventId) return [];

    if (eventView?.type === 'DYNAMO EXAM') {
      return (this.dynamoExams ?? []).filter((uev: any) => uev?.eventId === eventId);
    }

    return (this.eventsOfSelectedSubject ?? []).filter((uev: any) => uev?.eventId === eventId);
  }

  private getLatestAttemptRecord(records: any[]): any | null {
    if (!Array.isArray(records) || records.length === 0) return null;

    const getEpoch = (r: any): number => {
      const epoch = Number(r?.completedAtEpoch ?? r?.appearedDateUnix ?? r?.creationUnixDate ?? 0);
      return Number.isFinite(epoch) ? epoch : 0;
    };

    return records.reduce((latest, current) => (getEpoch(current) >= getEpoch(latest) ? current : latest), records[0]);
  }

  private async confirmProgressiveAttemptIfNeeded(eventView: any): Promise<boolean> {
    if (eventView?.category !== 'Progressive Test') return true; // do not affect Diagnostic Test
    if (!eventView?.allowToAttempt) return false;

    const attempts = this.getAttemptRecordsForEvent(eventView);
    const passMark = Number(eventView?.passMark ?? 0);

    const attemptCountFromView = Number(eventView?.attemptCount ?? 0);
    const attemptsUsed = Math.max(attemptCountFromView, attempts.length);

    // Hard lock after 5 attempts.
    if (attemptsUsed >= 5) {
      eventView.allowToAttempt = false;
      eventView.status = 'COMPLETED';
      eventView.attemptCount = attemptsUsed;
      this.util.showToast('Progressive Test is locked after 5 attempts.', 'danger', 'bottom');
      return false;
    }

    // Prompt only for 4th and 5th attempt (i.e., after 3rd/4th attempt), and only if not yet qualified.
    if (attemptsUsed !== 3 && attemptsUsed !== 4) return true;

    const hasQualified = attempts.some((a: any) => Number(a?.totalCorrect ?? 0) >= passMark);
    const hasQuit = attempts.some((a: any) => a?.progressiveQuit === true);
    if (hasQualified || hasQuit) return false;

    const nextAttemptNumber = attemptsUsed + 1;
    const alert = await this.alertController.create({
      header: 'Progressive Test',
      message:
        `You have completed ${attemptsUsed} attempt(s) but haven’t secured 100% yet.\n\n` +
        `Do you want to attempt once more (Attempt ${nextAttemptNumber}) or quit?`,
      backdropDismiss: false,
      buttons: [
        { text: 'Quit', role: 'cancel' },
        { text: 'Once More', role: 'confirm' },
      ],
    });

    await alert.present();
    const { role } = await alert.onDidDismiss();
    if (role === 'confirm') return true;

    await this.markProgressiveQuit(eventView, attempts);
    return false;
  }

  private async markProgressiveQuit(eventView: any, attempts: any[]): Promise<void> {
    const latestAttempt = this.getLatestAttemptRecord(attempts);
    if (!latestAttempt?.id) return;

    const collectionName = eventView?.type === 'DYNAMO EXAM' ? 'user_dyanmo_exam' : 'user_events';
    await this.firestore.collection(collectionName).doc(latestAttempt.id).update({
      progressiveQuit: true,
      progressiveQuitAt: this.dateUtilService.getCurrentDateWithTime(),
      progressiveQuitAtEpoch: this.dateUtilService.getCurrentMilliSeconds(),
      progressiveQuitAttemptCount: attempts.length,
    });

    // Update UI state immediately.
    latestAttempt.progressiveQuit = true;
    eventView.status = 'COMPLETED';
    eventView.allowToAttempt = false;
    eventView.userEventId = latestAttempt.id;

    this.util.showToast('You have quit this Progressive Test.', 'danger', 'bottom');
  }



  getNumberOfQuestionLimitForEachChapter(moduleNumber: number, totalQuestion: number) {
    const quotient = Math.floor(totalQuestion / moduleNumber); // => 4 => the times 3 fits into 13  
    const remainder = totalQuestion % moduleNumber;
    return {
      quotient: quotient,
      remainder: remainder
    }
  }

  async createUserExam(eventView: any) {
    eventView.isPublishRankAllow = false;
    let quesData = {
      id: '',
      isPublishRankAllow: false
    };
    if (eventView.type == 'DYNAMO EXAM') {
      quesData = this.userHelperService.populateUserEventData(null, eventView, this.userDetails, 'STARTED', 'DYNAMO EXAM', this.selectedSubject.category);
      quesData.isPublishRankAllow = false;
      this.userService.setUserDynamoEventsToCollections(quesData);
    } else {
      quesData = this.userHelperService.populateUserEventData(null, eventView, this.userDetails, 'STARTED', 'EXAM', this.selectedSubject.category);
      quesData.isPublishRankAllow = false;
      this.userService.setUserEventsToCollections(quesData)
    }

    const modal = await this.modalController.create({
      component: SubjectAppearComponent,
      breakpoints: [1],
      initialBreakpoint: 0.75,
      backdropDismiss: true,
      cssClass: 'fullScreenModal, eventModal',
      componentProps: {
        event: eventView,
        userEventId: quesData.id
      }
    });
    await modal.present();
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


  getSelectedSubject() {
    this.eventService.getSelectedSubject().subscribe(res => {
      this.selectedSubject = res;
      this.getSubjectModules(this.selectedSubject);

    });
  }
  getUserDetails() {
    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
    });
  }

  getSubjectModules(subject: any) {
    // this.loadingService.presentLoading(7000);
    if (this.userDetails.userLinkType != 'SCHOOL_SPECIFICE') {
      const query = this.firestore.collection('modules');
      query.ref
        .where("subjectId", "==", subject.id)
        .get().then((modules: any) => {
          this.moduleList = [];
          if (!modules.empty) {
            const fetchedModules: any[] = [];
            modules.forEach((data: any) => {
              let record = data.data();
              fetchedModules.push(record);
            });
            this.moduleList = this.sortModulesForChapterSequence(fetchedModules);
            this.buildModuleOrderMap();
            const moduleIds: string[] = this.moduleList
              .map((m: any) => String(m?.id || ''))
              .filter((id: string) => !!id);
            this.getDynamoEligibileQuestions(moduleIds);
            this.getDynamoSubscribedEvents(moduleIds);
          } else {
            this.presentToast("No Modules avilable for  Subject.");
          }

        })
    }
    if (this.userDetails.userLinkType == 'SCHOOL_SPECIFICE') {
      const query = this.firestore.collection('modules');
      query.ref
        .where("subjectId", "==", subject.id)
        .where("linkvalues", "array-contains", this.userDetails.schoolId)
        .get().then((modules: any) => {
          this.moduleList = [];
          if (!modules.empty) {
            const fetchedModules: any[] = [];
            modules.forEach((data: any) => {
              let record = data.data();
              fetchedModules.push(record);
            });
            this.moduleList = this.sortModulesForChapterSequence(fetchedModules);
            this.buildModuleOrderMap();
            const moduleIds: string[] = this.moduleList
              .map((m: any) => String(m?.id || ''))
              .filter((id: string) => !!id);
            this.getDynamoEligibileQuestions(moduleIds);
            this.getDynamoSubscribedEvents(moduleIds);
          } else {
            this.presentToast("No Modules avilable for  Subject.");
          }

        })
    }
  }

  private buildModuleOrderMap(): void {
    this.moduleOrderById.clear();
    this.moduleList.forEach((m, index) => {
      const id = String(m?.id || '');
      if (id) this.moduleOrderById.set(id, index);
    });
  }

  private sortModulesForChapterSequence(modules: any[]): any[] {
    const list = Array.isArray(modules) ? [...modules] : [];
    if (list.length <= 1) return list;

    const numericKeys = [
      'sequence',
      'sortOrder',
      'order',
      'index',
      'moduleNo',
      'moduleNumber',
      'chapterNo',
      'chapterNumber',
    ];

    const numericKey = numericKeys.find((k) => list.some((m: any) => Number.isFinite(Number(m?.[k]))));
    if (numericKey) {
      list.sort((a: any, b: any) => Number(a?.[numericKey]) - Number(b?.[numericKey]));
      return list;
    }

    const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });
    const getName = (m: any) => String(m?.displayName ?? m?.name ?? m?.moduleName ?? '');
    list.sort((a: any, b: any) => collator.compare(getName(a), getName(b)));
    return list;
  }


  getDynamoEligibileQuestions(moduleIds: string[]) {
    let allQuestions: any[] = [];
    for (let j = 0; j < moduleIds.length; j++) {
      this.firestore.collection("questions", ref => ref
        .where("board", "==", this.userDetails.boardName)
        .where("class.id", '==', this.userDetails.classId)
        .where("subject.id", '==', this.selectedSubject.id)
        .where("module.id", '==', moduleIds[j])
        .limit(25))
        .get().subscribe(data => {
          if (!data.empty) {
            data.forEach((res: any) => {
              let question = res.data();
              let qsIndex = allQuestions.findIndex(qs => qs.id == question.id);
              if (qsIndex == -1) {
                allQuestions.push(question);
              }
            });
            this.questionsForModules = allQuestions.reduce(function (r, a) {
              r[a.module.id] = r[a.module.id] || [];
              r[a.module.id].push(a);
              return r;
            }, Object.create(null));
          }
        });
    }
  }

  
  segmentChanged(event: any) {
    this.segmentValue = event.detail.value;
    // Clear all data before fetching new data for the new segment
    this.sortedRecords = new Map();
    this.subjectDtls = [];
    this.contenskeleton = true;
    this.getSelectedSubject();
  }


  getDynamoSubscribedEvents(moduleIds: string[]) {
    this.loading.present();
    let query;

    // this.firestore.collection("events", ref => ref
    //   .where("type", "==", 'EXAM')
    //   .where("boardId", "==", this.userDetails.boardId)
    //   .where("classId", '==', this.selectedSubject.classId)
    //   .where("subjectId", '==', this.selectedSubject.id))
    //   .get().subscribe(data => {

    if(this.segmentValue == 'DYNAMO_MS') {
      query = this.firestore.collection("events").ref
      .where("type", "==", 'DYNAMO EXAM')
      .where("stateId", "==", this.userDetails.stateId)
      .where("districtId", "==", this.userDetails.districtId)
      .where("cityId", "==", this.userDetails.cityId)
      .where("schoolId", "==", this.userDetails.schoolId)
      .where("boardId", "==", this.userDetails.boardId)
      .where("subjectId", '==', this.selectedSubject.id);
    } else {
      query = this.firestore.collection("events").ref
      .where("type", "==", 'EXAM')
      .where("boardId", "==", this.userDetails.boardId)
      .where("subjectId", '==', this.selectedSubject.id);
    }

      query.get().then(data => {
        if (!data.empty) {
          this.subjectDtls = [];
          // Use a Set to track unique event IDs and prevent duplicates from Firebase
          let uniqueEventIds = new Set();
          
           data.forEach((res: any) => {
             let examRecord = res.data();
             if (!examRecord?.id) {
               examRecord.id = res.id;
             }
             examRecord.moduleOrder = this.moduleOrderById.get(String(examRecord?.moduleId || '')) ?? Number.MAX_SAFE_INTEGER;
             
             // Skip if we've already processed this event ID (prevent duplicates from Firebase)
             if (uniqueEventIds.has(examRecord.id)) {
               return;
             }
            uniqueEventIds.add(examRecord.id);
            
            //  if (null != examRecord.moduleId && moduleIds.includes(examRecord.moduleId)) {
            if (null != examRecord.categoryId) {
              let fetchCategory = this.parameters.find(parm => parm.id == examRecord.categoryId);
              if (fetchCategory) {
                examRecord.category = fetchCategory.displayName;
                examRecord.sequence = fetchCategory.sequence;
              }
            }
            
            // Fix: Also check for subjectId match for Diagnostic and Progressive Tests
            // Previously it was allowing ALL Diagnostic/Progressive tests regardless of subject
            const isDiagnosticOrProgressive = examRecord.category == 'Diagnostic Test' || examRecord.category == 'Progressive Test';
            const isSameClass = examRecord.classId == this.selectedSubject.classId;
            const isSameSubject = examRecord.subjectId == this.selectedSubject.id;
            
            if (!(isSameClass || (isDiagnosticOrProgressive && isSameSubject))) return;
            
            examRecord['isPassScoreApplicable'] = false;
            examRecord['allowToAttempt'] = false;
              if (this.eventsOfSelectedSubject.length > 0) {
                let exampAttempRecords: any[] = this.eventsOfSelectedSubject.filter(uev => uev.eventId === examRecord.id);
                // examRecord.status = 'ACTIVE';
                // examRecord['allowToAttempt'] = true;
                if (exampAttempRecords.length > 0 && examRecord.category != 'Progressive Test') {
                const latestAttempt =
                  this.getLatestAttemptRecord(exampAttempRecords) ?? exampAttempRecords[exampAttempRecords.length - 1];
                const latestStatus = String(latestAttempt?.status ?? latestAttempt?.examStatus ?? '').toUpperCase();

                examRecord['userEventId'] = latestAttempt?.id;
                examRecord['attemptCount'] = exampAttempRecords?.length;

                // Fix: don't mark an exam as COMPLETED just because a user-event record exists.
                // When user only opens instructions and goes back, the record is STARTED and the exam should remain attemptable.
                if (latestStatus === 'COMPLETED') {
                  examRecord['allowToAttempt'] = false;
                  examRecord.status = 'COMPLETED';
                } else {
                  examRecord['allowToAttempt'] = true;
                  examRecord.status = latestStatus || examRecord.status || 'ACTIVE';
                }
                }
                if (examRecord.category == 'Progressive Test' && exampAttempRecords.length > 0) {
                  const hasQuit = exampAttempRecords.some(uear => uear?.progressiveQuit === true);
                  if (hasQuit) {
                    const quitRecord = exampAttempRecords.find(uear => uear?.progressiveQuit === true) ?? exampAttempRecords[exampAttempRecords.length - 1];
                  examRecord.status = 'COMPLETED';
                  examRecord['userEventId'] = quitRecord?.id;
                  examRecord['allowToAttempt'] = false;
                  examRecord['attemptCount'] = exampAttempRecords?.length;
                } else if (exampAttempRecords.length < 5) {
                  const appearedEvents = exampAttempRecords.find(uear => uear.totalCorrect >= Number(examRecord.passMark));
                  if (appearedEvents) {
                    examRecord.status = 'COMPLETED';
                    examRecord['userEventId'] = appearedEvents.id;
                    examRecord['allowToAttempt'] = false;
                    examRecord['attemptCount'] = exampAttempRecords?.length;
                  } else {
                    examRecord.status = 'ACTIVE';
                    examRecord['allowToAttempt'] = true;
                    examRecord['attemptCount'] = exampAttempRecords?.length;
                  }
                } else {
                  examRecord.status = 'COMPLETED';
                  examRecord['userEventId'] = exampAttempRecords[exampAttempRecords.length - 1]?.id;
                  examRecord['allowToAttempt'] = false;
                  examRecord['attemptCount'] = exampAttempRecords?.length;
                }
              }
            }

            this.subjectDtls.push(examRecord);
            this.contenskeleton = false;
            //  }
          });

          // NOTE: Don't auto-generate Diagnostic/Progressive tests for every module.
          // Show only events that admin uploaded for this subject.

          if (this.subjectDtls.length > 0) {
            let diagnosticCOmpletedEvents: any[] = this.subjectDtls.filter(sd => sd.category == 'Diagnostic Test' && sd.status == 'COMPLETED');

            if (diagnosticCOmpletedEvents.length > 0) {
              diagnosticCOmpletedEvents.forEach(devt => {
                let progressiveInActive = this.subjectDtls.find(sd => sd.category == 'Progressive Test' && sd.status == 'UPCOMING' && sd.moduleId == devt.moduleId);
                if (progressiveInActive) {
                  progressiveInActive.status = 'ACTIVE';
                  progressiveInActive['allowToAttempt'] = true;
                }
              });
            }

            let progressiveTestEvents: any[] = this.subjectDtls.filter(sd => sd.category == 'Progressive Test' && sd.status == 'COMPLETED');
            let isQuatorOne = this.eventService.checkEligibilityForQuatorOneTest(progressiveTestEvents, this.moduleList);
            if (isQuatorOne) {
              let dynamoQuaterOneExam = this.dynamoExams.find(dexam => dexam.categoryId === '1stquartertest');
              if (null != dynamoQuaterOneExam) {
                this.quarterOne = dynamoQuaterOneExam;
                if (dynamoQuaterOneExam.status == 'COMPLETED') {
                  let progressiveTestEvents: any[] = this.subjectDtls.filter(sd => sd.category == 'Progressive Test' && sd.status == 'COMPLETED');
                  let isQuatorTwo = this.eventService.checkEligibilityForQuatorTwoTest(progressiveTestEvents, this.moduleList);
                  if (isQuatorTwo) {
                    let dynamoQuaterTwoExam = this.dynamoExams.find(dexam => dexam.categoryId === '2ndquartertest');
                    if (null != dynamoQuaterTwoExam) {
                      this.quarterTwo = dynamoQuaterTwoExam;
                      if (dynamoQuaterTwoExam.status == 'COMPLETED') {
                        let dynamoProficiencyOneExam = this.dynamoExams.find(dexam => dexam.categoryId === '1stproficiencytest');
                        if (null != dynamoProficiencyOneExam) {
                          this.proficiencyOne = dynamoProficiencyOneExam;
                          if (dynamoProficiencyOneExam.status == 'COMPLETED') {
                            let dynamoQuaterThreeExam = this.dynamoExams.find(dexam => dexam.categoryId === '3rdquartertest');
                            if (null != dynamoQuaterThreeExam) {
                              this.quarterThree = dynamoQuaterThreeExam;
                              let progressiveTestEvents: any[] = this.subjectDtls.filter(sd => sd.category == 'Progressive Test' && sd.status == 'COMPLETED');
                              let isQuatorThree = this.eventService.checkEligibilityForQuatorThreeTest(progressiveTestEvents, this.moduleList);
                              if (isQuatorThree) {
                                if (dynamoQuaterThreeExam.status == 'COMPLETED') {
                                  let dynamoQuaterFourExam = this.dynamoExams.find(dexam => dexam.categoryId === '4thquartertest');
                                  if (null != dynamoQuaterFourExam) {
                                    this.quarterFour = dynamoQuaterFourExam;
                                    let progressiveTestEvents: any[] = this.subjectDtls.filter(sd => sd.category == 'Progressive Test' && sd.status == 'COMPLETED');
                                    let isQuatorFour = this.eventService.checkEligibilityForQuatorFourTest(progressiveTestEvents, this.moduleList);
                                    if (isQuatorFour) {
                                      if (dynamoQuaterFourExam.status == 'COMPLETED') {
                                        let dynamoProficiencyTwoExam = this.dynamoExams.find(dexam => dexam.categoryId === '2ndproficiencytest');
                                        if (null != dynamoProficiencyTwoExam) {
                                          this.proficiencyTwo = dynamoProficiencyTwoExam;
                                          if (dynamoProficiencyTwoExam.status == 'COMPLETED') {
                                            let benchMark = this.dynamoExams.find(dexam => dexam.categoryId === 'benchmarktest');
                                            if (null != benchMark) {
                                              this.benchMark = benchMark;
                                            } else {
                                              let defaultEventDetails = this.subjectDtls.find(sd => sd.categoryId === 'benchmarktest');
                                              let selectedModules = this.eventService.calculateSubjectForBenMarkTest(this.moduleList);
                                              this.benchMark = this.populateEventDetails(defaultEventDetails, selectedModules, 'benchmarktest');
                                              this.benchMark.allowToAttempt = true;
                                            }
                                          }
                                        } else {
                                          let defaultEventDetails = this.subjectDtls.find(sd => sd.categoryId === '2ndproficiencytest');
                                          let dynamoQuaterFourExam = this.dynamoExams.find(dexam => dexam.categoryId === '4thquartertest');
                                          let dynamoQuaterThreeExam = this.dynamoExams.find(dexam => dexam.categoryId === '3rdquartertest');
                                          let selectedModulesForTwo = [...dynamoQuaterFourExam.modules, ...dynamoQuaterThreeExam.modules];
                                          this.proficiencyTwo = this.populateEventDetails(defaultEventDetails, selectedModulesForTwo, '2ndproficiencytest');
                                          this.proficiencyTwo.allowToAttempt = true;
                                        }
                                      }
                                    }
                                  } else {
                                    let defaultEventDetails = this.subjectDtls.find(sd => sd.categoryId === '4thquartertest');
                                    dynamoQuaterOneExam.moduleIds.forEach((mid: string) => {
                                      let midIndex = progressiveTestEvents.findIndex(pt => pt.moduleId == mid);
                                      if (midIndex != -1) {
                                        progressiveTestEvents.splice(midIndex, 1);
                                      }
                                    });
                                    dynamoQuaterTwoExam.moduleIds.forEach((mid: string) => {
                                      let midIndex = progressiveTestEvents.findIndex(pt => pt.moduleId == mid);
                                      if (midIndex != -1) {
                                        progressiveTestEvents.splice(midIndex, 1);
                                      }
                                    });

                                    if (dynamoQuaterThreeExam.moduleIds.length >= progressiveTestEvents.length) {
                                      let selectedModules = this.eventService.calculateSubjectForQuatorFourTest(progressiveTestEvents, this.moduleList);
                                      this.quarterFour = this.populateEventDetails(defaultEventDetails, selectedModules, '4thquartertest');
                                      this.quarterFour.allowToAttempt = true;
                                    } else {
                                      dynamoQuaterThreeExam.moduleIds.forEach((mid: string) => {
                                        let midIndex = progressiveTestEvents.findIndex(pt => pt.moduleId == mid);
                                        if (midIndex != -1) {
                                          progressiveTestEvents.splice(midIndex, 1);
                                        }
                                      });
                                      let selectedModules = this.eventService.calculateSubjectForQuatorFourTest(progressiveTestEvents, this.moduleList);
                                      this.quarterFour = this.populateEventDetails(defaultEventDetails, selectedModules, '4thquartertest');
                                      let progressiveTests: any[] = this.subjectDtls.filter(sd => sd.category == 'Progressive Test' && sd.status == 'COMPLETED');
                                      let isQuatorFour = this.eventService.checkEligibilityForQuatorFourTest(progressiveTests, this.moduleList);
                                      if (isQuatorFour) {
                                        this.quarterFour.allowToAttempt = true;
                                      } else {
                                        this.quarterFour.status = "NOQUESTION";
                                        this.quarterFour.allowToAttempt = false;
                                      }
                                    }
                                  }
                                }
                              }
                            } else {
                              let defaultEventDetails = this.subjectDtls.find(sd => sd.categoryId === '3rdquartertest');
                              dynamoQuaterOneExam.moduleIds.forEach((mid: string) => {
                                let midIndex = progressiveTestEvents.findIndex(pt => pt.moduleId == mid);
                                if (midIndex != -1) {
                                  progressiveTestEvents.splice(midIndex, 1);
                                }
                              });
                              dynamoQuaterTwoExam.moduleIds.forEach((mid: string) => {
                                let midIndex = progressiveTestEvents.findIndex(pt => pt.moduleId == mid);
                                if (midIndex != -1) {
                                  progressiveTestEvents.splice(midIndex, 1);
                                }
                              });

                              let selectedModules = this.eventService.calculateSubjectForQuatorTest(progressiveTestEvents, this.moduleList);
                              this.quarterThree = this.populateEventDetails(defaultEventDetails, selectedModules, '3rdquartertest');
                              let progressiveTests: any[] = this.subjectDtls.filter(sd => sd.category == 'Progressive Test' && sd.status == 'COMPLETED');
                              let isQuatorThree = this.eventService.checkEligibilityForQuatorThreeTest(progressiveTests, this.moduleList);
                              if (isQuatorThree) {
                                this.quarterThree.allowToAttempt = true;
                              } else {
                                this.quarterThree.status = "NOQUESTION";
                                this.quarterThree.allowToAttempt = false;
                              }
                            }


                          }
                        } else {
                          let dynamoQuaterOneExam = this.dynamoExams.find(dexam => dexam.categoryId === '1stquartertest');
                          let dynamoQuaterTwoExam = this.dynamoExams.find(dexam => dexam.categoryId === '2ndquartertest');
                          let defaultEventDetails = this.subjectDtls.find(sd => sd.categoryId === '1stproficiencytest');
                          let selectedModules = [...dynamoQuaterTwoExam.modules, ...dynamoQuaterOneExam.modules];
                          this.proficiencyOne = this.populateEventDetails(defaultEventDetails, selectedModules, '1stproficiencytest');
                          this.proficiencyOne.allowToAttempt = true;
                        }
                      }
                    } else {
                      let defaultEventDetails = this.subjectDtls.find(sd => sd.categoryId === '2ndquartertest');
                      dynamoQuaterOneExam.moduleIds.forEach((mid: string) => {
                        let midIndex = progressiveTestEvents.findIndex(pt => pt.moduleId == mid);
                        if (midIndex != -1) {
                          progressiveTestEvents.splice(midIndex, 1);
                        }
                      });
                      let selectedModules = this.eventService.calculateSubjectForQuatorTest(progressiveTestEvents, this.moduleList);
                      this.quarterTwo = this.populateEventDetails(defaultEventDetails, selectedModules, '2ndquartertest');
                      this.quarterTwo.allowToAttempt = true;
                    }
                  }

                }
              } else {
                let defaultEventDetails = this.subjectDtls.find(sd => sd.categoryId === '1stquartertest');
                let selectedModules = this.eventService.calculateSubjectForQuatorTest(progressiveTestEvents, this.moduleList);
                this.quarterOne = this.populateEventDetails(defaultEventDetails, selectedModules, '1stquartertest');
                this.quarterOne.allowToAttempt = true;
              }
            }

            this.subjectDtls.forEach(examSubjectrecord => {
              if (examSubjectrecord.status == 'COMPLETED' && examSubjectrecord.category == 'Diagnostic Test') {
                let proTestIndex = this.subjectDtls.findIndex(sd => sd.category == 'Progressive Test' && sd.moduleId == examSubjectrecord.moduleId);
                if (proTestIndex != -1) {
                  this.subjectDtls[proTestIndex].allowToAttempt = true;
                }
              }
            })
            
            // Final deduplication: Remove duplicate events by event ID before creating sortedRecords
            const uniqueEventsMap = new Map();
            this.subjectDtls.forEach(event => {
              if (!uniqueEventsMap.has(event.id)) {
                uniqueEventsMap.set(event.id, event);
              }
            });
            const uniqueSubjectDtls = Array.from(uniqueEventsMap.values());
            
            this.sortedRecords = uniqueSubjectDtls.reduce(function (r, a) {
              r[a.category] = r[a.category] || [];
              // Check if this event already exists in the category array to avoid duplicates
              if (!r[a.category].find(existing => existing.id === a.id)) {
                r[a.category].push(a);
              }
              return r;
            }, Object.create(null));
          }
          //console.log('2nd quater ', JSON.stringify(this.quarterTwo));
        }
      });
  }

  proceedForExamAppear(eventView: any) {
    if (eventView.type == 'DYNAMO EXAM') {
      this.createUserExam(eventView);
    } else {
      this.firestore.collection("user_events", ref => ref
        .where("eventId", "==", eventView.id)
        .where("userId", "==", this.userDetails.id))
        .get().subscribe(data => {
          if (!data.empty) {
            let appearedRecords: any[] = [];
            data.forEach((res: any) => {
              let userEvnt = res.data();
              userEvnt.isPublishRankAllow = false;
              appearedRecords.push(userEvnt);
            });
            if (appearedRecords.length > 0) {
              let event = appearedRecords.find(aprvideo => (aprvideo.status == 'COMPLETED' && aprvideo.totalCorrect >= eventView.passMark));
              if (null != event) {
                this.util.showToast(('You have already Completed this Exam'), 'danger', 'bottom')
              } else {
                eventView.isPublishRankAllow = false;
                this.createUserExam(eventView);
              }
            }

          } else {
            this.createUserExam(eventView);
          }
        });
    }

  }

  onClickSchedule(exam: any) {
    this.eventService.setExamForSchedule(exam);
    this.router.navigate(['home/dynamo/testSchedule']);
  }

  async cancelEventAlert(event: any, id: any, status: any) {
    const modal = await this.modalController.create({
      component: CancelExamAlertComponent,
      backdropDismiss: true,
      componentProps: {
        type: 'EVENT',
        status: status
      },
      cssClass: 'centerModal_2'
    })

    await modal.present();
    await modal.onDidDismiss().then(res => {
      if (res.data) {
        this.updateUserExam(event, id);
      }
    })
  }

  checkforExpiry(subjectDtls: any) {
    subjectDtls.forEach((exm: any) => {
      let result = this.dateUtilService.getDateDifferenceInDays(this.currentDate, exm.eventDate);
      if (result > 0) {
        exm.isExpired = false;
      } else {
        exm.isExpired = true;
      }
    });
  }

  onClickViewScore(exam: any) {
    this.eventService.setTestEvent(exam);
    this.router.navigate(['home/dynamo/finalScore', { eventId: exam.id, userEventId: exam.userEventId, type: exam.type, examType: 'DYNAMO EXAM' }]);
  }



  goToNotification() {
    this.router.navigate(['home/notification']);
  }

  getAllNotifications() {
    this.firestore.collection(FirebaseCollection.USER_NOTIFICATION, ref => ref
      .where('userId', '==', this.userDetails.id))
      .valueChanges().subscribe((requests: any[]) => {
        this.notificationCount = requests.filter(message => true && message.status == 'ACTIVE').length;
      });
  }
  openDescription(filter: any) {
    this.bottomSheet.open(DescriptionModalComponent, {
      data: {
        filter
      },
      panelClass: 'bottom-sheet'
    });

    // this.bottomSheet._openedBottomSheetRef.afterDismissed().subscribe((data: any) => {
    // })
  }




  async presentToast(msg: any) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
      color: 'dark',
      cssClass: 'customDarkToaster'
    });
    toast.present();
  }

  populateEventDetails(defaultEvent: any, selectedModules: any[], categoryId, eventType: string = 'DYNAMO EXAM') {

    let eventDetail: any = defaultEvent != null ? defaultEvent : {};
    eventDetail.id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    // eventDetail.eventCode = ('SKU-' + Math.random().toString(36).substring(2, 8)).toUpperCase();
    eventDetail.userEventId = eventDetail.id;
    eventDetail.eventId = eventDetail.id;
    eventDetail.boardName = this.userDetails.boardName;
    eventDetail.boardId = this.userDetails.boardId;
    eventDetail.className = this.userDetails.className;
    eventDetail.classId = this.userDetails.classId;
    eventDetail.subjectName = this.selectedSubject.displayName;
    eventDetail.subjectId = this.selectedSubject.id;
    let modules: any[] = [];
    let moduleIds: string[] = [];
    selectedModules.forEach(mod => {
      let singleModule = {
        id: mod.id,
        displayName: mod.displayName
      }
      moduleIds.push(mod.id);
      modules.push(singleModule);
    });
    eventDetail.eventName = defaultEvent?.category;
    if (null == eventDetail.eventName) {
      let fetchCategory = this.parameters.find(parm => parm.id == categoryId);
      if (fetchCategory) {
        eventDetail.eventName = fetchCategory.displayName;
      }
    }

    eventDetail.moduleIds = moduleIds;
    eventDetail.modules = modules;
    eventDetail.status = 'ACTIVE';
    eventDetail.type = eventType;
    eventDetail.typeId = 'dynamoexam';
    eventDetail.creationDate = this.dateUtilService.getCurrentDateWithYYYYMMDD();
    eventDetail.startTime = this.dateUtilService.getCurrentTimeWith12hrFormat();
    eventDetail.endTime = this.dateUtilService.getCurrentTimeWith12hrFormat();
    eventDetail.eventStartDate = eventDetail.creationDate;
    eventDetail.eventEndDate = this.dateUtilService.addDayToCurrentData(366);
    eventDetail.eventDate = eventDetail.creationDate;
    eventDetail.applicableType = 'SUBSCRIBTION';
    eventDetail.createdBy = 'USER';
    eventDetail.userId = this.userDetails.id;
    eventDetail.createdDetails = {
      id: this.userDetails.id,
      mobileNo: this.userDetails.mobileNo,
      imgUrl: this.userDetails.imageUrl,
      displayName: this.userDetails.firstName + " " + this.userDetails.lastName
    }
    eventDetail.token = this.userDetails.token;

    return eventDetail;
  }


  modalDismiss() {
    this.isEventInfoModalOpen = false;
    this.eventInfoModal.dismiss(null, 'cancel');
  }

  onClickEventInfo(keyName: any) {
    this.isEventInfoModalOpen = true;
    this.selectedCategory = this.parameters.find(parm => parm.displayName == keyName);
  }


}
