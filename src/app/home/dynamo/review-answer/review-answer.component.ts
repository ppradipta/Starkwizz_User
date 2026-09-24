import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { DateUtilService } from 'src/app/common/util/date-util.service';
import { FirebaseCollection } from 'src/app/model/common/firebase-collection';
import { UserDetails, userEvents } from 'src/app/model/user';
import { EventService } from 'src/app/services/event.service';
import { UserServiceService } from 'src/app/services/user-service.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-review-answer',
  templateUrl: './review-answer.component.html',
  styleUrls: ['./review-answer.component.scss'],
})
export class ReviewAnswerComponent implements OnInit {
  selectedQuestion: any = {};
  isAnsExplainModalOpen: boolean = false;
  userDetails: UserDetails = new UserDetails();
  userEventData: userEvents = new userEvents();
  questionList: any[] = [];
  selectedSubject: any = {};
  eventType: string = '';
  examType: string = '';
  eventId: string = '';
  userEventId: string = '';
  private loadedUserEventCollection: string = '';
  isFreeTrialUser: boolean | null = null;
  private freeTrialCheckPromise: Promise<boolean> | null = null;
  private subscriptionAccessCache: { hasPaid: boolean; hasFreeTrial: boolean } | null = null;
  private subscriptionAccessPromise: Promise<{ hasPaid: boolean; hasFreeTrial: boolean }> | null = null;
  constructor(
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private router: Router,
    private firestore: AngularFirestore,
    private userService: UserServiceService,
    private eventService: EventService,
    private dateUtilService: DateUtilService,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.getSelectedSubject();
    this.eventType = this.route.snapshot.params['type'];
    this.examType = this.route.snapshot.params['examType'] ?? '';
    this.eventId = this.route.snapshot.params['eventId'];
    this.userEventId = this.route.snapshot.params['userEventId'] ?? '';
    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
      if (this.userDetails?.id) {
        this.getUserEventData(this.eventId, this.userEventId);
        void this.ensureFreeTrialStatus();
        this.prefetchSubscriptionAccess();
      }
    });
  }

  getSelectedSubject() {
    this.eventService.getSelectedSubject().subscribe(res => {
      this.selectedSubject = res;
    });
  }

  ionViewDidEnter() {
    if (this.userDetails?.id) {
      // Re-read params on every enter (Ionic can keep the page instance alive).
      this.eventType = this.route.snapshot.params['type'];
      this.examType = this.route.snapshot.params['examType'] ?? '';
      this.eventId = this.route.snapshot.params['eventId'];
      this.userEventId = this.route.snapshot.params['userEventId'] ?? '';
      this.modalDismiss();

      this.getUserEventData(this.eventId, this.userEventId);
      void this.ensureFreeTrialStatus();
      this.prefetchSubscriptionAccess();
    }
  }

  getUserEventData(eventId: any, userEventId?: string) {
    this.questionList = [];
    this.userEventData = new userEvents();
    this.loadedUserEventCollection = '';

    const collections = this.buildCandidateCollections();
    const docId = String(userEventId ?? '').trim();

    if (docId) {
      this.fetchUserEventDocFromCollections(collections, docId, eventId, 0);
      return;
    }

    this.fetchUserEventDataFromCollections(collections, eventId, 0);
  }

  private buildCandidateCollections(): string[] {
    const effectiveType = String(this.examType || this.eventType || '').toUpperCase();
    const isDynamo = effectiveType.includes('DYNAMO');
    const isQuizWhizz = effectiveType.includes('QUIZWHIZZ');

    if (isQuizWhizz) return ['user_quizwhizz_events', FirebaseCollection.USER_EVENTS, 'user_dyanmo_exam'];
    if (isDynamo) return ['user_dyanmo_exam', FirebaseCollection.USER_EVENTS, 'user_quizwhizz_events'];
    return [FirebaseCollection.USER_EVENTS, 'user_quizwhizz_events', 'user_dyanmo_exam'];
  }

  private fetchUserEventDocFromCollections(collections: string[], userEventId: string, eventId: any, idx: number) {
    if (!collections?.length || idx >= collections.length) {
      // If doc lookup fails everywhere, fall back to query-by-userId+eventId.
      this.fetchUserEventDataFromCollections(collections, eventId, 0);
      return;
    }

    const collection = collections[idx];
    this.firestore.collection(collection).doc(userEventId).get().pipe(take(1)).subscribe({
      next: (record: any) => {
        if (record?.exists) {
          this.userEventData = record.data();
          this.loadedUserEventCollection = collection;
          this.syncExamTypeFromLoadedCollection();
          this.prepareQuestionList();
          return;
        }
        this.fetchUserEventDocFromCollections(collections, userEventId, eventId, idx + 1);
      },
      error: () => {
        this.fetchUserEventDocFromCollections(collections, userEventId, eventId, idx + 1);
      },
    });
  }

  private fetchUserEventDataFromCollections(collections: string[], eventId: any, idx: number) {
    if (!collections?.length || idx >= collections.length) {
      this.questionList = [];
      return;
    }

    const collection = collections[idx];
    this.firestore.collection(collection, ref => ref
      .where("userId", "==", this.userDetails.id)
      .where("eventId", "==", eventId))
      .get().pipe(take(1))
      .subscribe({
        next: (data: any) => {
          if (!data || data.empty) {
            this.fetchUserEventDataFromCollections(collections, eventId, idx + 1);
            return;
          }

          // Pick the "best" doc: most questions, then latest timestamp.
          const docs = Array.isArray(data.docs) ? data.docs : [];
          let best: any = null;
          let bestQuestions = -1;
          let bestTs = -1;

          docs.forEach((doc: any) => {
            const d = doc?.data ? doc.data() : (doc?.exists ? doc.data() : null);
            if (!d) return;
            const qLen = Array.isArray(d?.questions) ? d.questions.length : 0;
            const ts = Number(d?.completedAtEpochUs ?? d?.completedAtEpoch ?? d?.appearedDateUnix ?? 0) || 0;
            if (qLen > bestQuestions || (qLen === bestQuestions && ts > bestTs)) {
              best = d;
              bestQuestions = qLen;
              bestTs = ts;
            }
          });

          if (!best) {
            data.forEach((res: any) => {
              best = res.data();
            });
          }

          if (best) this.userEventData = best;
          this.loadedUserEventCollection = collection;
          this.syncExamTypeFromLoadedCollection();
          this.prepareQuestionList();
        },
        error: () => {
          this.fetchUserEventDataFromCollections(collections, eventId, idx + 1);
        },
      });
  }

  private syncExamTypeFromLoadedCollection() {
    // Some flows pass `type: 'EXAM'` and omit `examType`. Infer it from the collection we actually loaded.
    if (this.loadedUserEventCollection === 'user_dyanmo_exam') {
      this.examType = this.examType || 'DYNAMO EXAM';
      return;
    }
    if (this.loadedUserEventCollection === 'user_quizwhizz_events') {
      this.examType = this.examType || 'QUIZWHIZZ EXAM';
      return;
    }
  }

  private isDynamoContext(): boolean {
    const effectiveType = String(this.examType || this.eventType || '').toUpperCase();
    if (effectiveType.includes('DYNAMO')) return true;
    return this.loadedUserEventCollection === 'user_dyanmo_exam';
  }

  private isQuizWhizzOrEventContext(): boolean {
    const effectiveType = String(this.examType || this.eventType || '').toUpperCase();
    if (effectiveType.includes('QUIZWHIZZ')) return true;
    if (effectiveType === 'EVENT') return true;

    const userType = String((this.userEventData as any)?.type ?? '').toUpperCase();
    if (userType === 'EVENT') return true;

    return this.loadedUserEventCollection === 'user_quizwhizz_events';
  }

  prepareQuestionList() {
    const questions: any[] = (this.userEventData as any)?.questions;
    if (Array.isArray(questions) && questions.length) {
      this.questionList = [];
      questions.forEach(question => {
        const questionId = question?.id ?? question?.questionId ?? question?.qid ?? '';
        if (!questionId) return;

        this.firestore.collection("questions").doc(questionId).get().subscribe((record: any) => {
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

            const answers = Array.isArray(quesDetail?.answers) ? quesDetail.answers.map((a: any) => String(a)) : [];
            const selectedRaw = question?.userSelectedOption;
            const selected = Array.isArray(selectedRaw)
              ? selectedRaw.map((s: any) => String(s))
              : selectedRaw == null
                ? []
                : [String(selectedRaw)];

            if (Array.isArray(quesDetail?.options) && quesDetail.options.length > 0 && quesDetail.status != 'SKIPPED') {
              quesDetail.options.forEach((ops: any) => {
                ops.selected = 'none-option';
                const seq = String(ops.sequence);
                if (answers.includes(seq)) {
                  ops.selected = 'currect-option';
                }
                if (selected.includes(seq) && !answers.includes(seq)) {
                  ops.selected = 'wrong-option';
                }
              })
            } else {
              (quesDetail?.options ?? []).forEach((ops: any) => {
                ops.selected = 'none-option';
                const seq = String(ops.sequence);
                if (answers.includes(seq)) {
                  ops.selected = 'currect-option';
                }
              })
            }
            this.firestore.collection("questions_explain").doc(questionId).get().subscribe((explainRecord: any) => {
              if (explainRecord.exists) {
                let quesDetailExaplian = explainRecord.data();
                quesDetail['ansExplanationText'] = quesDetailExaplian.ansExplanationText;
                quesDetail['questionExplanationText'] = quesDetailExaplian.questionExplanationText;
              }
              let findIndex = this.questionList.findIndex(qt => qt.id === quesDetail.id);
              if (findIndex == -1) {
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

  getQuestion(type: any, id: any) {
    if (this.userEventData.questions.length) {
      let ques: any = this.userEventData.questions.filter(f => f.id === id)[0];
      if (type === 'status') {
        return ques.status;
      } else {
        return ques.userSelectedOption;
      }
    }
  }

  goBack() {
    this.navCtrl.back();
  }

  modalDismiss() {
    this.isAnsExplainModalOpen = false;
    this.selectedQuestion = {};
  }

  private async openAnswerExplanationModalIfAvailable(question: any) {
    const alreadyHasText =
      Boolean(String(question?.ansExplanationText ?? '').trim()) ||
      Boolean(String(question?.questionExplanationText ?? '').trim());

    this.selectedQuestion = question;

    if (alreadyHasText) {
      this.isAnsExplainModalOpen = true;
      return;
    }

    this.firestore
      .collection('questions_explain')
      .doc(question.id)
      .get()
      .pipe(take(1))
      .subscribe(async (record: any) => {
        if (record?.exists) {
          const explain = record.data();
          const ansText = String(explain?.ansExplanationText ?? '').trim();
          const qText = String(explain?.questionExplanationText ?? '').trim();

          if (ansText || qText) {
            this.selectedQuestion.ansExplanationText = ansText || null;
            this.selectedQuestion.questionExplanationText = qText || null;
            this.isAnsExplainModalOpen = true;
            return;
          }
        }

        this.modalDismiss();
        const alert = await this.alertController.create({
          message: 'Answer Explanation is not available for this question.',
          cssClass: 'customAlert popAlert',
          buttons: [{ text: 'OK' }],
        });
        await alert.present();
      });
  }

  async onClickAnswerExplanation(question: any) {
    // Fast path: block free-trial users without waiting for Firestore checks.
    const quickAccess = this.getQuickAccessFromProfileType();
    const access = quickAccess?.hasFreeTrial
      ? quickAccess
      : (this.subscriptionAccessCache ?? await this.getSubscriptionAccess());

    // Paid users can always access Answer Explanation.
    if (access.hasPaid) {
      // Only QuizWhizz + Events use the popup modal. Everything else keeps Dynamo behavior (separate page).
      if (this.isQuizWhizzOrEventContext()) {
        await this.openAnswerExplanationModalIfAvailable(question);
        return;
      }

      this.router.navigate([
        'home/dynamo/answerExplanation',
        { eventId: this.eventId, type: this.eventType, examType: this.examType, questionId: question?.id ?? '' },
      ]);
      return;
    }

    // Free-trial users are blocked.
    if (access.hasFreeTrial) {
      const alert = await this.alertController.create({
        header: 'Access Restricted',
        // message: 'This action is restricted for the user during free-trial. \u26A0\uFE0F',
        message:
          '🚫 Solution / Explanation Access Restricted' +
          '\n' +
          '✅ Detailed solutions and explanations are available with full access.' +
          '\n' +
          '😊 Want to see how this answer works?' +
          '\n' +
          'Unlock full access to understand concepts better and avoid mistakes.' +
          '\n' +
          '✔ Step-By-Step Solutions & Explanation' +
          '\n' +
          '✔ Concept Clarity' +
          '\n' +
          '✔ School-Aligned Methods' +
          '\n' +
          '👉 Unlock all subjects, chapters, tests, quizzes, and events to continue learning without limits.' +
          '\n' +
          'Ask your parent to complete the subscription.' + 
          '\n' +
          '✔ No auto-renewal' +
          '\n' +
          '✔ No Ads.' +
          '\n' +
          '✔ Safe & child-friendly',
        cssClass: 'customAlert popAlert',
        buttons: [{ text: 'OK' }],
      });
      await alert.present();
      return;
    }

    // No subscription found -> keep feature behind subscription.
    const alert = await this.alertController.create({
      message: 'Please subscribe to access Answer Explanation.',
      cssClass: 'customAlert popAlert',
      buttons: [{ text: 'OK' }],
    });
    await alert.present();
    return;
  }

  private async ensureFreeTrialStatus(): Promise<boolean> {
    if (this.isFreeTrialUser !== null) return this.isFreeTrialUser;
    if (this.freeTrialCheckPromise) return this.freeTrialCheckPromise;

    this.freeTrialCheckPromise = this.detectFreeTrialStatus()
      .then((isFreeTrialUser) => {
        this.isFreeTrialUser = isFreeTrialUser;
        return isFreeTrialUser;
      })
      .catch(() => {
        this.isFreeTrialUser = false;
        return false;
      })
      .finally(() => {
        this.freeTrialCheckPromise = null;
      });

    return this.freeTrialCheckPromise;
  }

  private async detectFreeTrialStatus(): Promise<boolean> {
    if (!this.userDetails?.id) return false;

    const profileTypes = (this.userDetails.profileType ?? []).map((t: any) => String(t ?? '').toUpperCase());
    const hasPaidViaProfile = profileTypes.includes('SUBSCRIBE');
    const hasFreeTrialViaProfile = profileTypes.includes('FREETRAIL') || profileTypes.includes('FREETRIAL');
    if (hasPaidViaProfile) return false;
    if (hasFreeTrialViaProfile) return true;

    const access = await this.getSubscriptionAccess();
    // Block only if user is currently on a free trial AND does not have an active paid subscription.
    return access.hasFreeTrial && !access.hasPaid;
  }

  private async getSubscriptionAccess(): Promise<{ hasPaid: boolean; hasFreeTrial: boolean }> {
    if (this.subscriptionAccessPromise) return this.subscriptionAccessPromise;

    this.subscriptionAccessPromise = this.detectSubscriptionAccess()
      .then((access) => {
        this.subscriptionAccessCache = access;
        return access;
      })
      .catch(() => ({ hasPaid: false, hasFreeTrial: false }))
      .finally(() => {
        this.subscriptionAccessPromise = null;
      });

    return this.subscriptionAccessPromise;
  }

  private prefetchSubscriptionAccess() {
    // Fire-and-forget: makes the click feel instant in most cases.
    void this.getSubscriptionAccess();
  }

  private getQuickAccessFromProfileType(): { hasPaid: boolean; hasFreeTrial: boolean } | null {
    const profileTypes = (this.userDetails?.profileType ?? []).map((t: any) => String(t ?? '').toUpperCase());
    const hasPaid = profileTypes.includes('SUBSCRIBE');
    const hasFreeTrial = profileTypes.includes('FREETRAIL') || profileTypes.includes('FREETRIAL');
    return hasPaid || hasFreeTrial ? { hasPaid, hasFreeTrial } : null;
  }

  private async detectSubscriptionAccess(): Promise<{ hasPaid: boolean; hasFreeTrial: boolean }> {
    const isQuizWhizz = this.eventType === 'QUIZWHIZZ EXAM';
    const isDynamo = this.eventType === 'DYNAMO EXAM';

    // Try the most likely collection first; fall back to others to avoid false-blocking paid users.
    const collectionNames = isQuizWhizz
      ? ['user_subscription_quizwhizz', 'user_subscription', 'user_all_subscription']
      : isDynamo
        ? ['user_subscription', 'user_all_subscription', 'user_subscription_quizwhizz']
        : ['user_subscription', 'user_subscription_quizwhizz', 'user_all_subscription'];

    let hasPaid = false;
    let hasFreeTrial = false;

    const boardFilters: Array<{ field: 'boardName' | 'boardId'; value: string }> = [];
    if (this.userDetails.boardName) boardFilters.push({ field: 'boardName', value: this.userDetails.boardName });
    if (this.userDetails.boardId) boardFilters.push({ field: 'boardId', value: this.userDetails.boardId });

    for (const collectionName of collectionNames) {
      // Prefer the same filters used in `TabsPage.validateAndCheckSubscriptionForDynamo/QuizWhizz` (boardName + classId).
      // If that yields nothing (data mismatch), also fall back to just userId.
      const snapshots: any[] = [];

      if (this.userDetails.classId && boardFilters.length > 0) {
        for (const boardFilter of boardFilters) {
          snapshots.push(
            await this.firestore.collection(collectionName).ref
              .where('userId', '==', this.userDetails.id)
              .where(boardFilter.field, '==', boardFilter.value)
              .where('classId', '==', this.userDetails.classId)
              .get()
          );
        }
      }

      // Always include a userId-only query as a last fallback.
      snapshots.push(
        await this.firestore.collection(collectionName).ref
          .where('userId', '==', this.userDetails.id)
          .get()
      );

      for (const snapshot of snapshots) {
        if (!snapshot || snapshot.empty) continue;

        snapshot.forEach((doc: any) => {
          const subscriptionDetails: any = doc.data();
          const isExpired = this.dateUtilService.isExpired(subscriptionDetails?.expiryDate);
          if (isExpired) return;

          const status = String(subscriptionDetails?.status ?? '').toUpperCase();
          const recordTypeUpper = String(subscriptionDetails?.type ?? '').toUpperCase();
          const subscriptionTypeUpper = String(subscriptionDetails?.subscriptionType ?? '').toUpperCase();
          const subscriptionType = String(subscriptionDetails?.subscriptionType ?? '').toLowerCase();
          const subsType = String(subscriptionDetails?.subsType ?? '').toLowerCase();
          const paymentMode = String(subscriptionDetails?.paymentmode ?? subscriptionDetails?.paymentMode ?? '').toLowerCase();
          const totalAmount = Number(subscriptionDetails?.totalAmount ?? 0);
          const subscribeAmount = Number(subscriptionDetails?.subscribeAmount ?? 0);

          const isFreeTrial =
            status === 'FREETRIAL' ||
            recordTypeUpper === 'FREETRIAL' ||
            recordTypeUpper === 'FREETRAIL' ||
            Boolean(subscriptionDetails?.isFreeTrial) ||
            subscriptionType === 'freetrial' ||
            subsType === 'freetrial' ||
            paymentMode === 'freetrial';

          const isPaid =
            status === 'SUBSCRIBE' ||
            status === 'SUBSCRIBED' ||
            status === 'SUBSCRIBTION' ||
            status === 'SUBSCRIPTION' ||
            recordTypeUpper === 'SUBSCRIBE' ||
            recordTypeUpper === 'SUBSCRIBED' ||
            subscriptionTypeUpper === 'SUBSCRIBE' ||
            subscriptionTypeUpper === 'SUBSCRIBED' ||
            subscriptionTypeUpper === 'SUBSCRIBTION' ||
            subscriptionTypeUpper === 'SUBSCRIPTION' ||
            // If it's active (not expired) and not free-trial, treat it as paid access.
            (!isFreeTrial && (totalAmount > 0 || subscribeAmount > 0 || paymentMode === 'online' || Boolean(subscriptionDetails?.paymentId)));

          if (isFreeTrial) hasFreeTrial = true;
          if (isPaid) hasPaid = true;
        });
      }

      if (hasPaid) break;
    }

    return { hasPaid, hasFreeTrial };
  }

}
