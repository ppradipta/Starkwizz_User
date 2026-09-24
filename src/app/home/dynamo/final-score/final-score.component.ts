import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
//import { File } from '@awesome-cordova-plugins/file/ngx';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { IonModal, NavController, Platform, ToastController } from '@ionic/angular';
import * as moment from 'moment-timezone';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { DateUtilService } from 'src/app/common/util/date-util.service';
import { buildQuizwhizzDigitalBadgeRecord } from 'src/app/common/util/quizwhizz-digital-badge.util';
import { FirebaseCollection } from 'src/app/model/common/firebase-collection';
import { EventService } from 'src/app/services/event.service';
import { LoadingService } from 'src/app/services/loading.service';
import { UserServiceService } from 'src/app/services/user-service.service';
import { UtilServiceService } from 'src/app/services/util-service.service';
import { environment } from 'src/environments/environment';

const DOWNLOAD_FOLDER_NAME = 'starkwizz-download';
declare var cordova: any;
//var file: File = new File();
declare var document: any;

@Component({
  selector: 'app-final-score',
  templateUrl: './final-score.component.html',
  styleUrls: ['./final-score.component.scss'],
})
export class FinalScoreComponent implements OnInit, OnDestroy {
  correctAnswers: number = 0;
  inCorrectAnswers: number = 0;
  totalScore: number = 0;
  bonusPoint: number = 0;
  terminalPoint: number = 0;
  totalMarks: number = 0;
  userDetails: any = {};
  userEventData: any = {};
  event: any = {} as any;
  eventDateText: string = '';
  totalQuestions: number = 0;
  maxTime: any = 60;
  expireOtp: boolean = false;
  totalExamTime: string = '';
  totalExamTimeSeconds: number | null = null;
  totalExamTimeUs: number | null = null;
  totalExamTimeUsDisplay: string = '';
  totalExamTimeSecondsDisplay: string = '-';
  skippedQuestions: number = 0;
  selectedSubject: any = {} as any;
  notificationCount = 0;
  questionList: any[] = [];
  contenskeleton: boolean = true;
  eventType: string = '';
  allQuizEvents: any = [];
  totalAttempted: any = 0;
  totalAccuracy: any = 0;
  totalPercentage: any = 0;
  examType: string = '';
  @ViewChild(IonModal) downloadModal: IonModal = {} as IonModal;
  isDownloadModalOpen: boolean = false;
  allAppreadedEvents: any = [];
  circelLine: number = Math.PI * 2 * 40;
  attempted: number = 0;
  accuracy: number = 0;
  percentile: number = 0;
  testCategoryLabel: string = '';
  private backButtonSub?: Subscription;

  get isQuizwhizzExam(): boolean {
    return String(this.eventType || '').toUpperCase().includes('QUIZWHIZZ');
  }

  constructor(
    private router: Router,
    private firestore: AngularFirestore,
    private userService: UserServiceService,
    private route: ActivatedRoute,
    private eventService: EventService,
    private socialSharing: SocialSharing,
    private loading: LoadingService,
    private plt: Platform,
    private util: UtilServiceService,
    private toastController: ToastController,
    private dateUtilService: DateUtilService,
    private fileOpener: FileOpener,
    private navCtrl: NavController,

  ) {
    this.plt.ready().then(() => {
      // let path = file.dataDirectory;
      // file.checkDir(path, DOWNLOAD_FOLDER_NAME).then(
      //   () => {
      //     console.log('Created directory sucess');
      //   },
      //   err => {
      //     file.createDir(path, DOWNLOAD_FOLDER_NAME, false);
      //   }
      // );
    });
  }

  ngOnInit() {

    // this.loading.presentLoading(5000);
    this.getSelectedSubject();
    const eventId = this.route.snapshot.params['eventId'];
    const userEventId = this.route.snapshot.params['userEventId'];
    this.eventType = this.route.snapshot.params['type'];
    this.examType = this.route.snapshot.params['examType'];

    // Important: wait for user details before querying Firestore, otherwise the scorecard can come back blank
    // (e.g., after returning from share intent / app resume).
    this.userService.getUserDetails().pipe(
      filter((u: any) => !!u?.id),
      take(1),
    ).subscribe((userData) => {
      this.userDetails = userData;
      this.getAllNotifications();
      this.getUserEventData(eventId, userEventId);
    });
    //this.getEventRecord(eventId);
    this.eventService.getTestEvent().subscribe((event: any) => {
      this.event = event;
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
      if (this.userEventData) {
        this.applyEventPermissionsToUserEvent();
        this.testCategoryLabel = this.extractTestCategoryLabel(this.userEventData);
      }
      this.updateEventDateText();
    });

    this.eventService.geAppreadedEvents().subscribe((events: any) => {
      this.allAppreadedEvents = events;
    });
  }

