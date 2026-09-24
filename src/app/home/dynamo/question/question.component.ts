import { Location } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { IonModal, ModalController, Platform } from '@ionic/angular';
import {
  bounceInOnEnterAnimation,
  bounceOutOnLeaveAnimation, fadeOutOnLeaveAnimation,
  flashOnEnterAnimation, flipOnEnterAnimation, jelloOnEnterAnimation, pulseOnEnterAnimation, rubberBandOnEnterAnimation, shakeOnEnterAnimation,
  swingOnEnterAnimation, tadaOnEnterAnimation, wobbleOnEnterAnimation
} from 'angular-animations';
import { CountdownComponent, CountdownConfig } from 'ngx-countdown';
import { Subscription } from 'rxjs';
import { DateUtilService } from 'src/app/common/util/date-util.service';
import { buildQuizwhizzDigitalBadgeRecord } from 'src/app/common/util/quizwhizz-digital-badge.util';
import { FirebaseCollection } from 'src/app/model/common/firebase-collection';
import { Event } from 'src/app/model/event';
import { Questions } from 'src/app/model/question';
import { UserDetails, userEvents } from 'src/app/model/user';
import { ImageUploadComponent } from 'src/app/public/image-upload/image-upload.component';
import { EventService } from 'src/app/services/event.service';
import { UserHelperService } from 'src/app/services/helper/user-helper.service';
import { UserServiceService } from 'src/app/services/user-service.service';
import { UtilServiceService } from 'src/app/services/util-service.service';
import { environment } from 'src/environments/environment';
import { CancelExamAlertComponent } from '../cancel-exam-alert/cancel-exam-alert.component';
import { QuestionAnsImagePreviewComponent } from './question-ans-image-preview/question-ans-image-preview.component';
import * as moment from 'moment';
//declare var preventscreenshot: any

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss'],
  animations: [
    bounceInOnEnterAnimation(),
    bounceOutOnLeaveAnimation(),
    flashOnEnterAnimation(),
    pulseOnEnterAnimation(),
    rubberBandOnEnterAnimation(),
    shakeOnEnterAnimation(),
    swingOnEnterAnimation(),
    tadaOnEnterAnimation(),
    wobbleOnEnterAnimation(),
    jelloOnEnterAnimation(),
    flipOnEnterAnimation(),
    fadeOutOnLeaveAnimation(),
  ]
})
export class QuestionComponent implements OnInit {
  @ViewChild(IonModal) questionExplainModal: IonModal = {} as IonModal;
  @ViewChild('eventCountDown', { static: false }) private eventCountDown: CountdownComponent = {} as CountdownComponent;
  @ViewChild('questionTimeCountDown', { static: false }) private questionTimeCountDown: CountdownComponent = {} as CountdownComponent;
  selectedSubject: any = {} as any;
  testEvent: Event = {} as Event;
  //subscription: Subscription;
  subscription: Subscription = {} as Subscription;
  questionList: Questions[] = [];
  selectedQuestionIndex: number = 0;
  lastq: boolean = false;
  questionStartTime: string = '';
  questionStartEpochUs: number = 0;
  examStartTime: string = '';
  examStartEpochUs: number = 0;
  examEndTime: string = '';
  examEndEpochUs: number = 0;
  elapsedExamTimeUsDisplay: string = '';
  userDetails: UserDetails = new UserDetails();
  userEventData: userEvents = new userEvents();
  maxTime: any = 15;
  isQuesDisabled: boolean = false;
  eventTime: any = '';
  questionConfig: CountdownConfig = {
    leftTime: 0,
    format: 'mm:ss'
  };


  eventConfig: CountdownConfig = {
    leftTime: 0,
    format: 'H:mm:ss'
  };
  appearedQuestions: any[] = [];
  // animationTypes: any[] = ['bounce', 'flash', 'pulse', 'rubberBand', 'shake', 'swing', 'tada', 'wobble', 'jello', 'flip'];
  animationTypes: any[] = ['jello', 'swing', 'wobble', 'flip', 'rubberBand'];
  //animationTypes: any[] = ['bounce'];
  question: any;
  randomQuestionIndex: number[] = [];
  nextLoadder: boolean = false;
  skipLoadder: boolean = false;
  finishLoader: boolean = false;
  userAnswerText: string = '';
  userAnswerImages: string[] = [];
  platformfeature: any = {};
  quesExplainDetails: any = {};
  isQuesExplainModalOpen: boolean = false;
  lastSundays: any[] = [];
  currentYear = moment().format('YYYY');
  private hasAttemptedContestBadgeSave: boolean = false;
  constructor(private eventService: EventService,
    private firestore: AngularFirestore,
    private router: Router,
    private userHelperService: UserHelperService,
    private dateUtilService: DateUtilService,
    private userService: UserServiceService,
    private modalController: ModalController,
    private location: Location,
    private util: UtilServiceService,
    private platform: Platform
  ) {
    this.platform.ready().then(() => {
      // preventscreenshot.disable((a: any) => this.successCallback(a), (b: any) => this.errorCallback(b));
      // this.firestore.collection(FirebaseCollection.PARAMETER).doc('platformfeature')
      //   .get().subscribe(record => {
      //     if (record.exists) {
      //       this.platformfeature = record.data();
      //       if (null != this.platformfeature && this.platformfeature.isScreenshotAllow) {
      //         preventscreenshot.disable((a: any) => this.successCallback(a), (b: any) => this.errorCallback(b));
      //       } else {
      //         preventscreenshot.enabled((a: any) => this.successCallback(a), (b: any) => this.errorCallback(b));
      //       }
      //     }
      //   });

    })
  }




