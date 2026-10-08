import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, NavController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { FirebaseCollection } from 'src/app/model/common/firebase-collection';
import { EventService } from 'src/app/services/event.service';
import { UserHelperService } from 'src/app/services/helper/user-helper.service';
import { UserServiceService } from 'src/app/services/user-service.service';

export interface ChapterLevelItem {
  levelNumber: number;
  levelName: string;
  tag: string;
  color: string;
  bgLight: string;
  icon: string;
  description: string;
  totalQuestions: number;
  totalTimeMinutes: number;
  totalTimeSeconds: number;
  displayTime?: string;
  questions: any[];
  isCompleted: boolean;
  isUnlocked: boolean;
  scoreText?: string;
  accuracy?: number;
  attempt?: any;
}

@Component({
  selector: 'app-chapter-levels',
  templateUrl: './chapter-levels.component.html',
  styleUrls: ['./chapter-levels.component.scss'],
})
export class ChapterLevelsComponent implements OnInit, OnDestroy {
  @Input() event: any = {} as any;
  @Input() selectedSubject: any = {} as any;

  userDetails: any = {};
  chapterNumberText: string = 'Chapter 1';
  chapterNameText: string = '';
  chapterProgress: number = 0;
  completedLevelsCount: number = 0;
  totalLevelsCount: number = 5;
  totalChapterQuestions: number = 125;
  avgLevelQuestions: number = 25;
  isLoading: boolean = true;

  levels: ChapterLevelItem[] = [];

  private subscriptions: Subscription = new Subscription();

  readonly defaultLevelDefinitions = [
    {
      levelNumber: 1,
      levelName: 'Foundation Practice',
      tag: 'Easy',
      color: '#16a34a',
      bgLight: '#ecfdf5',
      icon: 'leaf-outline',
      description: 'Understand key concepts and basic facts.',
      defaultQuestions: 25,
      defaultMinutes: 10.5
    },
    {
      levelNumber: 2,
      levelName: 'School Exam Readiness',
      tag: 'Moderate',
      color: '#2563eb',
      bgLight: '#eff6ff',
      icon: 'book-outline',
      description: 'Practice important questions from the school exam perspective.',
      defaultQuestions: 25,
      defaultMinutes: 10.5
    },
    {
      levelNumber: 3,
      levelName: 'Concept Application',
      tag: 'Application',
      color: '#f59e0b',
      bgLight: '#fffbeb',
      icon: 'bulb-outline',
      description: 'Apply your knowledge to different types of questions.',
      defaultQuestions: 25,
      defaultMinutes: 10.5
    },
    {
      levelNumber: 4,
      levelName: 'Higher-Order Thinking',
      tag: 'Proficiency',
      color: '#e11d48',
      bgLight: '#fff1f2',
      icon: 'settings-outline',
      description: 'Solve challenging questions and strengthen your problem-solving skills.',
      defaultQuestions: 25,
      defaultMinutes: 10.5
    },
    {
      levelNumber: 5,
      levelName: 'Mastery & Challenge',
      tag: 'Advanced',
      color: '#7c3aed',
      bgLight: '#f5f3ff',
      icon: 'trophy-outline',
      description: 'Tackle advanced questions for complete mastery of the chapter.',
      defaultQuestions: 25,
      defaultMinutes: 10.5
    }
  ];