  getSelectedSubject() {
    this.eventService.getSelectedSubject().subscribe(res => {
      this.selectedSubject = res;
    });
  }

  getUserEventData(eventId: string, userEventId: string) {
    if (!this.userDetails?.id) {
      this.userService.getUserDetails().pipe(
        filter((u: any) => !!u?.id),
        take(1),
      ).subscribe((u) => {
        this.userDetails = u;
        this.getUserEventData(eventId, userEventId);
      });
      return;
    }

    const cleanEventId = String(eventId || '').trim();
    const cleanUserEventId = String(userEventId || '').trim();
    if (!cleanEventId || !cleanUserEventId) {
      this.contenskeleton = false;
      void this.presentToast('Score not found (missing event reference).');
      this.goBack();
      return;
    }

    // let collection = this.eventType == 'QUIZWHIZZ EXAM' ? 'user_quizwhizz_events' : 'user_events';
    let collection = this.eventType == 'QUIZWHIZZ EXAM' ? 'user_quizwhizz_events' : this.eventType == 'DYNAMO EXAM' ? 'user_dyanmo_exam' : FirebaseCollection.USER_EVENTS;

    const applyRecord = (record: any) => {
      if (!record) return;
      this.userEventData = record;
      this.applyEventPermissionsToUserEvent();
      this.testCategoryLabel = this.extractTestCategoryLabel(this.userEventData);
      this.updateEventDateText();
      this.calculateResult(this.userEventData);
      this.prepareQuestionList();
      if (this.eventType == 'QUIZWHIZZ EXAM') {
        this.getAllDetailsEvents();
      }
    };

    // Prefer document-id lookup (works even if the record doesn't store `id` as a field).
    this.firestore.collection(collection).doc(cleanUserEventId).get().pipe(take(1)).subscribe((doc: any) => {
      this.contenskeleton = false;
      if (doc?.exists) {
        const record = typeof doc?.data === 'function' ? doc.data() : doc?.data;
        if (record && String(record?.userId || '') === String(this.userDetails.id || '')) {
          // Ensure we're not showing a different event accidentally.
          if (!cleanEventId || String(record?.eventId || '') === cleanEventId) {
            applyRecord(record);
            return;
          }
        }
      }

      // Fallback: legacy query by fields
      this.firestore.collection(collection, ref => ref
        .where("userId", "==", this.userDetails.id)
        .where("id", "==", cleanUserEventId)
        .where("eventId", "==", cleanEventId))
        .get().pipe(take(1)).subscribe((snap: any) => {
          let foundRecord: any = null;
          snap.forEach((res: any) => {
            foundRecord = typeof res?.data === 'function' ? res.data() : res?.data;
          });
          if (!foundRecord) {
            void this.presentToast('Score not found for this test.');
            this.goBack();
            return;
          }
          applyRecord(foundRecord);
        });
    });
  }

  private applyEventPermissionsToUserEvent() {
    if (!this.userEventData) return;
    const ev: any = this.event;
    if (!ev) return;

    if (typeof ev.isDownloadAnsAllow === 'boolean') {
      this.userEventData.isDownloadAnsAllow = ev.isDownloadAnsAllow;
    }
    if (typeof ev.isLeaderBoardAllow === 'boolean') {
      this.userEventData.isLeaderBoardAllow = ev.isLeaderBoardAllow;
    }
    if (typeof ev.isReviewAnsAllow === 'boolean') {
      this.userEventData.isReviewAnsAllow = ev.isReviewAnsAllow;
    }
    if (typeof ev.isPublishRankAllow === 'boolean') {
      this.userEventData.isPublishRankAllow = ev.isPublishRankAllow;
    }
  }

  extractTestCategoryLabel(record: any): string {
    if (this.isQuizwhizzEventType()) {
      return this.getQuizwhizzContestLevelLabel(record);
    }

    const raw =
      record?.category ??
      record?.testCategory ??
      record?.examCategory ??
      record?.eventCategory ??
      record?.categoryName ??
      this.event?.category ??
      this.examType;

    if (!raw || typeof raw !== 'string') return '';

    // Most records store categories like "Diagnostic Test", "1st Quarter Test", etc.
    return raw.replace(/\s*test\s*$/i, '').trim();
  }