  ngOnInit() {
    this.selectedQuestionIndex = 0;
    this.lastq = false;
    this.isQuesDisabled = false;
    this.userService.getUserDetails().subscribe((userData: any) => {
      this.userDetails = userData;
    });
    this.getSelectedEvent();
    this.getSelectedSubject();
    this.generateLastSundays(this.currentYear);
  }
  successCallback(result: any) {
    this.util.showToast('Screen Recording not allow', 'success', 'bottom');
  }

  errorCallback(error: any) {
  }

  getSelectedSubject() {
    this.eventService.getSelectedSubject().subscribe(res => {
      this.selectedSubject = res;
    });

  }

  handleTimerEvent(event: any, question: any) {
    this.updateElapsedExamTimeUsDisplay();
    if (null != this.eventCountDown && this.eventCountDown.left < 2) {
      this.isQuesDisabled = true;
      this.examCompleted();
    }
    if (event.action == 'done') {
      this.isQuesDisabled = true;
    } else {
      this.isQuesDisabled = false;
    }
  }

  private updateElapsedExamTimeUsDisplay() {
    if (!this.examStartEpochUs || !Number.isFinite(this.examStartEpochUs)) {
      this.elapsedExamTimeUsDisplay = '';
      return;
    }
    const nowUs = this.dateUtilService.getCurrentEpochMicroSeconds();
    const diffUs = Math.max(0, nowUs - this.examStartEpochUs);
    this.elapsedExamTimeUsDisplay = this.dateUtilService.formatMicroSecondsToHhMmSsUs(diffUs);
  }


  getUserEventData(testEvent: any) {
    let collectionName = testEvent.type == 'QUIZWHIZZ EXAM' ? 'user_quizwhizz_events' : testEvent.type == 'DYNAMO EXAM' ? 'user_dyanmo_exam' : FirebaseCollection.USER_EVENTS;
    if (testEvent.type === 'DYNAMO EXAM') {
      this.userEventData = testEvent;
      const persistedStartUs = Number((this.userEventData as any)?.examStartEpochUs);
      if (Number.isFinite(persistedStartUs) && persistedStartUs > 0) {
        this.examStartEpochUs = persistedStartUs;
      }
    } else {
      this.firestore.collection(collectionName, ref => ref.where("eventId", "==", testEvent.id).where("userId", "==", this.userDetails.id)).get().subscribe((data: any) => {
        data.forEach((res: any) => {
          this.userEventData = res.data();
          const persistedStartUs = Number((this.userEventData as any)?.examStartEpochUs);
          if (Number.isFinite(persistedStartUs) && persistedStartUs > 0) {
            this.examStartEpochUs = persistedStartUs;
          }
        })
      });
    }

  }

  getSelectedEvent() {
    this.eventService.getTestEvent().subscribe((event: any) => {
      this.testEvent = event;
      event.line1 = event.eventName;
      if (event.eventName.includes('#')) {
        let eventNames = event.eventName.split('#');
        if (eventNames[0] && eventNames.length > 0) {
          event.line1 = eventNames[0];
        }
        if (eventNames[1] && eventNames.length > 1) {
          event.line2 = eventNames[1];
        }
        if (eventNames[2] && eventNames.length > 2) {
          event.line3 = eventNames[2];
        }
      }
      if (null != this.testEvent.totalHour) {
        this.eventConfig.leftTime = this.testEvent.totalHour;
        this.questionConfig.leftTime = this.testEvent.perQuestionHour;
        this.getUserEventData(this.testEvent);
      }
      this.prepareQuestionList();
      this.questionStartTime = this.dateUtilService.getCurrentDateWithMinAndSecondFormat();
      this.examStartTime = this.questionStartTime;
      const nowUs = this.dateUtilService.getCurrentEpochMicroSeconds();
      this.questionStartEpochUs = nowUs;
      if (!this.examStartEpochUs || !Number.isFinite(this.examStartEpochUs) || this.examStartEpochUs <= 0) {
        this.examStartEpochUs = nowUs;
      }
      this.updateElapsedExamTimeUsDisplay();
    });
  }





  ngOnDestroy() {


  }
  prepareQuestionList() {
    this.randomQuestionIndex = [];
    if (this.testEvent.questions.length > 0) {
      this.questionList = [];
      if (null == this.testEvent.questionToAttemp) {
        this.testEvent.questionToAttemp = this.testEvent.questions.length;
      }
      if (this.testEvent.questionPattern == 'RANDOM') {
        for (let i = 0; i < this.testEvent.questionToAttemp; i++) {
          this.generateRandom(0, this.testEvent.questions.length - 1, 'UNIQUE');
        }
        for (let i = 0; i < this.testEvent.questionToAttemp; i++) {
          let question = this.testEvent.questions[this.randomQuestionIndex[i]];
          this.firestore.collection("questions").doc(question.id).get().subscribe((record: any) => {
            if (record.exists) {
              let fetchquesDetail = record.data();
              let animationRandomNum = this.generateRandom(0, this.animationTypes.length - 1, 'NONE');
              fetchquesDetail['animationType'] = this.animationTypes[animationRandomNum];
              fetchquesDetail.options.forEach((opt: any) => {
                opt.isCorrect = null;
              });

              this.questionList.push(fetchquesDetail);
              if (null != this.questionList[0]) {
                this.question = this.questionList[0];

              }
              if (this.question.perQuestionTimer) {
                this.questionConfig.leftTime = this.question.perQuestionTimer;
              }
            }
          });

        }
      } else {
        for (let i = 0; i < this.testEvent.questionToAttemp; i++) {
          let question = this.testEvent.questions[i];
          this.firestore.collection("questions").doc(question.id).get().subscribe((record: any) => {
            if (record.exists) {
              let fetchquesDetail = record.data();
              let animationRandomNum = this.generateRandom(0, this.animationTypes.length - 1, 'NONE');
              fetchquesDetail['animationType'] = this.animationTypes[animationRandomNum];
              fetchquesDetail.options.forEach((opt: any) => {
                opt.isCorrect = null;
              });

              this.questionList.push(fetchquesDetail);
              if (null != this.questionList[0]) {
                this.question = this.questionList[0];
              }
              if (this.question.perQuestionTimer) {
                this.questionConfig.leftTime = this.question.perQuestionTimer;
              }
            }
          });
        }
      }
    }
  }

