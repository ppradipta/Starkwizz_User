import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { ModalController, NavController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { FirebaseCollection } from 'src/app/model/common/firebase-collection';
import { EventService } from 'src/app/services/event.service';
import { UserHelperService } from 'src/app/services/helper/user-helper.service';
import { UserServiceService } from 'src/app/services/user-service.service';
import { ChapterLevelsComponent } from '../chapter-levels/chapter-levels.component';

export interface ProgressiveAttemptState {
  attemptNumber: number;
  status: 'NOT_STARTED' | 'READY_TO_ATTEMPT' | 'SUCCESSFUL' | 'NOT_SUCCESSFUL' | 'LOCKED' | 'DISABLED';
  score?: number;
  totalQuestions: number;
  totalTimeMinutes: number;
  percentage?: number;
  record?: any;
}

export interface DiagnosticLevelSummary {
  levelNumber: number;
  totalQuestions: number;
  isCompleted: boolean;
}

@Component({
  selector: 'app-chapter-progressive',
  templateUrl: './chapter-progressive.component.html',
  styleUrls: ['./chapter-progressive.component.scss'],
})
export class ChapterProgressiveComponent implements OnInit, OnDestroy {
  @Input() event: any = {} as any;
  @Input() selectedSubject: any = {} as any;

  userDetails: any = {};
  chapterNumberText: string = 'Chapter 1';
  chapterNameText: string = '';
  isLoading: boolean = true;

  // Diagnostic Test Status
  diagnosticEvent: any = null;
  diagnosticLevels: DiagnosticLevelSummary[] = [
    { levelNumber: 1, totalQuestions: 25, isCompleted: true },
    { levelNumber: 2, totalQuestions: 25, isCompleted: true },
    { levelNumber: 3, totalQuestions: 25, isCompleted: true },
    { levelNumber: 4, totalQuestions: 25, isCompleted: true },
    { levelNumber: 5, totalQuestions: 25, isCompleted: true },
  ];
  totalDiagnosticQuestions: number = 125;
  isDiagnosticCompleted: boolean = true;

  // Progressive Test Info Cards
  totalQuestionsToAttempt: number = 50;
  totalTestTimeMinutes: number = 60;
  passingScorePercentage: number = 100;
  totalAttemptsAllowed: number = 3;

  // 3 Attempts State
  attempts: ProgressiveAttemptState[] = [
    {
      attemptNumber: 1,
      status: 'NOT_STARTED',
      totalQuestions: 50,
      totalTimeMinutes: 60,
    },
    {
      attemptNumber: 2,
      status: 'LOCKED',
      totalQuestions: 50,
      totalTimeMinutes: 60,
    },
    {
      attemptNumber: 3,
      status: 'LOCKED',
      totalQuestions: 50,
      totalTimeMinutes: 60,
    },
  ];

  // Outcome States
  isProgressiveCompleted: boolean = false;
  successfulAttemptNumber: number | null = null;
  isChapterEnded: boolean = false;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private modalController: ModalController,
    private router: Router,
    private navCtrl: NavController,
    private firestore: AngularFirestore,
    private eventService: EventService,
    private userService: UserServiceService,
    private userHelperService: UserHelperService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.totalQuestionsToAttempt = Number(this.event?.questionToAttemp) || 50;
    this.totalTestTimeMinutes = Number(this.event?.totalHour) > 0 ? Math.round(Number(this.event.totalHour) / 60) : 60;

    // 1. Get user details
    const userSub = this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
      if (this.event?.id && this.userDetails?.id) {
        this.loadProgressiveData();
      }
    });
    this.subscriptions.add(userSub);

    // 2. Get subject if not passed
    if (!this.selectedSubject?.id) {
      const subjSub = this.eventService.getSelectedSubject().subscribe((subj) => {
        if (subj) this.selectedSubject = subj;
      });
      this.subscriptions.add(subjSub);
    }

    // 3. Get event if not passed
    if (!this.event?.id) {
      const eventSub = this.eventService.getTestEvent().subscribe((ev) => {
        if (ev) {
          const effectiveEv = ev.baseChapterEvent || ev;
          this.event = effectiveEv;
          this.parseChapterHeaderInfo();
          if (this.userDetails?.id) {
            this.loadProgressiveData();
          }
        }
      });
      this.subscriptions.add(eventSub);
    } else {
      if (this.event?.baseChapterEvent) {
        this.event = this.event.baseChapterEvent;
      }
      this.parseChapterHeaderInfo();
    }
  }

  ionViewWillEnter() {
    this.refreshProgressiveData();
  }

  refreshProgressiveData() {
    if (!this.selectedSubject?.id) {
      this.eventService.getSelectedSubject().pipe(take(1)).subscribe((subj) => {
        if (subj) this.selectedSubject = subj;
      });
    }

    const currentEv = this.event?.baseChapterEvent || this.event;
    if (currentEv?.id) {
      this.event = currentEv;
      this.parseChapterHeaderInfo();
      if (this.userDetails?.id) {
        this.loadProgressiveData();
      }
    } else {
      this.eventService.getTestEvent().pipe(take(1)).subscribe((ev) => {
        if (ev) {
          this.event = ev.baseChapterEvent || ev;
          this.parseChapterHeaderInfo();
          if (this.userDetails?.id) {
            this.loadProgressiveData();
          }
        }
      });
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private parseChapterHeaderInfo() {
    let rawName = String(this.event?.moduleName || this.event?.eventName || '').trim();
    if (!rawName) {
      this.chapterNumberText = 'Chapter 1';
      this.chapterNameText = 'Knowing Our Numbers';
      return;
    }

    // Strip trailing "- Progressive Test" if present
    rawName = rawName.replace(/\s*-\s*Progressive\s*Test.*$/i, '').trim();

    const chapterMatch = rawName.match(/^(chapter\s*\d+|module\s*\d+)\s*[:\-–—]?\s*(.*)$/i);
    if (chapterMatch) {
      this.chapterNumberText = chapterMatch[1].replace(/module/i, 'Chapter');
      this.chapterNameText = chapterMatch[2] || rawName;
    } else {
      if (Number.isFinite(this.event?.moduleOrder) && this.event.moduleOrder < 100) {
        this.chapterNumberText = `Chapter ${this.event.moduleOrder + 1}`;
      } else {
        this.chapterNumberText = 'Chapter 1';
      }
      this.chapterNameText = rawName;
    }
  }

  private async loadProgressiveData() {
    this.isLoading = true;
    try {
      await Promise.all([
        this.loadDiagnosticModuleData(),
        this.loadUserProgressiveAttempts(),
      ]);
    } catch (err) {
      console.error('Error loading progressive data:', err);
    } finally {
      this.isLoading = false;
    }
  }

  // Load the Diagnostic Test event and levels for this module to show status bar and question pool count
  private async loadDiagnosticModuleData(): Promise<void> {
    const moduleId = this.event?.moduleId;
    if (!moduleId) return;

    return new Promise((resolve) => {
      this.firestore
        .collection('events', (ref) =>
          ref
            .where('moduleId', '==', moduleId)
            .where('category', '==', 'Diagnostic Test')
        )
        .get()
        .subscribe({
          next: (snap) => {
            if (!snap.empty) {
              const diagDoc: any = snap.docs[0].data();
              diagDoc.id = snap.docs[0].id;
              this.diagnosticEvent = diagDoc;

              if (diagDoc.levels && Array.isArray(diagDoc.levels) && diagDoc.levels.length > 0) {
                this.diagnosticLevels = diagDoc.levels.map((lvl: any, index: number) => ({
                  levelNumber: Number(lvl.levelNumber) || index + 1,
                  totalQuestions: Number(lvl.totalQuestions) || lvl.questions?.length || 25,
                  isCompleted: true,
                }));
                this.totalDiagnosticQuestions = this.diagnosticLevels.reduce(
                  (acc, curr) => acc + curr.totalQuestions,
                  0
                );
              } else if (diagDoc.questions && Array.isArray(diagDoc.questions)) {
                this.totalDiagnosticQuestions = diagDoc.questions.length || 125;
              }
            }
            resolve();
          },
          error: (err) => {
            console.error('Error fetching diagnostic test for progressive:', err);
            resolve();
          },
        });
    });
  }

  // Load existing attempts for this progressive test event
  private async loadUserProgressiveAttempts(): Promise<void> {
    const eventId = this.event?.id;
    const userId = this.userDetails?.id;
    if (!eventId || !userId) return;

    const collectionName =
      this.event?.type === 'DYNAMO EXAM' ? 'user_dyanmo_exam' : FirebaseCollection.USER_EVENTS;

    return new Promise((resolve) => {
      this.firestore
        .collection(collectionName, (ref) =>
          ref.where('eventId', '==', eventId).where('userId', '==', userId)
        )
        .get()
        .subscribe({
          next: (snapshot) => {
            const rawAttempts: any[] = [];
            snapshot.forEach((doc) => {
              const item = doc.data() as any;
              item.id = doc.id;
              rawAttempts.push(item);
            });

            this.processAttempts(rawAttempts);
            resolve();
          },
          error: (err) => {
            console.error('Error fetching user progressive attempts:', err);
            resolve();
          },
        });
    });
  }

  private processAttempts(rawAttempts: any[]) {
    // Filter completed attempts and sort chronologically
    const completedList = rawAttempts
      .filter((a) => String(a.status || a.examStatus || '').toUpperCase() === 'COMPLETED')
      .sort((a, b) => {
        const timeA = Number(a.completedAtEpoch ?? a.appearedDateUnix ?? 0);
        const timeB = Number(b.completedAtEpoch ?? b.appearedDateUnix ?? 0);
        return timeA - timeB;
      });

    // Reset attempt states
    this.attempts = [
      { attemptNumber: 1, status: 'NOT_STARTED', totalQuestions: this.totalQuestionsToAttempt, totalTimeMinutes: this.totalTestTimeMinutes },
      { attemptNumber: 2, status: 'LOCKED', totalQuestions: this.totalQuestionsToAttempt, totalTimeMinutes: this.totalTestTimeMinutes },
      { attemptNumber: 3, status: 'LOCKED', totalQuestions: this.totalQuestionsToAttempt, totalTimeMinutes: this.totalTestTimeMinutes },
    ];

    let passedAttemptFound = false;
    let passedNum: number | null = null;

    for (let i = 0; i < 3; i++) {
      const attemptNumber = i + 1;
      // Try to find attempt matching attemptNumber or by index
      const foundAttempt =
        completedList.find((a) => Number(a.attemptNumber) === attemptNumber) ??
        completedList[i];

      if (foundAttempt) {
        const correct = Number(foundAttempt.totalCorrect ?? 0);
        const total = Number(foundAttempt.totalQuestion ?? this.totalQuestionsToAttempt);
        const pct = Math.round((correct / Math.max(1, total)) * 100);
        const is100 = correct >= total;

        this.attempts[i].score = correct;
        this.attempts[i].totalQuestions = total;
        this.attempts[i].percentage = pct;
        this.attempts[i].record = foundAttempt;

        if (is100) {
          this.attempts[i].status = 'SUCCESSFUL';
          passedAttemptFound = true;
          if (passedNum === null) passedNum = attemptNumber;
        } else {
          this.attempts[i].status = 'NOT_SUCCESSFUL';
        }
      } else {
        // Not completed yet
        if (passedAttemptFound) {
          // If already passed earlier attempt, disable remaining
          this.attempts[i].status = 'DISABLED';
        } else {
          // Check if previous attempt was attempted
          if (i === 0) {
            this.attempts[i].status = 'NOT_STARTED';
          } else {
            const prevAttempt = this.attempts[i - 1];
            if (prevAttempt.status === 'NOT_SUCCESSFUL') {
              this.attempts[i].status = 'READY_TO_ATTEMPT';
            } else {
              this.attempts[i].status = 'LOCKED';
            }
          }
        }
      }
    }

    if (passedAttemptFound) {
      this.isProgressiveCompleted = true;
      this.successfulAttemptNumber = passedNum;
      this.isChapterEnded = false;
      // Disable any remaining un-attempted slots
      for (let i = (passedNum ?? 1); i < 3; i++) {
        if (!this.attempts[i].record) {
          this.attempts[i].status = 'DISABLED';
        }
      }
    } else {
      this.isProgressiveCompleted = false;
      this.successfulAttemptNumber = null;
      // If all 3 attempts completed without 100%, mark as Ended
      const all3Done = this.attempts.every((a) => a.status === 'NOT_SUCCESSFUL');
      this.isChapterEnded = all3Done;
    }
  }

  async startAttempt(attemptItem: ProgressiveAttemptState) {
    if (attemptItem.status !== 'NOT_STARTED' && attemptItem.status !== 'READY_TO_ATTEMPT') {
      return;
    }

    this.isLoading = true;

    try {
      // 1. Gather question pool
      let questionPool: any[] = [];

      if (this.event?.questions && Array.isArray(this.event.questions) && this.event.questions.length >= this.totalQuestionsToAttempt) {
        questionPool = this.event.questions;
      } else if (this.diagnosticEvent?.questions && Array.isArray(this.diagnosticEvent.questions) && this.diagnosticEvent.questions.length > 0) {
        questionPool = this.diagnosticEvent.questions;
      } else {
        // Fetch all questions for this module
        const snap = await this.firestore.collection('questions', (ref) =>
          ref
            .where('class.id', '==', this.event.classId)
            .where('subject.id', '==', this.event.subjectId)
            .where('module.id', '==', this.event.moduleId)
            .where('board', '==', this.event.boardName)
        ).get().toPromise();

        if (snap && !snap.empty) {
          snap.forEach((doc) => {
            const qData: any = doc.data();
            questionPool.push({
              id: qData.id,
              correctAnswer: qData.answers && qData.answers.length > 0 ? qData.answers[0] : '',
              text: qData.text,
              options: qData.options,
              mark: Number(qData.mark) || 1,
            });
          });
        }
      }

      // Fallback if still empty
      if (questionPool.length === 0 && this.event?.questions) {
        questionPool = this.event.questions;
      }

      if (questionPool.length === 0) {
        this.presentToast('No questions currently available for this Progressive Test.');
        this.isLoading = false;
        return;
      }

      // 2. Randomly select 50 questions
      const selectedQuestions = this.pickRandomQuestions(questionPool, this.totalQuestionsToAttempt);

      // 3. Build Attempt Event
      const attemptNumber = attemptItem.attemptNumber;
      const attemptId = `${this.event.id}_P${attemptNumber}_${this.userDetails?.id || 'user'}`;
      const totalTimeSec = this.totalTestTimeMinutes * 60; // 3600 seconds
      const perQSec = Math.max(15, Math.floor(totalTimeSec / selectedQuestions.length));

      const progressiveTestEvent: any = {
        ...this.event,
        baseChapterEvent: this.event,
        id: this.event.id,
        eventId: this.event.id,
        userEventId: attemptId,
        userEventDocId: attemptId,
        attemptNumber: attemptNumber,
        levelNumber: attemptNumber,
        category: 'Progressive Test',
        isProgressiveTest: true,
        isLevelTest: false,
        eventName: `${this.event.eventName} - Attempt ${attemptNumber}`,
        questions: selectedQuestions,
        questionToAttemp: selectedQuestions.length,
        totalHour: totalTimeSec,
        perQuestionHour: perQSec,
        passMark: selectedQuestions.length, // 100% score needed
        eventMarks: selectedQuestions.length,
        totalMarks: selectedQuestions.length,
      };

      // 4. Populate & save user event
      const collectionName =
        this.event.type === 'DYNAMO EXAM' ? 'user_dyanmo_exam' : FirebaseCollection.USER_EVENTS;

      const quesData = this.userHelperService.populateUserEventData(
        null,
        progressiveTestEvent,
        this.userDetails,
        'STARTED',
        this.event.type || 'DYNAMO EXAM',
        this.selectedSubject?.category
      );

      quesData.id = attemptId;
      quesData.eventId = this.event.id;
      quesData.userId = this.userDetails?.id;
      quesData.attemptNumber = attemptNumber;
      quesData.levelNumber = attemptNumber;
      quesData.category = 'Progressive Test';
      quesData.isProgressiveTest = true;
      quesData.isLevelTest = false;
      quesData.eventMarks = selectedQuestions.length;
      quesData.totalMarks = selectedQuestions.length;
      quesData.passMark = selectedQuestions.length;
      quesData.isPublishRankAllow = false;
      progressiveTestEvent.userEventData = quesData;

      if (this.event.type === 'DYNAMO EXAM') {
        await this.userService.setUserDynamoEventsToCollections(quesData);
      } else {
        await this.userService.setUserEventsToCollections(quesData);
      }

      // 5. Set in EventService and navigate
      this.eventService.setTestEvent(progressiveTestEvent);
      if (this.selectedSubject) {
        this.eventService.setSelectedSubject(this.selectedSubject);
      }

      try {
        const topModal = await this.modalController.getTop();
        if (topModal) {
          await this.modalController.dismiss();
        }
      } catch (e) { }

      this.router.navigate(['home/dynamo/question']);
    } catch (err) {
      console.error('Error starting progressive attempt:', err);
      this.presentToast('Failed to start attempt. Please try again.');
    } finally {
      this.isLoading = false;
    }
  }

  private pickRandomQuestions(pool: any[], count: number): any[] {
    const shuffled = pool.slice().sort(() => 0.5 - Math.random());
    if (shuffled.length >= count) {
      return shuffled.slice(0, count);
    }

    // If pool is smaller than requested count, repeat randomly to reach target count
    const result: any[] = [...shuffled];
    while (result.length < count && pool.length > 0) {
      const randQ = pool[Math.floor(Math.random() * pool.length)];
      result.push({ ...randQ });
    }
    return result.slice(0, count);
  }

  async reviewAttempt(attemptItem: ProgressiveAttemptState) {
    if (!attemptItem.record?.id) return;

    try {
      const topModal = await this.modalController.getTop();
      if (topModal) {
        await this.modalController.dismiss();
      }
    } catch (e) { }

    this.eventService.setTestEvent(this.event);
    if (this.selectedSubject) {
      this.eventService.setSelectedSubject(this.selectedSubject);
    }

    this.router.navigate(['home/dynamo/finalScore', {
      eventId: this.event.id,
      userEventId: attemptItem.record.id,
      type: this.event.type || 'DYNAMO EXAM',
      examType: this.event.type || 'DYNAMO EXAM',
      category: 'Progressive Test',
      attemptNumber: attemptItem.attemptNumber,
      isProgressiveTest: true,
      isLevelTest: false
    }]);
  }

  async goToDiagnosticReview() {
    try {
      const topModal = await this.modalController.getTop();
      if (topModal) {
        await this.modalController.dismiss();
      }
    } catch (e) { }

    if (this.diagnosticEvent) {
      this.eventService.setTestEvent(this.diagnosticEvent);
      if (this.selectedSubject) {
        this.eventService.setSelectedSubject(this.selectedSubject);
      }
      this.router.navigate(['home/dynamo/chapter-levels']);
    } else {
      this.navCtrl.back();
    }
  }

  async goBack() {
    try {
      const topModal = await this.modalController.getTop();
      if (topModal) {
        await this.modalController.dismiss();
        return;
      }
    } catch (e) { }

    this.router.navigate(['home/dynamo/subjectDetail'], { replaceUrl: true });
  }

  private async presentToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
      position: 'bottom',
    });
    await toast.present();
  }
}