  private isQuizwhizzEventType(): boolean {
    return String(this.eventType || '').toUpperCase().includes('QUIZWHIZZ');
  }

  private getQuizwhizzContestLevelLabel(record: any): string {
    const dateInput =
      record?.eventDate ??
      record?.eventStartTime ??
      record?.appearedDate ??
      record?.completedAt ??
      this.event?.eventDate ??
      this.event?.eventStartDate;

    const asDate = this.dateUtilService.toDate(dateInput);
    if (!asDate) return '';

    const eventDate = moment(asDate);
    if (!eventDate.isValid()) return '';

    const endOfMonth = eventDate.clone().endOf('month');
    const dayOfWeek = endOfMonth.day(); // 0=Sun ... 6=Sat
    const lastSunday = endOfMonth.clone().subtract(dayOfWeek === 0 ? 0 : dayOfWeek, 'days').format('YYYY-MM-DD');

    return eventDate.format('YYYY-MM-DD') === lastSunday ? 'Horse Ride' : 'Turtle Drive';
  }

  private getQuizwhizzContestDateKey(record: any): string {
    const dateInput =
      record?.eventEndDate ??
      record?.eventDate ??
      record?.eventStartTime ??
      record?.appearedDate ??
      record?.completedAt ??
      this.event?.eventEndDate ??
      this.event?.eventDate ??
      this.event?.eventStartDate;

    const asDate = this.dateUtilService.toDate(dateInput);
    if (!asDate) return '';

    const eventDate = moment(asDate);
    if (!eventDate.isValid()) return '';

    return eventDate.format('YYYY-MM-DD');
  }

  private updateEventDateText() {
    const rawDate =
      // Prefer actual attempt/completion date over scheduled event date
      this.userEventData?.completedAtEpoch ??
      this.userEventData?.completedAt ??
      this.userEventData?.appearedDate ??
      this.userEventData?.appearedOn ??
      this.userEventData?.attemptedOn ??
      this.userEventData?.attemptedDate ??
      this.userEventData?.eventDate ??
      this.userEventData?.eventStartDate;

    // Fall back to event meta if user-event record doesn't have attempt date
    const fallbackDate = this.event?.eventDate ?? this.event?.eventStartDate;
    this.eventDateText = this.dateUtilService.formatDisplayDate(rawDate, 'Do MMM, YYYY');
    if (!this.eventDateText) {
      this.eventDateText = this.dateUtilService.formatDisplayDate(fallbackDate, 'Do MMM, YYYY');
    }
  }

  ionViewWillEnter() {
    // Ensure Android hardware back doesn't navigate back into the question/test page.
    this.backButtonSub?.unsubscribe();
    this.backButtonSub = this.plt.backButton.subscribeWithPriority(9999, () => {
      this.goBack();
    });
  }

  ionViewWillLeave() {
    this.backButtonSub?.unsubscribe();
    this.backButtonSub = undefined;
  }

  ngOnDestroy() {
    this.backButtonSub?.unsubscribe();
  }

  goBack() {
    const type = this.userEventData?.type || this.eventType;
    if (!type) {
      this.navCtrl.back();
      return;
    }

    if (type == 'EXAM' || type == 'DYNAMO EXAM') {
      this.userService.setUpdateExamEvent(this.userEventData);
      this.router.navigate(['home/dynamo/subjectDetail'], { replaceUrl: true });
    }
    else if (type == 'QUIZWHIZZ EXAM') {
      this.userService.setUpdateExamEvent(this.userEventData);
      this.router.navigate(['home/quizwhizz'], { replaceUrl: true });
    } else if (type == 'EVENT') {
      this.userService.setUpdateExamEvent(this.userEventData);
      this.router.navigate(['home/tabs/events/subscribedevents'], { replaceUrl: true });
    } else {
      this.router.navigate(['home/tabs/starkwizzHome'], { replaceUrl: true });
      // this.navCtrl.back();
    }

  }