  generateRandom(min: number, max: number, type: any) {
    let random: number = Math.floor(Math.random() * (max - min + 1) + min);
    if ('UNIQUE' == type) {
      if (!this.randomQuestionIndex.includes(random)) {
        this.randomQuestionIndex.push(random);
      } else {
        this.generateRandom(min, max, 'UNIQUE');
      }
    } else {
      return random;
    }
    return random;
  }

  numberRange(min: number, max: number) {
    return [...Array(max + 1).keys()].filter(value => max >= value && min <= value);
  }

  goBack() {
    this.updateExamStatus();
  }



  skipQuestion() {
    this.userAnswerImages = [];
    this.userAnswerText = '';
    this.skipLoadder = true;
    this.question.mode = "APPTEMPTED";
    this.question.status = "SKIPPED";
    this.question.questionStartTime = this.questionStartTime;
    this.question.questionEndTime = this.dateUtilService.getCurrentDateWithMinAndSecondFormat();
    this.question.questionStartEpochUs = this.questionStartEpochUs;
    this.question.questionEndEpochUs = this.dateUtilService.getCurrentEpochMicroSeconds();
    const timeTakenUs = this.dateUtilService.getTimeDifferenceInMicroSecondsFromEpoch(this.question.questionStartEpochUs, this.question.questionEndEpochUs);

    let qData = {
      id: this.question.id,
      type: this.question.type,
      userSelectedOptionType: 'TEXT',
      userSelectedOption: this.question.selectedOption,
      mark: this.question.mark,
      isnegativeallow: this.question.isnegativeallow,
      status: this.question.status,
      startTime: this.question.questionStartTime,
      endTime: this.question.questionEndTime,
      startEpochUs: this.question.questionStartEpochUs,
      endEpochUs: this.question.questionEndEpochUs,
      timeTakenUs: timeTakenUs ?? null
    }
    let qindex = this.appearedQuestions.findIndex(apq => apq.id == qData.id);
    if (qindex == -1) {
      this.appearedQuestions.push(qData);
    }

    this.examEndTime = this.question.questionEndTime;
    if (!this.examStartEpochUs || !Number.isFinite(this.examStartEpochUs) || this.examStartEpochUs <= 0) {
      this.examStartEpochUs = Number(this.question.questionStartEpochUs) || this.dateUtilService.getCurrentEpochMicroSeconds();
    }
    this.examEndEpochUs = Number(this.question.questionEndEpochUs) || this.dateUtilService.getCurrentEpochMicroSeconds();
    const totalExamTimeUs = this.dateUtilService.getTimeDifferenceInMicroSecondsFromEpoch(this.examStartEpochUs, this.examEndEpochUs);
    //caculate   totalExamTime    
    let totalSkipQuestions = this.appearedQuestions.filter(apq => apq.status === "SKIPPED").length;
    let totalCorrect = this.appearedQuestions.filter(apq => apq.status === "CORRECT").length;
    let totalInCorrect = this.appearedQuestions.filter(apq => apq.status === "WRONG").length;
    let totalNgeativeMarkInCorrect = this.appearedQuestions.filter(apq => (apq.status === "WRONG" && apq.isnegativeallow)).length;
    let totalCorrectMark = this.appearedQuestions.filter(apq => apq.status === "CORRECT").reduce((a, b) => a + (b['mark'] || 0), 0);
    let totalNgeativeMark = this.appearedQuestions.filter(apq => (apq.status === "WRONG" && apq.isnegativeallow)).reduce((a, b) => a + (b['mark'] || 0), 0);
    let totalSecuredMark = totalCorrectMark - totalNgeativeMark;
    let totalExamTime = this.dateUtilService.getTimeDifferenceInSeconds(this.examStartTime, this.examEndTime);
    let collectionName = this.testEvent.type == 'QUIZWHIZZ EXAM' ? 'user_quizwhizz_events' : this.testEvent.type == 'DYNAMO EXAM' ? 'user_dyanmo_exam' : FirebaseCollection.USER_EVENTS;
    this.firestore.collection(collectionName)
      .doc(this.userEventData.id).update({
        totalAppearQuesiton: this.appearedQuestions.length,
        totalSkipQuestions: totalSkipQuestions,
        totalCorrect: totalCorrect,
        totalInCorrect: totalInCorrect,
        totalSecuredMark: totalSecuredMark,
        totalNgeativeMarkInCorrect: totalNgeativeMarkInCorrect,
        totalNgeativeMark: totalNgeativeMark,
        totalCorrectMark: totalCorrectMark,
        totalQuestion: this.questionList.length,
        examEndTime: this.examEndTime,
        examStartTime: this.examStartTime,
        examStartEpochUs: this.examStartEpochUs,
        examEndEpochUs: this.examEndEpochUs,
        totalExamTime: totalExamTime,
        totalExamTimeDisplay: this.dateUtilService.formattTimeDifferenceInSeconds(totalExamTime),
        totalExamTimeUs: totalExamTimeUs ?? null,
        totalExamTimeUsDisplay: totalExamTimeUs != null ? this.dateUtilService.formatMicroSecondsToHhMmSsUs(totalExamTimeUs) : null,
        status: "INPROGRESS",
        examStatus: "INPROGRESS",
      }).then(result => {
        this.isQuesDisabled = false;
        this.skipLoadder = false;
        this.questionStartTime = this.dateUtilService.getCurrentDateWithMinAndSecondFormat();
        this.questionStartEpochUs = this.dateUtilService.getCurrentEpochMicroSeconds();
        this.updateElapsedExamTimeUsDisplay();
        if (this.lastq) {
          this.examCompleted();
        } else {
          this.question = new Questions();
          this.question.options = [];
          this.selectedQuestionIndex = this.selectedQuestionIndex + 1;
          this.question = this.questionList[this.selectedQuestionIndex];
          this.question.options = this.questionList[this.selectedQuestionIndex].options;
          if (this.question.perQuestionTimer) {
            this.questionConfig.leftTime = this.question.perQuestionTimer;
          } else {
            this.questionConfig.leftTime = this.testEvent.perQuestionHour;
          }
        }
        if (this.selectedQuestionIndex == this.questionList.length - 1) {
          this.lastq = true;
        } else {
          this.lastq = false;
        }
      });

    //  });

  }




