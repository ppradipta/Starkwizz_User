import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import * as moment from 'moment-timezone';
import { DateUtilService } from 'src/app/common/util/date-util.service';
import { buildQuizwhizzDigitalBadgeRecord } from 'src/app/common/util/quizwhizz-digital-badge.util';
import { getQuizwhizzBadgeAssetPath } from 'src/app/common/util/quizwhizz-digital-badge.util';
import { UserDetails } from 'src/app/model/user';
import { EventService } from 'src/app/services/event.service';
import { UserHelperService } from 'src/app/services/helper/user-helper.service';
import { LoadingService } from 'src/app/services/loading.service';
import { UserServiceService } from 'src/app/services/user-service.service';
import { UtilServiceService } from 'src/app/services/util-service.service';
//import SwiperCore, { Autoplay, Keyboard, Pagination, Scrollbar, SwiperOptions, Zoom } from 'swiper';
import { SwiperOptions } from 'swiper/types';
import { FirebaseCollection } from '../model/common/firebase-collection';
//SwiperCore.use([Autoplay, Keyboard, Pagination, Scrollbar, Zoom]);

@Component({
  selector: 'app-quizwhizz-details',
  templateUrl: './quizwhizz-details.component.html',
  styleUrls: ['./quizwhizz-details.component.scss'],
})
export class QuizwhizzDetailsComponent implements OnInit {