  calculateResult(userEventData: any) {
    this.correctAnswers = userEventData.totalCorrect;
    this.inCorrectAnswers = userEventData.totalInCorrect;
    this.skippedQuestions = userEventData.totalSkipQuestions;
    this.totalScore = userEventData.totalSecuredMark;
    this.bonusPoint = 0;
    this.terminalPoint = Number(this.totalScore) || 0;
    this.totalQuestions = userEventData.totalAppearQuesiton;
    this.totalMarks = Number(userEventData?.totalMarks) || 0;

    const persistedUs = Number(userEventData?.totalExamTimeUs);
    if (Number.isFinite(persistedUs) && persistedUs >= 0) {
      this.totalExamTimeUs = persistedUs;
    } else {
      const startUs = Number(userEventData?.examStartEpochUs);
      const endUs = Number(userEventData?.examEndEpochUs);
      if (Number.isFinite(startUs) && Number.isFinite(endUs)) {
        const diffUs = this.dateUtilService.getTimeDifferenceInMicroSecondsFromEpoch(startUs, endUs);
        this.totalExamTimeUs = diffUs != null && diffUs >= 0 ? diffUs : null;
      } else {
        const totalSeconds = Number(userEventData?.totalExamTime);
        this.totalExamTimeUs = Number.isFinite(totalSeconds) && totalSeconds >= 0 ? Math.round(totalSeconds * 1_000_000) : null;
      }
    }

    if (this.totalExamTimeUs != null) {
      this.totalExamTimeUsDisplay = this.dateUtilService.formatMicroSecondsToHhMmSsUs(this.totalExamTimeUs);
      this.totalExamTimeSeconds = this.totalExamTimeUs / 1_000_000;
      // Show whole seconds only (no microsecond fraction).
      this.totalExamTimeSecondsDisplay = `${this.dateUtilService.formatMicroSecondsAsSeconds(this.totalExamTimeUs, 0)} sec`;
    } else {
      this.totalExamTimeUsDisplay = '';
      const totalSeconds = Number(userEventData?.totalExamTime);
      if (Number.isFinite(totalSeconds)) {
        this.totalExamTimeSeconds = totalSeconds;
        this.totalExamTimeSecondsDisplay = `${totalSeconds} sec`;
      } else if (userEventData?.examStartTime && userEventData?.examEndTime) {
        const diff = this.dateUtilService.getTimeDifferenceInSeconds(String(userEventData.examStartTime), String(userEventData.examEndTime));
        this.totalExamTimeSeconds = Number.isFinite(diff) ? diff : null;
        this.totalExamTimeSecondsDisplay = Number.isFinite(diff) ? `${diff} sec` : '-';
      } else {
        this.totalExamTimeSeconds = null;
        this.totalExamTimeSecondsDisplay = '-';
      }
    }

    this.totalExamTime = this.totalExamTimeUsDisplay || userEventData.totalExamTimeUsDisplay || userEventData.totalExamTimeDisplay;

    let totalMarks = userEventData.totalMarks;
    if (this.totalQuestions == 0) {
      this.totalAttempted = 0;
      this.totalAccuracy = 0;
      this.totalPercentage = 0;
    } else {
      this.totalAttempted = Number((Number(this.totalQuestions - this.skippedQuestions) * 100) / this.totalQuestions).toFixed();
      this.attempted = this.circelLine * (1 - this.totalAttempted / 100);

      this.totalAccuracy = Number((Number(this.correctAnswers) * 100) / Number(this.totalQuestions - this.skippedQuestions)).toFixed();
      this.accuracy = this.circelLine * (1 - this.totalAccuracy / 100);

      this.totalPercentage = Number((Number(this.totalScore) * 100) / totalMarks).toFixed();
      this.percentile = this.circelLine * (1 - this.totalPercentage / 100);
    }

    if (this.isQuizwhizzExam) {
      const contestDateKey = this.getQuizwhizzContestDateKey(userEventData);
      const badge = contestDateKey
        ? buildQuizwhizzDigitalBadgeRecord({
          userId: this.userDetails?.id,
          boardId: this.userDetails?.boardId,
          classId: this.userDetails?.classId,
          contestDate: contestDateKey,
          createdAtEpoch: this.dateUtilService.getCurrentMilliSeconds(),
          totalScore: this.totalScore,
          totalMarks: this.totalMarks,
        })
        : null;

      this.bonusPoint = Number(badge?.bonusPoint ?? 0) || 0;
      this.terminalPoint = (Number(this.totalScore) || 0) + this.bonusPoint;
    }
  }

  openDownloadModal() {
    this.isDownloadModalOpen = true;
  }

  modalDismiss() {
    this.isDownloadModalOpen = false;
    this.downloadModal.dismiss(null, 'cancel');
  }