  nextQuestion() {
    this.userAnswerImages = [];
    this.userAnswerText = '';
    this.nextLoadder = true;
    this.question.questionStartTime = this.questionStartTime;
    this.question.questionEndTime = this.dateUtilService.getCurrentDateWithMinAndSecondFormat();
    this.question.questionStartEpochUs = this.questionStartEpochUs;
    this.question.questionEndEpochUs = this.dateUtilService.getCurrentEpochMicroSeconds();
    const timeTakenUs = this.dateUtilService.getTimeDifferenceInMicroSecondsFromEpoch(this.question.questionStartEpochUs, this.question.questionEndEpochUs);
    if (null == this.question.status) {
      this.question.mode = "APPTEMPTED";
      this.question.status = "SKIPPED";
    }
    if (this.question.type == 'SUBJECTIVE_NO_OPTION') {
      let qData = {
        id: this.question.id,
        type: this.question.type,
        userSelectedOptionType: this.question.selectedOptionType,
        userSelectedOption: this.question.selectedOption,
        mark: null,
        isnegativeallow: this.question.isnegativeallow,
        status: this.question.status,
        startTime: this.question.questionStartTime,
        endTime: this.question.questionEndTime,
        startEpochUs: this.question.questionStartEpochUs,
        endEpochUs: this.question.questionEndEpochUs,
        timeTakenUs: timeTakenUs ?? null
      }
      let qindex = this.appearedQuestions.findIndex(apq => apq.id == qData.id);
      if (qindex == -1) {
        this.appearedQuestions.push(qData);
      }

    } else {
      let qData = {
        id: this.question.id,
        type: this.question.type,
        userSelectedOptionType: 'TEXT',
        userSelectedOption: this.question.selectedOption,
        mark: this.question.mark,
        isnegativeallow: this.question.isnegativeallow,
        status: this.question.status,
        startTime: this.question.questionStartTime,
        endTime: this.question.questionEndTime,
        startEpochUs: this.question.questionStartEpochUs,
        endEpochUs: this.question.questionEndEpochUs,
        timeTakenUs: timeTakenUs ?? null
      }
      let qindex = this.appearedQuestions.findIndex(apq => apq.id == qData.id);
      if (qindex == -1) {
        this.appearedQuestions.push(qData);
      }
    }

    this.questionStartTime = this.dateUtilService.getCurrentDateWithMinAndSecondFormat();
    this.questionStartEpochUs = this.dateUtilService.getCurrentEpochMicroSeconds();
    this.examEndTime = this.question.questionEndTime;
    if (!this.examStartEpochUs || !Number.isFinite(this.examStartEpochUs) || this.examStartEpochUs <= 0) {
      this.examStartEpochUs = Number(this.question.questionStartEpochUs) || this.dateUtilService.getCurrentEpochMicroSeconds();
    }
    this.examEndEpochUs = Number(this.question.questionEndEpochUs) || this.dateUtilService.getCurrentEpochMicroSeconds();
    const totalExamTimeUs = this.dateUtilService.getTimeDifferenceInMicroSecondsFromEpoch(this.examStartEpochUs, this.examEndEpochUs);
    //caculate   totalExamTime    
    let totalSkipQuestions = this.appearedQuestions.filter(apq => apq.status === "SKIPPED").length;
    let totalCorrect = this.appearedQuestions.filter(apq => apq.status === "CORRECT").length;
    let totalInCorrect = this.appearedQuestions.filter(apq => apq.status === "WRONG").length;
    let totalNgeativeMarkInCorrect = this.appearedQuestions.filter(apq => (apq.status === "WRONG" && apq.isnegativeallow)).length;
    let totalCorrectMark = this.appearedQuestions.filter(apq => apq.status === "CORRECT").reduce((a, b) => a + (b['mark'] || 0), 0);
    let totalNgeativeMark = this.appearedQuestions.filter(apq => (apq.status === "WRONG" && apq.isnegativeallow)).reduce((a, b) => a + (b['mark'] || 0), 0);
    let totalSecuredMark = totalCorrectMark - totalNgeativeMark;
    let totalExamTime = this.dateUtilService.getTimeDifferenceInSeconds(this.examStartTime, this.examEndTime);
    let collectionName = this.testEvent.type == 'QUIZWHIZZ EXAM' ? 'user_quizwhizz_events' : this.testEvent.type == 'DYNAMO EXAM' ? 'user_dyanmo_exam' : FirebaseCollection.USER_EVENTS;
    this.firestore.collection(collectionName)
      .doc(this.userEventData.id).update({
        totalAppearQuesiton: this.appearedQuestions.length,
        totalSkipQuestions: totalSkipQuestions,
        totalCorrect: totalCorrect,
        totalInCorrect: totalInCorrect,
        totalSecuredMark: totalSecuredMark,
        totalNgeativeMarkInCorrect: totalNgeativeMarkInCorrect,
        totalNgeativeMark: totalNgeativeMark,
        totalCorrectMark: totalCorrectMark,
        totalQuestion: this.questionList.length,
        examEndTime: this.examEndTime,
        examStartTime: this.examStartTime,
        examStartEpochUs: this.examStartEpochUs,
        examEndEpochUs: this.examEndEpochUs,
        totalExamTime: totalExamTime,
        totalExamTimeDisplay: this.dateUtilService.formattTimeDifferenceInSeconds(totalExamTime),
        totalExamTimeUs: totalExamTimeUs ?? null,
        totalExamTimeUsDisplay: totalExamTimeUs != null ? this.dateUtilService.formatMicroSecondsToHhMmSsUs(totalExamTimeUs) : null,
        status: "INPROGRESS",
        examStatus: "INPROGRESS",
      }).then(result => {
        this.isQuesDisabled = false;
        this.nextLoadder = false;
        this.updateElapsedExamTimeUsDisplay();
        if (this.lastq) {
          this.examCompleted();
        } else {
          this.question = new Questions();
          this.question.options = [];
          this.selectedQuestionIndex = this.selectedQuestionIndex + 1;
          this.question = this.questionList[this.selectedQuestionIndex];
          if (this.question.perQuestionTimer) {
            this.questionConfig.leftTime = this.question.perQuestionTimer;
          } else {
            this.questionConfig.leftTime = this.testEvent.perQuestionHour;
          }
        }
        if (this.selectedQuestionIndex == this.questionList.length - 1) {
          this.lastq = true;
        } else {
          this.lastq = false;
        }

      });
  }