  userDetails: UserDetails = new UserDetails();
  resultDetails: any = {};
  notificationCount: number = 0;
  contenskeleton: boolean = true;
  contestLevelLabel: string = '';
  eventDateText: string = '';
  private eventEndDateKey: string = '';
  slidequizwhizztOpts = {
    speed: 400,
    autoplay: {
      delay: 3000,
    },
  };
  eventSwiperConfig: SwiperOptions = {
    slidesPerView: 1, autoplay: {
      delay: 6000,
      disableOnInteraction: false
    }
  } as SwiperOptions;
  constructor(private modalController: ModalController,
    private firestore: AngularFirestore,
    private navCtrl: NavController,
    private eventService: EventService,
    private userService: UserServiceService,
    private userHelperService: UserHelperService,
    private util: UtilServiceService,
    private router: Router,
    private dateUtilService: DateUtilService,
    private loadingService: LoadingService,
    private bottomSheet: MatBottomSheet,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe((params: any) => {
      const key = String(params?.eventEndDate ?? '').trim();
      if (key) {
        this.eventEndDateKey = key;
        void this.refreshResultDetails();
      }
    });

    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
      void this.refreshResultDetails();
    });

    this.eventService.getResultDetails().subscribe(result => {
      this.resultDetails = result || {};
      if (!this.eventEndDateKey) {
        this.eventEndDateKey = String(this.resultDetails?.eventDate ?? this.resultDetails?.eventEndDate ?? '').trim();
      }
      void this.refreshResultDetails();
    });

    this.getAllNotifications();
  }

  getBadgeImage(badge: any): string {
    return getQuizwhizzBadgeAssetPath(badge?.badgeName);
  }

  private updateContestMeta() {
    this.contestLevelLabel = this.getQuizwhizzContestLevelLabel(this.eventEndDateKey);
    this.eventDateText = this.dateUtilService.formatDisplayDate(this.eventEndDateKey, 'D MMM, YYYY');
    if (!this.eventDateText) {
      this.eventDateText = this.dateUtilService.formatDisplayDate(this.resultDetails?.eventDate, 'D MMM, YYYY');
    }
  }

  private getQuizwhizzContestLevelLabel(dateInput: any): string {
    const asDate = this.dateUtilService.toDate(dateInput);
    if (!asDate) return '';

    const eventDate = moment(asDate);
    if (!eventDate.isValid()) return '';

    const endOfMonth = eventDate.clone().endOf('month');
    const dayOfWeek = endOfMonth.day(); // 0=Sun ... 6=Sat
    const lastSunday = endOfMonth.clone().subtract(dayOfWeek === 0 ? 0 : dayOfWeek, 'days').format('YYYY-MM-DD');

    return eventDate.format('YYYY-MM-DD') === lastSunday ? 'Horse Ride' : 'Turtle Drive';
  }

  private recalculateTotalsFromRecords(records: any[]) {
    const completed = (records || []).filter(r =>
      String(r?.status ?? r?.examStatus ?? '').toUpperCase() === 'COMPLETED'
    );

    const totals = completed.reduce(
      (acc, r) => {
        acc.correctAnswers += Number(r?.totalCorrect ?? 0) || 0;
        acc.inCorrectAnswers += Number(r?.totalInCorrect ?? 0) || 0;
        acc.skippedQuestions += Number(r?.totalSkipQuestions ?? 0) || 0;
        acc.totalScore += Number(r?.totalSecuredMark ?? 0) || 0;
        acc.totalQuestions += Number(r?.totalAppearQuesiton ?? 0) || 0;
        acc.totalExamTime += Number(r?.totalExamTime ?? 0) || 0;
        const recordUs = Number(r?.totalExamTimeUs);
        if (Number.isFinite(recordUs) && recordUs >= 0) {
          acc.totalExamTimeUs += recordUs;
        } else {
          const seconds = Number(r?.totalExamTime ?? 0) || 0;
          acc.totalExamTimeUs += Math.round(seconds * 1_000_000);
        }
        let marks =
          Number(r?.totalMarks ?? 0) ||
          Number(r?.eventMarks ?? 0) ||
          0;
        if (!marks) {
          const q = Number(r?.totalAppearQuesiton ?? 0) || 0;
          marks = q > 0 ? q * 2 : 0;
        }
        acc.totalMarks += marks;
        return acc;
      },
      {
        correctAnswers: 0,
        inCorrectAnswers: 0,
        skippedQuestions: 0,
        totalScore: 0,
        totalQuestions: 0,
        totalExamTime: 0,
        totalExamTimeUs: 0,
        totalMarks: 0,
      }
    );

    const badge = buildQuizwhizzDigitalBadgeRecord({
      userId: this.userDetails?.id,
      boardId: this.userDetails?.boardId,
      classId: this.userDetails?.classId,
      contestDate: this.eventEndDateKey || this.resultDetails?.eventDate,
      createdAtEpoch: this.dateUtilService.getCurrentMilliSeconds(),
      totalScore: totals.totalScore,
      totalMarks: totals.totalMarks,
    });

    const bonusPoint = Number(badge?.bonusPoint ?? this.resultDetails?.digitalBadge?.bonusPoint ?? 0) || 0;
    const terminalPoint = (Number(totals.totalScore) || 0) + bonusPoint;

    this.resultDetails = {
      ...this.resultDetails,
      correctAnswers: totals.correctAnswers,
      inCorrectAnswers: totals.inCorrectAnswers,
      skippedQuestions: totals.skippedQuestions,
      totalScore: totals.totalScore,
      bonusPoint,
      terminalPoint,
      totalQuestions: totals.totalQuestions,
      totalExamTime: totals.totalExamTime,
      totalExamTimeDisplay: this.dateUtilService.formattTimeDifferenceInSeconds(totals.totalExamTime),
      totalExamTimeUs: totals.totalExamTimeUs,
      totalExamTimeUsDisplay: this.dateUtilService.formatMicroSecondsToHhMmSsUs(totals.totalExamTimeUs),
      records: completed,
      eventDate: this.eventEndDateKey || this.resultDetails?.eventDate,
      totalMarks: totals.totalMarks,
      digitalBadge: badge || this.resultDetails?.digitalBadge,
    };
  }

  private async refreshResultDetails() {
    this.updateContestMeta();

    if (!this.userDetails?.id || !this.eventEndDateKey) {
      this.contenskeleton = false;
      if (Array.isArray(this.resultDetails?.records)) {
        this.recalculateTotalsFromRecords(this.resultDetails.records);
      }
      const badge = this.resultDetails?.digitalBadge;
      if (badge?.id && this.userDetails?.id) {
        this.firestore
          .collection(FirebaseCollection.QUIZWHIZZ_DIGITAL_BADGES)
          .doc(badge.id)
          .set(badge, { merge: true })
          .catch(() => undefined);
      }
      return;
    }

    // New flow: merged Sunday contest stores a single user record with eventId `quizwhizz_sunday_<date>_<board>_<class>`.
    // Prefer that combined record when present so "View all score" shows one contest result (GK+CA+Reasoning).
    const boardId = String(this.userDetails?.boardId || '').trim() || 'board';
    const classId = String(this.userDetails?.classId || '').trim() || 'class';
    const contestId = `quizwhizz_sunday_${this.eventEndDateKey}_${boardId}_${classId}`;
    const mergedContestRecord = await new Promise<any | null>((resolve) => {
      this.firestore.collection(FirebaseCollection.USER_QUIZWHIZZ_EVENTS, ref =>
        ref.where('userId', '==', this.userDetails.id).where('eventId', '==', contestId).limit(1)
      ).get().subscribe((snap: any) => {
        let found: any | null = null;
        snap.forEach((doc: any) => {
          found = typeof doc?.data === 'function' ? doc.data() : doc?.data;
        });
        resolve(found);
      }, () => resolve(null));
    });

    if (mergedContestRecord && String(mergedContestRecord?.status ?? mergedContestRecord?.examStatus ?? '').toUpperCase() === 'COMPLETED') {
      this.resultDetails = {
        ...this.resultDetails,
        displayName: mergedContestRecord?.userDisplayName || this.resultDetails?.displayName,
        className: mergedContestRecord?.className || this.resultDetails?.className,
        boardName: mergedContestRecord?.boardName || this.resultDetails?.boardName,
        eventDate: this.eventEndDateKey,
        records: [mergedContestRecord],
      };
      this.recalculateTotalsFromRecords([mergedContestRecord]);
      this.contenskeleton = false;
      return;
    }

    const allEvents = await new Promise<any[]>((resolve) => {
      this.userService.getQuizzWhizzEvents().subscribe((events: any[]) => resolve(events || []));
    });

    const eventIds = (allEvents || [])
      .map(e => (typeof e?.data === 'function' ? e.data() : e))
      .filter(e =>
        e &&
        String(e.type || '').toUpperCase().includes('QUIZWHIZZ') &&
        String(e.eventEndDate || '').trim() === this.eventEndDateKey &&
        String(e.classId || '') === String(this.userDetails.classId || '') &&
        String(e.boardId || '') === String(this.userDetails.boardId || '')
      )
      .map(e => String(e.id || '').trim())
      .filter(Boolean);

    if (eventIds.length === 0) {
      this.contenskeleton = false;
      if (Array.isArray(this.resultDetails?.records)) {
        this.recalculateTotalsFromRecords(this.resultDetails.records);
      }
      return;
    }

    const chunks: string[][] = [];
    for (let i = 0; i < eventIds.length; i += 10) chunks.push(eventIds.slice(i, i + 10));

    const userEventRecords: any[] = [];
    await Promise.all(
      chunks.map(chunk =>
        new Promise<void>((resolve) => {
          this.firestore.collection(FirebaseCollection.USER_QUIZWHIZZ_EVENTS, ref =>
            ref.where('userId', '==', this.userDetails.id).where('eventId', 'in', chunk)
          ).get().subscribe((snap: any) => {
            snap.forEach((doc: any) => userEventRecords.push(doc.data()));
            resolve();
          }, () => resolve());
        })
      )
    );

    this.recalculateTotalsFromRecords(userEventRecords);
    const badge = this.resultDetails?.digitalBadge;
    if (badge?.id && this.userDetails?.id) {
      this.firestore
        .collection(FirebaseCollection.QUIZWHIZZ_DIGITAL_BADGES)
        .doc(badge.id)
        .set(badge, { merge: true })
        .catch(() => undefined);
    }
    this.contenskeleton = false;
  }


  goBack() {
    this.navCtrl.back();
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

}