  downldPdf() {
    this.loading.present();
    let htmlContent = this.processHtmlForPdf();
    try {
      let options = {
        documentSize: 'A4',
        type: 'base64',
        fileName: `${this.userEventData.eventName}.pdf`
      };
      //console.log(htmlContent);
      cordova.plugins.pdf.fromData(htmlContent, options)
        .then((base64) => {
          let path = cordova.file.externalRootDirectory + "Download/" + `${this.userEventData.eventName}.pdf`;
          Filesystem.writeFile({
            path: path,
            data: 'data:application/pdf;base64,' + base64,
            directory: Directory.External,
            recursive: true
          }).then(sucess => {
            console.log('URI', sucess.uri);
            this.fileOpener.showOpenWithDialog(sucess.uri, 'application/pdf')
              .then(() => console.log('File is opened'))
              .catch(e => console.log('Error opening file', e));
          })
        }).catch((error) => {
          console.log('error', error);

        });
    } catch (ex) {
      console.log(ex);
    }
  }

  // async downldPdf() {
  //   this.loading.presentLoading(5000);
  //   try {
  //     let htmlContent = this.processHtmlForPdf();
  //     // console.log('HTML', JSON.stringify(htmlContent));
  //     cordova.plugins.pdf.htmlToPDF({
  //       data: htmlContent,
  //       documentSize: "A4",
  //       landscape: "portrait",
  //       type: 'base64', //share for  print 
  //       fileName: `${this.userEventData.eventName}.pdf`
  //     },
  //       (sucess: any) => {
  //         var contentType = "application/pdf";
  //         var folderpath = cordova.file.externalRootDirectory + "Download/";
  //         this.savebase64AsPDF(folderpath, this.userEventData.eventName + ".pdf", sucess, contentType);
  //         this.util.showToast(('Downloaded successfully,please check your download folder.'), 'success', 'bottom');
  //       },
  //       (error: any) => {
  //         this.util.showToast(('Unable to download.'), 'danger', 'bottom');
  //         console.log(error);
  //       });

  //   } catch (ex) {

  //   }

  // }

  // savebase64AsPDF(folderpath: any, filename: any, content: any, contentType: any) {
  //   // Convert the base64 string in a Blobupl
  //   var dataBlob = this.b64toBlob(content, contentType, null);
  //   console.log("Starting to write the file :3");
  //   // file.createFile(folderpath, filename, true).then(function (file) {
  //   //   file.createWriter(function (fileWriter) {
  //   //     fileWriter.write(dataBlob);
  //   //   }, error => {
  //   //     console.log("Unable to write file ");
  //   //   })
  //   // }, error => {
  //   //   console.log("Unable to write file ");
  //   // }).catch(err => console.log('Unable to create file'))
  // }

  // b64toBlob(b64Data: any, contentType: any, sliceSize: any) {
  //   contentType = contentType || '';
  //   sliceSize = sliceSize || 512;
  //   var byteCharacters = atob(b64Data);
  //   var byteArrays = [];
  //   for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
  //     var slice = byteCharacters.slice(offset, offset + sliceSize);
  //     var byteNumbers = new Array(slice.length);
  //     for (var i = 0; i < slice.length; i++) {
  //       byteNumbers[i] = slice.charCodeAt(i);
  //     }
  //     var byteArray = new Uint8Array(byteNumbers);
  //     byteArrays.push(byteArray);
  //   }
  //   var blob = new Blob(byteArrays, { type: contentType });
  //   return blob;
  // }