  examCompleted() {
    this.userAnswerImages = [];
    this.userAnswerText = '';
    this.finishLoader = true;
    this.isQuesDisabled = false;
    this.userEventData.status = "COMPLETED";
    // need to update data base preoprly with status of exam and mark as completed

    this.question.questionStartTime = this.questionStartTime;
    this.question.questionEndTime = this.dateUtilService.getCurrentDateWithMinAndSecondFormat();
    this.question.questionStartEpochUs = this.questionStartEpochUs;
    this.question.questionEndEpochUs = this.dateUtilService.getCurrentEpochMicroSeconds();
    const timeTakenUs = this.dateUtilService.getTimeDifferenceInMicroSecondsFromEpoch(this.question.questionStartEpochUs, this.question.questionEndEpochUs);
    if (null == this.question.status) {
      this.question.mode = "APPTEMPTED";
      this.question.status = "SKIPPED";
    }
    if (this.question.type == 'SUBJECTIVE_NO_OPTION') {
      let qData = {
        id: this.question.id,
        type: this.question.type,
        userSelectedOptionType: this.question.selectedOptionType,
        userSelectedOption: this.question.selectedOption,
        mark: null,
        isnegativeallow: this.question.isnegativeallow,
        status: this.question.status,
        startTime: this.question.questionStartTime,
        endTime: this.question.questionEndTime,
        startEpochUs: this.question.questionStartEpochUs,
        endEpochUs: this.question.questionEndEpochUs,
        timeTakenUs: timeTakenUs ?? null
      }
      let qindex = this.appearedQuestions.findIndex(apq => apq.id == qData.id);
      if (qindex == -1) {
        this.appearedQuestions.push(qData);
      }

    } else {
      let qData = {
        id: this.question.id,
        type: this.question.type,
        userSelectedOptionType: 'TEXT',
        userSelectedOption: this.question.selectedOption,
        mark: this.question.mark,
        isnegativeallow: this.question.isnegativeallow,
        status: this.question.status,
        startTime: this.question.questionStartTime,
        endTime: this.question.questionEndTime,
        startEpochUs: this.question.questionStartEpochUs,
        endEpochUs: this.question.questionEndEpochUs,
        timeTakenUs: timeTakenUs ?? null
      }
      let qindex = this.appearedQuestions.findIndex(apq => apq.id == qData.id);
      if (qindex == -1) {
        this.appearedQuestions.push(qData);
      }
    }
    this.checkForSkipQuestion();
    this.examEndTime = this.question.questionEndTime;
    if (!this.examStartEpochUs || !Number.isFinite(this.examStartEpochUs) || this.examStartEpochUs <= 0) {
      this.examStartEpochUs = Number(this.question.questionStartEpochUs) || this.dateUtilService.getCurrentEpochMicroSeconds();
    }
    this.examEndEpochUs = Number(this.question.questionEndEpochUs) || this.dateUtilService.getCurrentEpochMicroSeconds();
    const totalExamTimeUs = this.dateUtilService.getTimeDifferenceInMicroSecondsFromEpoch(this.examStartEpochUs, this.examEndEpochUs);
    //caculate   totalExamTime    
    let totalSkipQuestions = this.appearedQuestions.filter(apq => apq.status === "SKIPPED").length;
    let totalCorrect = this.appearedQuestions.filter(apq => apq.status === "CORRECT").length;
    let totalInCorrect = this.appearedQuestions.filter(apq => apq.status === "WRONG").length;
    let totalNgeativeMarkInCorrect = this.appearedQuestions.filter(apq => (apq.status === "WRONG" && apq.isnegativeallow)).length;
    let totalCorrectMark = this.appearedQuestions.filter(apq => apq.status === "CORRECT").reduce((a, b) => a + (b['mark'] || 0), 0);
    let totalNgeativeMark = this.appearedQuestions.filter(apq => (apq.status === "WRONG" && apq.isnegativeallow)).reduce((a, b) => a + (b['mark'] || 0), 0);
    let totalSecuredMark = totalCorrectMark - totalNgeativeMark;
    let totalExamTime = this.dateUtilService.getTimeDifferenceInSeconds(this.examStartTime, this.examEndTime);
    const completedDate = this.dateUtilService.getCurrentDateWithYYYYMMDD();
    let examQualifyStatus = 'NAP';
    if (this.testEvent.passMark) {
      examQualifyStatus = totalCorrect >= this.testEvent.passMark ? 'PASS' : 'FAIL';
    }
    let collectionName = this.testEvent.type == 'QUIZWHIZZ EXAM' ? 'user_quizwhizz_events' : this.testEvent.type == 'DYNAMO EXAM' ? 'user_dyanmo_exam' : FirebaseCollection.USER_EVENTS;
    this.firestore.collection(collectionName)
      .doc(this.userEventData.id).update({
        status: "COMPLETED",
        examStatus: "COMPLETED",
        examPassStatus: examQualifyStatus,
        appearedDate: completedDate,
        appearedDateUnix: this.dateUtilService.getUnixTime(completedDate),
        completedAt: this.dateUtilService.getCurrentDateWithTime(),
        completedAtEpoch: this.dateUtilService.getCurrentMilliSeconds(),
        completedAtEpochUs: this.dateUtilService.getCurrentEpochMicroSeconds(),
        totalAppearQuesiton: this.appearedQuestions.length,
        totalSkipQuestions: totalSkipQuestions,
        totalCorrect: totalCorrect,
        totalInCorrect: totalInCorrect,
        totalSecuredMark: totalSecuredMark,
        totalNgeativeMark: totalNgeativeMark,
        totalNgeativeMarkInCorrect: totalNgeativeMarkInCorrect,
        totalCorrectMark: totalCorrectMark,
        totalQuestion: this.questionList.length,
        examEndTime: this.examEndTime,
        examStartTime: this.examStartTime,
        examStartEpochUs: this.examStartEpochUs,
        examEndEpochUs: this.examEndEpochUs,
        totalExamTime: totalExamTime,
        totalExamTimeDisplay: this.dateUtilService.formattTimeDifferenceInSeconds(totalExamTime),
        totalExamTimeUs: totalExamTimeUs ?? null,
        totalExamTimeUsDisplay: totalExamTimeUs != null ? this.dateUtilService.formatMicroSecondsToHhMmSsUs(totalExamTimeUs) : null,
      }).then(res => {

        if (this.testEvent.type == 'QUIZWHIZZ EXAM') {
          let lastSunday = this.lastSundays.filter(clas => clas.lastSunday == this.testEvent.eventStartDate);
          if (lastSunday.length > 0) {
            let reward: any = this.eventService.generateRewardLastSunday(totalSecuredMark);
            reward.eventDate = this.testEvent.eventStartDate;
            reward.eventName = this.testEvent.eventName;
            this.eventService.updateUserRewardPointCollecton(this.userDetails, totalSecuredMark, reward, );
          } else {
            let reward: any = this.eventService.generateRewardNotLastSunday(totalSecuredMark);
            reward.eventDate = this.testEvent.eventStartDate;
            reward.eventName = this.testEvent.eventName;
            this.eventService.updateUserRewardPointCollecton(this.userDetails, totalSecuredMark, reward,);
          }
        }

        this.firestore.collection(collectionName)
          .doc(this.userEventData.id).set(
            { questions: JSON.parse(JSON.stringify(this.appearedQuestions)) },
            { merge: true }
          ).then(res => {
            void this.tryAutoSaveQuizwhizzContestBadge();
            this.finishLoader = false;
            let userNoti = this.userHelperService.populateUserNotiForExmFinished(this.userDetails, this.userEventData);
            this.userService.setUserNotificationData(userNoti);
            if (environment.push.includes('EVENT_COMPLETED')) {
              this.userService.processEventNotification(this.userEventData, 'EVENT_COMPLETED');
            }
             if (environment.sms.includes('EVENT_COMPLETED')) {
               this.userService.processEventSMS(this.userEventData, this.userDetails.mobileNo, 'EVENT_COMPLETED');
             }
             this.util.showToast(('You have successfully completed the test.'), 'success', 'bottom');
             this.eventService.setTestEvent(this.testEvent);
            // Replace the question page in history so back from Final Score won't reopen the test again.
            this.router.navigate(
              ['home/dynamo/finalScore', { eventId: this.userEventData.eventId, userEventId: this.userEventData.id, type: this.userEventData.type }],
              { replaceUrl: true }
            );
            this.appearedQuestions = [];
          });

      })
    //  })



  }

