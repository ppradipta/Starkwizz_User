import { Component, OnInit, Optional } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonRouterOutlet, NavController } from '@ionic/angular';

@Component({
  selector: 'app-answer-explanation',
  templateUrl: './answer-explanation.component.html',
  styleUrls: ['./answer-explanation.component.scss'],
})
export class AnswerExplanationComponent implements OnInit {
  wantsToShareFeedback = false;
  eventType: string = '';
  eventId: string = '';
  questionId: string = '';

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private route: ActivatedRoute,
    @Optional() private routerOutlet: IonRouterOutlet | null
  ) {}

  ngOnInit(): void {
    this.eventType = this.route.snapshot.params['type'] ?? '';
    this.eventId = this.route.snapshot.params['eventId'] ?? '';
    this.questionId = this.route.snapshot.params['questionId'] ?? '';
  }

  goBack() {
    // Prefer true back-navigation to avoid creating a new history entry
    // (prevents: finalScore -> reviewAnswer -> answerExplanation -> reviewAnswer loop).
    if (this.routerOutlet?.canGoBack()) {
      this.navCtrl.back();
      return;
    }

    // Fallback (deep-link / fresh load): return to review answers.
    this.router.navigate(['home/dynamo/reviewAnswer', { eventId: this.eventId, type: this.eventType }]);
  }

  shareFeedback() {
    if (!this.wantsToShareFeedback) return;
    this.router.navigate([
      'home/dynamo/answerExplanationFeedback',
      { eventId: this.eventId, type: this.eventType, questionId: this.questionId },
    ]);
  }
}