  processHtmlForPdf() {

    let eventHtml: any = document.getElementById('msg').innerHTML;
    let htmlContent = '<!DOCTYPE html><html lang="en" >' +
      '<head> <meta charset="UTF-8">' +
      '  <title>abc</title>' +
      '<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">' +
      ' <style>body{padding: 0; margin: 0;font-family: system-ui;font-size:16px;font-weight:400;line-height:20px;} *, ::after, ::before { box-sizing: border-box;}' +
      '.question-card { padding: 20px; }.event-name { text-align: center;font-size: 22px;line-height: 26px;font-family: "Nunito-Bold";margin: 0;color: #000;}' +
      '.card-heading {overflow: hidden;background: #6a50a7;padding: 20px;border-radius: 16px;margin: 20px 0;}' +
      '.card-heading .event-code {text-align: center;font-size: 18px;line-height: 22px;font-family: "Nunito-Bold";margin: 10px 0 0;color: #fff;position: unset;}' +
      '.card-heading .score-info { height: 100%;width: 100%;border-radius: 10px;background: #FFFFFF 0% 0% no-repeat padding-box;border: 14px solid rgba(0, 0, 0, 0.2705882353);overflow: hidden;display: flex;align-items: center;flex-direction: column;padding: 26px 10px 10px;}' +
      '.card-heading .score-info ion-label {height: auto;font-size: 20px;line-height: 22px;font-family: "Nunito-SemiBold";margin-bottom: 14px;color: #0A395A;}' +
      '.card-heading .score-info .d-flex {display: flex;align-items: flex-end;}' +
      '.card-heading .score-info h4 {margin: 0 4px 0 0;font-family: "Nunito-Bold";line-height: 40px;font-size: 48px;letter-spacing: 2px;color: #0A395A;}' +
      '.card-heading .score-info span {font-size: 20px;line-height: 28px;font-family: "Nunito-Black";color: #0A395A;letter-spacing: 1px;}' +
      '.card-heading ion-label { font-size: 40px; line-height: 55px; color: #fff; font-weight: 700; letter-spacing: 1px; text-align: center; height: 357px; display: flex; align-items: end; justify-content: center;}' +
      '.card-heading span { font-size: 28px; line-height: 40px; color: #fff; font-weight: 400; display: block;letter-spacing: 1px; text-align: center; padding-top: 10px;}' +
      '.classContainer { background: #6a50a7; padding: 20px; border-radius: 16px; min-height: 775px; margin: 20px 0; display: inline-block; width: 100%;}' +
      '.classContainer:last-child { border: none; margin-bottom: 0;}' +
      '.classContainer .heading { text-align: end;margin-bottom: 8px;color: #fff;font-size: 16px;line-height: 18px;letter-spacing: 0.8px;font-family: "Nunito-SemiBold";display: block;}' +
      '.inner-card { background-color: #fff; text-align: center; padding: 20px; border-radius: 16px; box-shadow: 0px 6px 15px #0000004D; min-height: 160px; position: relative;}' +
      '.inner-card span { font-size: 14px; line-height: 16px; font-weight: 600; display: block; color: #51C1E9; letter-spacing: 0.6px; margin-bottom: 16px;}' +
      '.inner-card span b { font-weight: 700;font-size: 15px;}' +
      '.inner-card ion-label { font-size: 22px; line-height: 26px; font-weight: 600; display: block;color: #0A395A; letter-spacing: 1px;}' +
      '.question-img { height: auto; width: 100%; border-radius: 8px; overflow: hidden; margin-bottom: 18px;}' +
      '.question-img ion-img { width: 100%; height: 100%; object-fit: cover;}' +
      '.option-list { margin: 30px 0 10px; padding: 0; background: transparent;display: block;}' +
      'ion-item {--min-height: unset;--border-style: none;border-radius: 30px;background: #fff;--ripple-color: transparent;display: block; padding: 6px; --inner-padding-end: 0;margin-bottom: 16px;}' +
      'ion-item.active { background: #40D47B !important;}' +
      'ion-item.active ion-label span { background: #fff;}' +
      'ion-item.userSelect {background: #EF6F6F;}' +
      'ion-item.userSelect ion-label span { background: #fff;}' +
      'ion-item ion-label { height: 100%; color: #0a395a; margin: 0; font-size: 20px; font-weight: 600; display: flex;}' +
      'ion-item ion-label span { height: 40px; width: 40px; background: #71cfed80; font-size: 22px; line-height: 24px;display: flex;align-items: center;justify-content: center;border-radius: 50%; margin-right: 12px;}' +
      'ion-item ion-label p {padding-top: 7px; flex: 1;color: #0a395a; margin: 0; font-size: 20px; line-height: 26px; font-weight: 600; white-space: normal;word-break: break-word;}' +
      'ion-item ion-radio {opacity: 0;margin: 0;--size: 0;height: 0;width: 0;--background: transparent;}' +
      '.option-inner {flex: 1;margin-right: 8px;}' +
      '.option-img {flex: 1;width: 100%;height: auto;overflow: hidden;border-radius: 20px;border: 2px solid transparent;margin: 5px 0 7px;}' +
      '.option-img ion-img {object-fit: cover;width: 100%;height: 100%;}' +
      '.question-img ion-img {width: 100%;height: 100%; object-fit: cover;}' +
      '.currect-option { background: #40D47B !important;}.wrong-option { background: #EF6F6F !important;}.none-option { background: #ffffff !important;}' +
      '.currect-option span {background: #FFF !important;} .wrong-option span {background: #FFF !important;} .none-option span {background: #71cfed80 !important;}.code{ font-size: 23px; line-height: 25px; margin: 5px 0 0; color: #fff; font-weight: 500; text-align: center; display: block;}' +
      '.question-status { color: #fff; font-weight: 500; text-align: right; display: block; margin-bottom: 6px;}</style>' +
      ' </head> <body> ' +
      `${eventHtml}` +
      ' </body>' +
      '</html>'
    if (environment.appPlt == 'WEB') {
      let a = document.createElement('a');
      a.href = "data:application/octet-stream," + encodeURIComponent(htmlContent);
      a.download = `${this.userEventData.eventName}.html`;
      a.click();
    }

    return htmlContent;
  }