  checkForSkipQuestion() {
    let skipedQuestions: any[] = [];
    if (this.questionList.length > 0) {
      this.questionList.forEach(qus => {
        let index = this.appearedQuestions.findIndex(apq => apq.id == qus.id);
        if (index == -1) {
          skipedQuestions.push(qus);
        }
      })
    }

    // let skipedQuestions = this.questionList.filter(o1 => !(this.appearedQuestions.indexOf(o1) == -1));
    if (skipedQuestions.length > 0) {
      skipedQuestions.forEach((squestion: any) => {
        squestion.mode = "APPTEMPTED";
        squestion.status = "SKIPPED";
        squestion.questionStartTime = this.dateUtilService.getCurrentDateWithMinAndSecondFormat();
        squestion.questionEndTime = this.dateUtilService.getCurrentDateWithMinAndSecondFormat();
        squestion.questionStartEpochUs = this.dateUtilService.getCurrentEpochMicroSeconds();
        squestion.questionEndEpochUs = this.dateUtilService.getCurrentEpochMicroSeconds();
        const timeTakenUs = this.dateUtilService.getTimeDifferenceInMicroSecondsFromEpoch(squestion.questionStartEpochUs, squestion.questionEndEpochUs);

        let qData = {
          id: squestion.id,
          type: squestion.type,
          userSelectedOptionType: 'TEXT',
          userSelectedOption: squestion.selectedOption,
          mark: squestion.mark,
          isnegativeallow: squestion.isnegativeallow,
          status: squestion.status,
          startTime: squestion.questionStartTime,
          endTime: squestion.questionEndTime,
          startEpochUs: squestion.questionStartEpochUs,
          endEpochUs: squestion.questionEndEpochUs,
          timeTakenUs: timeTakenUs ?? null
        }
        let qindex = this.appearedQuestions.findIndex(apq => apq.id == qData.id);
        if (qindex == -1) {
          this.appearedQuestions.push(qData);
        }
      })
    }
  }


