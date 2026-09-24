import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { IonRouterOutlet, NavController } from '@ionic/angular';
import { DateUtilService } from 'src/app/common/util/date-util.service';
import { UserDetails } from 'src/app/model/user';
import { UserServiceService } from 'src/app/services/user-service.service';
import { UtilServiceService } from 'src/app/services/util-service.service';

@Component({
  selector: 'app-answer-explanation-feedback',
  templateUrl: './answer-explanation-feedback.component.html',
  styleUrls: ['./answer-explanation-feedback.component.scss'],
})
export class AnswerExplanationFeedbackComponent implements OnInit {
  userDetails: UserDetails = new UserDetails();

  message = '';
  reason: string | null = null;
  otherSuggestion = '';
  isThankYouOpen = false;
  isSubmitting = false;
  readonly maxChars = 500;

  eventType = '';
  eventId = '';
  questionId = '';

  readonly reasonInterfaceOptions = { cssClass: 'feedback-reason-popover' };

  readonly reasons = [
    'Explanation helps my child understand.',
    'To understand the correct method step by step.',
    'Quick revision after the test would be helpful.',
    'Useful for self-study and independent learning.',
    'My child studies without tuition support.',
    'To learn different problem-solving approaches.',
    'Improves learning without teacher guidance.',
    'Other(please specify)',
  ];

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private route: ActivatedRoute,
    @Optional() private routerOutlet: IonRouterOutlet | null,
    private cdr: ChangeDetectorRef,
    private userService: UserServiceService,
    private dateUtilService: DateUtilService,
    private util: UtilServiceService,
    private firestore: AngularFirestore
  ) {}

  ngOnInit(): void {
    this.eventType = this.route.snapshot.params['type'] ?? '';
    this.eventId = this.route.snapshot.params['eventId'] ?? '';
    this.questionId = this.route.snapshot.params['questionId'] ?? '';

    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
    });
  }

  get charsUsed(): number {
    return (this.message ?? '').length;
  }

  get isOtherReason(): boolean {
    return this.reason === 'Other(please specify)';
  }

  onReasonChange() {
    if (!this.isOtherReason) this.otherSuggestion = '';
  }

  goBack() {
    if (this.routerOutlet?.canGoBack()) {
      this.navCtrl.back();
      return;
    }

    this.router.navigate([
      'home/dynamo/answerExplanation',
      { eventId: this.eventId, type: this.eventType, questionId: this.questionId },
    ]);
  }

  cancel() {
    this.goBack();
  }

  async submit() {
    const trimmed = (this.message ?? '').trim();
    if (!trimmed) {
      this.util.showToast('Please write your feedback.', 'danger', 'bottom');
      return;
    }

    if (this.isSubmitting) return;
    this.isSubmitting = true;

    const otherSuggestionTrimmed = this.isOtherReason ? (this.otherSuggestion ?? '').trim() : '';

    const feedback: any = {
      id: this.util.generateAlphaNumericId(),
      createDate: this.dateUtilService.getCurrentDateWithTime(),
      createDateUnix: this.dateUtilService.getCurrentEpochTime(),
      type: 'ANSWER_EXPLANATION_FEEDBACK',
      status: 'ACTIVE',
      feature: 'ANSWER_EXPLANATION',
      message: trimmed,
      reason: this.reason ?? null,
      otherSuggestion: otherSuggestionTrimmed || null,
      eventId: this.eventId ?? null,
      eventType: this.eventType ?? null,
      questionId: this.questionId ?? null,

      // User details
      name: this.userDetails.displayName,
      mobileNo: this.userDetails.mobileNo,
      userEmail: this.userDetails.emailId,
      dateOfBirth: this.userDetails.dateOfBirth,
      gender: this.userDetails.gender,
      userId: this.userDetails.id,
      month: this.dateUtilService.getCurrentMonth(),
      year: this.dateUtilService.getCurrentYear(),
      boardId: this.userDetails.boardId,
      boardName: this.userDetails.boardName,
      classId: this.userDetails.classId,
      className: this.userDetails.className,
      stateId: this.userDetails.stateId,
      stateName: this.userDetails.stateName,
      districtId: this.userDetails.districtId,
      districtName: this.userDetails.districtName,
      cityId: this.userDetails.cityId,
      cityName: this.userDetails.cityName,
      schoolId: this.userDetails.schoolId,
      schoolName: this.userDetails.schoolName,
    };

    // Show the Thank You popup instantly; save feedback in background.
    this.isThankYouOpen = true;
    this.cdr.detectChanges();

    void this.firestore
      .collection('user_feedback')
      .doc(feedback.id)
      .set(JSON.parse(JSON.stringify(feedback)), { merge: true })
      .catch(() => {
        this.util.showToast('Unable to submit feedback. Please try again.', 'danger', 'bottom');
      })
      .finally(() => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
      });
  }

  closeThankYou() {
    this.isThankYouOpen = false;
    this.goBack();
  }
}