  getQuestion(type: any, id: any) {
    if (this.userEventData.questions.length) {
      let ques: any = this.userEventData.questions.filter((f: any) => f.id === id)[0];
      if (type === 'status') {
        return ques.status;
      } else {
        return ques.userSelectedOption;
      }
    }
  }

  prepareQuestionList() {
    if (this.userEventData.questions.length) {
      this.questionList = [];
      this.userEventData.questions.forEach((question: any) => {
        this.firestore.collection("questions").doc(question.id).get().subscribe((record: any) => {
          if (record.exists) {
            let quesDetail = record.data();
            quesDetail['status'] = question.status;
            quesDetail['startTime'] = question.startTime;
            quesDetail['endTime'] = question.endTime;
            const timeTakenUs = this.getTimeTakenMicroSeconds(question);
            quesDetail['timeTakenUs'] = timeTakenUs;
            // Show whole seconds only (no microsecond fraction).
            quesDetail['timeTakenUsDisplay'] = timeTakenUs != null ? `${this.dateUtilService.formatMicroSecondsAsSeconds(timeTakenUs, 0)} sec` : null;
            quesDetail['timeTakenSeconds'] = this.getTimeTakenSeconds(question.startTime, question.endTime);
            quesDetail['mark'] = question.mark;
            quesDetail['isnegativeallow'] = quesDetail.isnegativeallow;
            if (quesDetail.options.length > 0 && quesDetail.status != 'SKIPPED') {
              quesDetail.options.forEach((ops: any) => {
                ops.selected = 'none-option';
                if (quesDetail.answers.includes(ops.sequence)) {
                  ops.selected = 'currect-option';
                }
                if (question.userSelectedOption.includes(ops.sequence) && !quesDetail.answers.includes(ops.sequence)) {
                  ops.selected = 'wrong-option';
                }
              })
            } else {
              quesDetail.options.forEach((ops: any) => {
                ops.selected = 'none-option';
                if (quesDetail.answers.includes(ops.sequence)) {
                  ops.selected = 'currect-option';
                }
              })
            }
            // this.questionList.push(quesDetail);
            this.firestore.collection("questions_explain").doc(question.id).get().subscribe((record: any) => {
              if (record.exists) {
                let quesDetailExaplian = record.data();
                quesDetail['ansExplanationText'] = quesDetailExaplian.ansExplanationText;
                quesDetail['questionExplanationText'] = quesDetailExaplian.questionExplanationText;
                this.questionList.push(quesDetail);
              } else {
                this.questionList.push(quesDetail);
              }
            });
          }
        });
      })
    }
  }

  getTimeTakenSeconds(startTime: any, endTime: any): number | null {
    if (!startTime || !endTime) return null;

    const start = String(startTime);
    const end = String(endTime);
    const diff = this.dateUtilService.getTimeDifferenceInSeconds(start, end);

    if (!Number.isFinite(diff)) return null;
    const normalized = diff < 0 ? diff + 24 * 60 * 60 : diff; // handle crossing midnight
    return Math.round(normalized);
  }

  getTimeTakenMicroSeconds(question: any): number | null {
    if (!question) return null;
    const startUs = Number(question?.startEpochUs);
    const endUs = Number(question?.endEpochUs);
    if (Number.isFinite(startUs) && Number.isFinite(endUs)) {
      const diffUs = this.dateUtilService.getTimeDifferenceInMicroSecondsFromEpoch(startUs, endUs);
      return diffUs != null && diffUs >= 0 ? diffUs : null;
    }

    const seconds = this.getTimeTakenSeconds(question?.startTime, question?.endTime);
    return seconds != null && Number.isFinite(seconds) && seconds >= 0 ? Math.round(seconds * 1_000_000) : null;
  }