  chnageAnswer(event: any) {
    if (this.question.answers.length == 1) {
      this.question.options.forEach((opt: any) => {
        opt.isCorrect = 'none-option';
      });
      let index = this.question.options.findIndex((opt: any) => opt.sequence == event);
      if (index != -1) {
        let result = this.question.answers[0] == event;
        if (result) {
          //this.isCorrect = true;
          this.question.options[index]['isCorrect'] = 'currect-option';
          this.question.selectedOption = event;
          this.question.status = "CORRECT";
          this.question.mode = "APPTEMPTED";
        } else {
          //this.isCorrect = false;
          this.question.options[index]['isCorrect'] = 'wrong-option';
          this.question.selectedOption = event;
          this.question.status = "WRONG";
          this.question.mode = "APPTEMPTED";
        }
      }
    } else if (this.question.answers.length > 1) {
      let index = this.question.options.findIndex((opt: any) => opt.sequence == event);
      if (index != -1) {
        this.question.options[index]['isCorrect'] = 'currect-option';
        let selectedOptions = this.question.options.filter((opt: any) => opt.isCorrect == 'currect-option').map((a: any) => a.sequence);
        let isEqual = this.arraysEqual(selectedOptions, this.question.answers);
        this.question.selectedOption = selectedOptions;
        if (isEqual) {
          this.question.status = "CORRECT";
          this.question.mode = "APPTEMPTED";
        } else {
          this.question.status = "WRONG";
          this.question.mode = "APPTEMPTED";
        }
      }
    }
  }

  arraysEqual(a: any, b: any) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    // If you don't care about the order of the elements inside
    // the array, you should sort both arrays here.
    // Please note that calling sort on an array will modify that array.
    // you might want to clone your array first.

    for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  async updateExamStatus() {
    const modal = await this.modalController.create({
      component: CancelExamAlertComponent,
      backdropDismiss: true,
      componentProps: {
        type: 'EXAM'
      },
      cssClass: 'examAlertModal'
    })

    await modal.present();
    await modal.onDidDismiss().then(res => {
      if (res.data == 'FINISH') {
        if (this.userEventData) {
          this.location.back();
          let collectionName = this.testEvent.type == 'QUIZWHIZZ EXAM' ? 'user_quizwhizz_events' : FirebaseCollection.USER_EVENTS;
          this.firestore.collection(collectionName)
             .doc(this.userEventData.id).update({
               status: "COMPLETED"
             }).then(() => {
              void this.tryAutoSaveQuizwhizzContestBadge();
            }).catch(() => undefined);
        }
      }
    })
  }