  constructor(
    private modalController: ModalController,
    private router: Router,
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private firestore: AngularFirestore,
    private eventService: EventService,
    private userService: UserServiceService,
    private userHelperService: UserHelperService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.initLevelsStructure();

    // 1. Get user details
    const userSub = this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
      if (this.event?.id && this.userDetails?.id) {
        this.loadUserLevelAttempts();
      }
    });
    this.subscriptions.add(userSub);

    // 2. Get subject if not passed as Input
    if (!this.selectedSubject?.id) {
      const subjectSub = this.eventService.getSelectedSubject().subscribe(subj => {
        if (subj) this.selectedSubject = subj;
      });
      this.subscriptions.add(subjectSub);
    }

    // 3. Get event if not passed as Input
    if (!this.event?.id) {
      const eventSub = this.eventService.getTestEvent().subscribe(ev => {
        if (ev) {
          this.event = ev;
          this.parseChapterHeaderInfo();
          this.syncLevelsWithEvent();
          if (this.userDetails?.id) {
            this.loadUserLevelAttempts();
          }
        }
      });
      this.subscriptions.add(eventSub);
    } else {
      this.parseChapterHeaderInfo();
      this.syncLevelsWithEvent();
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private initLevelsStructure() {
    this.levels = this.defaultLevelDefinitions.map(def => ({
      levelNumber: def.levelNumber,
      levelName: def.levelName,
      tag: def.tag,
      color: def.color,
      bgLight: def.bgLight,
      icon: def.icon,
      description: def.description,
      totalQuestions: def.defaultQuestions,
      totalTimeMinutes: def.defaultMinutes,
      totalTimeSeconds: Math.round(def.defaultMinutes * 60),
      displayTime: `${def.defaultMinutes} Minutes`,
      questions: [],
      isCompleted: false,
      isUnlocked: def.levelNumber === 1
    }));
  }

  private parseChapterHeaderInfo() {
    const rawName = String(this.event?.moduleName || this.event?.eventName || '').trim();
    if (!rawName) {
      this.chapterNumberText = 'Chapter 1';
      this.chapterNameText = 'Module Practice';
      return;
    }

    // Match "Chapter X - Title" or "Chapter X Title" or "Module X"
    const chapterMatch = rawName.match(/^(chapter\s*\d+|module\s*\d+)\s*[:\-–—]?\s*(.*)$/i);
    if (chapterMatch) {
      this.chapterNumberText = chapterMatch[1].replace(/module/i, 'Chapter');
      this.chapterNameText = chapterMatch[2] || rawName;
    } else {
      // If moduleOrder is available, format as "Chapter {order + 1}"
      if (Number.isFinite(this.event?.moduleOrder) && this.event.moduleOrder < 100) {
        this.chapterNumberText = `Chapter ${this.event.moduleOrder + 1}`;
      } else {
        this.chapterNumberText = 'Chapter 1';
      }
      this.chapterNameText = rawName;
    }
  }

  private syncLevelsWithEvent() {
    if (!this.event) return;

    // Check if event has structured levels array from Firestore
    if (this.event.levels && Array.isArray(this.event.levels) && this.event.levels.length > 0) {
      this.levels.forEach(lvl => {
        const found = this.event.levels.find((l: any) => Number(l.levelNumber) === lvl.levelNumber);
        if (found) {
          lvl.levelName = found.levelName || lvl.levelName;
          lvl.tag = found.tag || lvl.tag;
          lvl.description = found.description || lvl.description;
          lvl.questions = found.questions || [];
          lvl.totalQuestions = lvl.questions.length > 0 ? lvl.questions.length : (Number(found.totalQuestions) || 0);
        }
      });
    } else if (this.event.questions && Array.isArray(this.event.questions) && this.event.questions.length > 0) {
      // Check if questions have `level` property
      const hasLevelProp = this.event.questions.some((q: any) => q.level);
      if (hasLevelProp) {
        this.levels.forEach(lvl => {
          lvl.questions = this.event.questions.filter((q: any) => Number(q.level) === lvl.levelNumber);
          lvl.totalQuestions = lvl.questions.length;
        });
      } else {
        // Distribute existing questions across 5 levels (e.g. up to 25 each)
        const allQ = this.event.questions;
        const chunkSize = Math.max(1, Math.ceil(allQ.length / 5));
        this.levels.forEach((lvl, idx) => {
          const start = idx * chunkSize;
          const end = start + chunkSize;
          lvl.questions = allQ.slice(start, end);
          lvl.totalQuestions = lvl.questions.length;
        });
      }
    }

    // Calculate totals across chapter
    this.totalChapterQuestions = this.levels.reduce((acc, curr) => acc + curr.totalQuestions, 0);
    this.avgLevelQuestions = Math.round(this.totalChapterQuestions / 5) || 5;

    // Recalculate each level's totalTimeSeconds, totalTimeMinutes, and displayTime
    this.recalculateLevelTimes();
  }

  private recalculateLevelTimes() {
    this.levels.forEach(lvl => {
      let foundTotalTime: number | undefined;
      if (this.event?.levels && Array.isArray(this.event.levels)) {
        const found = this.event.levels.find((l: any) => Number(l.levelNumber) === lvl.levelNumber);
        if (found && Number.isFinite(Number(found.totalTime))) {
          foundTotalTime = Number(found.totalTime);
        }
      }

      const timeData = this.calculateLevelTime(lvl.totalQuestions, foundTotalTime);
      lvl.totalTimeSeconds = timeData.seconds;
      lvl.totalTimeMinutes = timeData.minutes;
      lvl.displayTime = timeData.display;
    });
  }

  private calculateLevelTime(questionsCount: number, foundTotalTime?: number): { seconds: number, minutes: number, display: string } {
    if (!Number.isFinite(questionsCount) || questionsCount <= 0) {
      return { seconds: 0, minutes: 0, display: '0 Minutes' };
    }

    let perQuestionSec = 0;

    // 1. Check if event has perQuestionHour explicitly configured (in seconds)
    const rawPerQ = Number(this.event?.perQuestionHour);
    if (Number.isFinite(rawPerQ) && rawPerQ > 0) {
      perQuestionSec = rawPerQ;
    }
    // 2. Check if event has totalHour configured across all questions in this chapter
    else if (Number.isFinite(Number(this.event?.totalHour)) && Number(this.event?.totalHour) > 0 && this.totalChapterQuestions > 0) {
      perQuestionSec = Number(this.event.totalHour) / this.totalChapterQuestions;
    }
    // 3. Check if foundTotalTime was saved on level, ignoring the old hardcoded 630s default when question count is not 25
    else if (Number.isFinite(Number(foundTotalTime)) && Number(foundTotalTime) > 0) {
      if (!(Number(foundTotalTime) === 630 && questionsCount !== 25)) {
        perQuestionSec = Number(foundTotalTime) / questionsCount;
      }
    }

    // 4. Default fallback: 25.2 seconds per question (produces exactly 10.5 mins for 25 questions, 2.5 mins for 6 questions, 2.1 mins for 5 questions)
    if (!perQuestionSec || perQuestionSec <= 0) {
      perQuestionSec = 25.2;
    }

    const totalSeconds = Math.round(questionsCount * perQuestionSec);
    const rawMinutes = totalSeconds / 60;
    const roundedMinutes = Math.round(rawMinutes * 10) / 10;

    let display = '';
    if (totalSeconds < 60) {
      display = `${totalSeconds} Seconds`;
    } else if (roundedMinutes === 1) {
      display = `1 Minute`;
    } else {
      display = `${roundedMinutes} Minutes`;
    }

    return {
      seconds: totalSeconds,
      minutes: roundedMinutes,
      display: display
    };
  }

  loadUserLevelAttempts() {
    this.isLoading = true;
    const collectionName = this.event?.type === 'DYNAMO EXAM' ? 'user_dyanmo_exam' : FirebaseCollection.USER_EVENTS;

    this.firestore.collection(collectionName, ref =>
      ref.where('eventId', '==', this.event.id)
        .where('userId', '==', this.userDetails.id)
    ).get().subscribe({
      next: (snapshot) => {
        const attempts: any[] = [];
        snapshot.forEach((doc: any) => {
          const item = doc.data();
          item.id = doc.id;
          attempts.push(item);
        });
        this.processLevelAttempts(attempts);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching user level attempts:', err);
        this.isLoading = false;
      }
    });
  }

  private processLevelAttempts(attempts: any[]) {
    // Filter completed attempts
    const completedAttempts = attempts.filter((a: any) =>
      String(a.status || a.examStatus || '').toUpperCase() === 'COMPLETED'
    );

    let completedCount = 0;

    this.levels.forEach((lvl, index) => {
      // Find attempt matching levelNumber
      let lvlAttempt = completedAttempts.find((a: any) => Number(a.levelNumber) === lvl.levelNumber);

      // Fallback for legacy single attempt without levelNumber: map to Level 1
      if (!lvlAttempt && lvl.levelNumber === 1 && completedAttempts.length > 0) {
        const unassignedAttempt = completedAttempts.find((a: any) => !a.levelNumber);
        if (unassignedAttempt) lvlAttempt = unassignedAttempt;
      }

      if (lvlAttempt) {
        lvl.isCompleted = true;
        lvl.attempt = lvlAttempt;
        const correct = Number(lvlAttempt.totalCorrect) || 0;
        const total = Number(lvlAttempt.totalQuestion) || lvl.totalQuestions || 25;
        lvl.scoreText = `Score: ${correct}/${total}`;
        lvl.accuracy = Math.round((correct / Math.max(1, total)) * 100);
        completedCount++;
      } else {
        lvl.isCompleted = false;
        lvl.attempt = null;
        lvl.scoreText = '';
        lvl.accuracy = 0;
      }
    });

    // Determine unlocked status:
    // Level 1 is always unlocked.
    // Level X is unlocked if Level X-1 is completed.
    this.levels[0].isUnlocked = true;
    for (let i = 1; i < this.levels.length; i++) {
      this.levels[i].isUnlocked = this.levels[i - 1].isCompleted;
    }

    this.completedLevelsCount = completedCount;
    this.chapterProgress = Math.round((completedCount / this.totalLevelsCount) * 100);
  }

  async startLevelTest(level: ChapterLevelItem) {
    if (!level.isUnlocked) {
      this.presentToast(`Complete Level ${level.levelNumber - 1} to unlock this level.`);
      return;
    }

    // Determine questions for this level
    let levelQuestions = level.questions;
    if (!levelQuestions || levelQuestions.length === 0) {
      if (this.event?.questions && Array.isArray(this.event.questions)) {
        levelQuestions = this.event.questions;
      } else {
        this.presentToast('No questions currently set for this level.');
        return;
      }
    }

    const totalSeconds = level.totalTimeSeconds || Math.round(levelQuestions.length * 25);
    const perQuestionSec = Number(this.event?.perQuestionHour) > 0
      ? Number(this.event.perQuestionHour)
      : Math.max(15, Math.floor(totalSeconds / Math.max(1, levelQuestions.length)));

    const attemptId = `${this.event.id}_L${level.levelNumber}_${this.userDetails?.id || 'user'}`;

    // Calculate level marks accurately based on level questions
    let levelTotalMarks = levelQuestions.reduce((sum: number, q: any) => sum + (Number(q?.mark) || 0), 0);
    if (!levelTotalMarks || levelTotalMarks <= 0) {
      const totalChapterQ = this.totalChapterQuestions > 0
        ? this.totalChapterQuestions
        : (this.event?.questions?.length || levelQuestions.length);
      const rawEventMarks = Number(this.event?.eventMarks);
      if (rawEventMarks > 0 && totalChapterQ > 0) {
        const markPerQ = Math.round(rawEventMarks / totalChapterQ) || 2;
        levelTotalMarks = levelQuestions.length * markPerQ;
      } else {
        levelTotalMarks = levelQuestions.length * 2;
      }
    }

    // Clone event data customized for this level
    const levelTestEvent: any = {
      ...this.event,
      id: this.event.id,
      eventId: this.event.id,
      userEventId: attemptId,
      userEventDocId: attemptId,
      levelNumber: level.levelNumber,
      levelName: level.levelName,
      levelTag: level.tag,
      eventName: `${this.event.eventName} - Level ${level.levelNumber} (${level.levelName})`,
      questions: levelQuestions,
      questionToAttemp: levelQuestions.length,
      totalHour: totalSeconds,
      perQuestionHour: perQuestionSec,
      eventMarks: levelTotalMarks,
      totalMarks: levelTotalMarks
    };

    // Populate user event attempt record
    let quesData: any;
    if (this.event.type === 'DYNAMO EXAM') {
      quesData = this.userHelperService.populateUserEventData(
        null,
        levelTestEvent,
        this.userDetails,
        'STARTED',
        'DYNAMO EXAM',
        this.selectedSubject?.category
      );
      quesData.id = attemptId;
      quesData.eventId = this.event.id;
      quesData.userId = this.userDetails?.id;
      quesData.levelNumber = level.levelNumber;
      quesData.levelName = level.levelName;
      quesData.eventMarks = levelTotalMarks;
      quesData.totalMarks = levelTotalMarks;
      quesData.isPublishRankAllow = false;
      levelTestEvent.userEventData = quesData;
      try {
        await this.userService.setUserDynamoEventsToCollections(quesData);
      } catch (err) {
        console.error('Error saving dynamo user event:', err);
      }
    } else {
      quesData = this.userHelperService.populateUserEventData(
        null,
        levelTestEvent,
        this.userDetails,
        'STARTED',
        'EXAM',
        this.selectedSubject?.category
      );
      quesData.id = attemptId;
      quesData.eventId = this.event.id;
      quesData.userId = this.userDetails?.id;
      quesData.levelNumber = level.levelNumber;
      quesData.levelName = level.levelName;
      quesData.eventMarks = levelTotalMarks;
      quesData.totalMarks = levelTotalMarks;
      quesData.isPublishRankAllow = false;
      levelTestEvent.userEventData = quesData;
      try {
        await this.userService.setUserEventsToCollections(quesData);
      } catch (err) {
        console.error('Error saving user event:', err);
      }
    }

    // Set test event in service
    this.eventService.setTestEvent(levelTestEvent);

    // Close modal if presented as modal, and navigate to questions
    try {
      const topModal = await this.modalController.getTop();
      if (topModal) {
        await this.modalController.dismiss();
      }
    } catch (e) {
      // Ignore if not a modal
    }

    this.router.navigate(['home/dynamo/question']);
  }

  async viewLevelScore(level: ChapterLevelItem) {
    if (!level.attempt?.id) return;

    try {
      const topModal = await this.modalController.getTop();
      if (topModal) {
        await this.modalController.dismiss();
      }
    } catch (e) { }

    this.router.navigate(['home/dynamo/finalScore', {
      eventId: this.event.id,
      userEventId: level.attempt.id,
      type: this.event.type,
      examType: this.event.type,
      levelNumber: level.levelNumber
    }]);
  }

  async goBack() {
    try {
      const topModal = await this.modalController.getTop();
      if (topModal) {
        await this.modalController.dismiss();
        return;
      }
    } catch (e) { }

    this.navCtrl.back();
  }

  private async presentToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }
}