  shareScore() {
    // let shareText = `Chapter Name : ${this.userEventData.eventName}\n` +
    //   `Test Code :  ${this.userEventData.eventCode} \n` +
    //   `Name :  ${this.userEventData.userDisplayName} \n` +
    //   `Your Score : ${this.totalScore} \n` +
    //   `Total Question : ${this.totalQuestions} \n` +
    //   `Time Taken : ${this.totalExamTimeSecondsDisplay} \n` +
    //   `Correct : ${this.correctAnswers} \n` +
    //   `Incorrect : ${this.inCorrectAnswers} \n` +
    //   `Skipped : ${this.skippedQuestions} \n`;

    const type = this.userEventData?.type || this.eventType;
    const nameLabel = type === 'EVENT' ? 'Event Name' : 'Chapter Name';
    const scoreLabel = this.isQuizwhizzExam ? 'Terminal Point' : 'Your Score';
    const scoreValue = this.isQuizwhizzExam ? this.terminalPoint : this.totalScore;

    let shareText = `Name :  ${this.userEventData.userDisplayName} \n` +
    `${nameLabel} : ${this.userEventData.eventName}\n` +
    `Test Code :  ${this.userEventData.eventCode} \n` +
    `Total Question : ${this.totalQuestions} \n` +
    `Correct : ${this.correctAnswers} \n` +
    `Wrong : ${this.inCorrectAnswers} \n` +
    `Skipped : ${this.skippedQuestions} \n` +
    (this.isQuizwhizzExam ? `Secured Point : ${this.totalScore} \nBonus Point : ${this.bonusPoint} \n` : '') +
    `${scoreLabel} : ${scoreValue} \n` +
    `Time Taken : ${this.totalExamTimeSecondsDisplay} \n`;


    this.socialSharing.share(shareText, "StarKwizz Event", '', "https://play.google.com/store/apps/details?id=com.lavni.starkwizz").then(res => {
      console.log(res);
      this.util.showToast(('Share Sucessfully!!!'), 'success', 'bottom');
    }, err => {
      console.log(err);
      alert(err);
      this.util.showToast(('Unable to share!!!'), 'success', 'bottom');
    });
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


  reviewAnswer() {
    this.eventService.setSelectedSubject(this.selectedSubject);
    this.router.navigate(['home/dynamo/reviewAnswer', { eventId: this.userEventData.eventId, type: this.eventType }]);
  }

  viewLeaderBoard(rankType: 'SCHOOL' | 'CITY' | 'DISTRICT' | 'STATE' | 'COUNTRY' = 'SCHOOL') {
    if (!this.isQuizwhizzExam) return;
    const eventId = String(this.userEventData?.eventId || this.route.snapshot.params['eventId'] || '').trim();
    if (!eventId) return;

    this.router.navigate(['home/dynamo/leaderBoard'], {
      queryParams: {
        rankType,
        eventId,
        eventType: this.eventType,
      },
    });
  }

  getAllDetailsEvents() {
    this.firestore.collection(FirebaseCollection.USER_QUIZWHIZZ_EVENTS, ref => ref
      .where('userId', '==', this.userDetails.id)
      .where('classId', '==', this.userDetails.classId)
      .where('boardId', '==', this.userDetails.boardId)
      .where('status', '==', 'COMPLETED')
      .orderBy("appearedDateUnix", "desc").limit(3)
    ).get().subscribe(data => {
      data.forEach((res: any) => {
        this.allQuizEvents = [];
        if (res.exists) {
          this.allQuizEvents.push(res.data());
        }
      });
      let index = this.allQuizEvents.findIndex(ser => ser.eventId == this.userEventData.eventId);
      if (index != -1) {
        this.allQuizEvents.splice(index, 1);
      }
    });
  }


  viewTotalScore() {
    let allAppreadedEvents = this.allAppreadedEvents.filter(completeEvnt => completeEvnt.eventEndDate == this.event.eventEndDate);

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
            totalResult.eventDate = this.event.eventEndDate;
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
          contestDate: this.event?.eventEndDate,
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

        this.router.navigate(['home/quizwhizz-details'], { queryParams: { eventEndDate: this.event?.eventEndDate } });
      }
      else {
        this.presentToast('Please appear any one exam to view total score');
      }
    }
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

}