  private async tryAutoSaveQuizwhizzContestBadge() {
    if (this.hasAttemptedContestBadgeSave) return;
    this.hasAttemptedContestBadgeSave = true;

    if (String(this.testEvent?.type || '').toUpperCase() !== 'QUIZWHIZZ EXAM') return;
    if (!this.userDetails?.id || !this.userDetails?.classId || !this.userDetails?.boardId) return;

    const contestDate = String((this.testEvent as any)?.eventEndDate || '').trim();
    if (!contestDate) return;

    // New merged Sunday contest writes a single user event record (eventId starts with `quizwhizz_sunday_`).
    // In that case, save the badge directly from the combined score rather than requiring 3 separate event attempts.
    const isMergedContest = String((this.testEvent as any)?.id || '').startsWith('quizwhizz_sunday_');
    if (isMergedContest) {
      const totalScore = Number((this.userEventData as any)?.totalSecuredMark ?? 0) || 0;
      const totalMarks =
        Number((this.userEventData as any)?.totalMarks ?? 0) ||
        Number((this.testEvent as any)?.eventMarks ?? 0) ||
        0;

      const badge = buildQuizwhizzDigitalBadgeRecord({
        userId: this.userDetails.id,
        boardId: this.userDetails.boardId,
        classId: this.userDetails.classId,
        contestDate,
        createdAtEpoch: this.dateUtilService.getCurrentMilliSeconds(),
        totalScore,
        totalMarks,
      });

      if (!badge) return;
      this.firestore
        .collection(FirebaseCollection.QUIZWHIZZ_DIGITAL_BADGES)
        .doc(badge.id)
        .set(badge, { merge: true })
        .catch(() => undefined);
      return;
    }

    // Find all Quizwhizz events belonging to this contest (grouped by eventEndDate).
    const eventIds: string[] = await new Promise((resolve) => {
      this.firestore.collection(FirebaseCollection.EVENTS, ref => ref
        .where('type', '==', 'QUIZWHIZZ EXAM')
        .where('eventEndDate', '==', contestDate)
        .where('classId', '==', this.userDetails.classId)
        .where('boardId', '==', this.userDetails.boardId)
      ).get().subscribe((snap: any) => {
        const ids: string[] = [];
        snap.forEach((doc: any) => ids.push(String(doc?.id || '').trim()));
        resolve(ids.filter(Boolean));
      }, () => resolve([]));
    });

    if (eventIds.length === 0) return;

    // Fetch user attempt records for those events and ensure all are COMPLETED.
    const userRecords: any[] = [];
    for (let i = 0; i < eventIds.length; i += 10) {
      const chunk = eventIds.slice(i, i + 10);
      // eslint-disable-next-line no-await-in-loop
      await new Promise<void>((resolve) => {
        this.firestore.collection(FirebaseCollection.USER_QUIZWHIZZ_EVENTS, ref => ref
          .where('userId', '==', this.userDetails.id)
          .where('eventId', 'in', chunk)
        ).get().subscribe((snap: any) => {
          snap.forEach((doc: any) => userRecords.push(doc.data()));
          resolve();
        }, () => resolve());
      });
    }

    const byEventId = new Map<string, any>();
    userRecords.forEach(r => {
      const id = String(r?.eventId || '').trim();
      if (id) byEventId.set(id, r);
    });

    const allCompleted = eventIds.every(id => String(byEventId.get(id)?.status || '').toUpperCase() === 'COMPLETED');
    if (!allCompleted) return;

    const totals = eventIds.reduce(
      (acc, id) => {
        const r = byEventId.get(id);
        acc.totalScore += Number(r?.totalSecuredMark ?? 0) || 0;
        acc.totalMarks += Number(r?.totalMarks ?? 0) || 0;
        return acc;
      },
      { totalScore: 0, totalMarks: 0 }
    );

    const badge = buildQuizwhizzDigitalBadgeRecord({
      userId: this.userDetails.id,
      boardId: this.userDetails.boardId,
      classId: this.userDetails.classId,
      contestDate,
      createdAtEpoch: this.dateUtilService.getCurrentMilliSeconds(),
      totalScore: totals.totalScore,
      totalMarks: totals.totalMarks,
    });

    if (!badge) return;

    this.firestore
      .collection(FirebaseCollection.QUIZWHIZZ_DIGITAL_BADGES)
      .doc(badge.id)
      .set(badge, { merge: true })
      .catch(() => undefined);
  }


  async uploadAnswerImage(event: any) {
    this.fileChangeEvent(event);
  }

  async fileChangeEvent(event: any) {
    let items = {
      imageUrl: event,
      userId: this.userDetails.id,
      userType: this.userDetails.userType,
      event: this.userEventData,
      question: this.question,
      imageType: 'QUESTION-ANS-IMG'
    }
    this.userService.setImagesDataForUpload(items);
    const modal = await this.modalController.create({
      component: ImageUploadComponent,
      backdropDismiss: true,
      componentProps: {}
    })

    await modal.present();
    await modal.onDidDismiss().then(res => {
      if (res.data) {
        this.userAnswerImages.push(res.data);
      }
    })

  }

  async previewImage(imgurl: any) {
    const modal = await this.modalController.create({
      component: QuestionAnsImagePreviewComponent,
      backdropDismiss: true,
      componentProps: {
        imgurl: imgurl,
        userevent: this.userEventData,
        question: this.question
      }
    })

    await modal.present();
    await modal.onDidDismiss().then(res => {
      if (res.data) {
        if (null == this.question.selectedOption) {
          this.question.selectedOption = [];
        }
        this.question.selectedOptionType = 'IMAGE';
        this.question.selectedOption.push(res.data);
        this.question.mode = "APPTEMPTED";
      }
    })

  }

  deleteImage(ansimage: any) {

  }

  questionExplainDetails(question: any) {
    this.quesExplainDetails = {};
    this.firestore.collection('questions_explain')
      .doc(question.id).get().subscribe((anse: any) => {
        if (anse.exists) {
          this.isQuesExplainModalOpen = true;
          this.quesExplainDetails = anse.data();
        }
      })
  }


  modalDismiss() {
    this.isQuesExplainModalOpen = false;
    this.questionExplainModal.dismiss(null, 'cancel');
  }


  generateLastSundays(year) {
    this.lastSundays = [];
    for (let month = 0; month < 12; month++) {
      const lastDay = new Date(year, month + 1, 0);
      const dayOfWeek = lastDay.getDay();
      const diff = dayOfWeek === 0 ? 0 : dayOfWeek;
      lastDay.setDate(lastDay.getDate() - diff);

      let sundayLast: any = {
        lastSunday: moment(lastDay, "YYYY-MM-DD").format('YYYY-MM-DD'),
        month: moment(lastDay, "YYYY-MM-DD").format('MMM'),
      }
      this.lastSundays.push(sundayLast);
    }
  }


}
