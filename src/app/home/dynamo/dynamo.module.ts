import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CountdownModule } from 'ngx-countdown';
import { OrderByPipe } from 'src/app/common/pipe/orderby';
import { SharedModule } from 'src/app/shared/shared.module';
import { SubjectSetupDetailComponent } from 'src/app/subject-setup-detail/subject-setup-detail.component';
import { AfterPaidComponent } from './after-paid/after-paid.component';
import { BeforePaidComponent } from './before-paid/before-paid.component';
import { CancelExamAlertComponent } from './cancel-exam-alert/cancel-exam-alert.component';
import { CoScholasticComponent } from './co-scholastic/co-scholastic.component';
import { DynamoComponent } from './dynamo.component';
import { FinalScoreComponent } from './final-score/final-score.component';
import { LeaderBoardComponent } from './leader-board/leader-board.component';
import { QuestionAnsImagePreviewComponent } from './question/question-ans-image-preview/question-ans-image-preview.component';
import { QuestionComponent } from './question/question.component';
import { ReviewAnswerComponent } from './review-answer/review-answer.component';
import { AnswerExplanationComponent } from './answer-explanation/answer-explanation.component';
import { AnswerExplanationFeedbackComponent } from './answer-explanation-feedback/answer-explanation-feedback.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { SubjectAppearComponent } from './subject-appear/subject-appear.component';
import { SubjectDetailComponent } from './subject-detail/subject-detail.component';
import { SubjectModuleListComponent } from './subject-module-list/subject-module-list.component';
import { SubscriptionProfileComponent } from './subscription-profile/subscription-profile.component';
import { TestScheduleComponent } from './test-schedule/test-schedule.component';

export const routes = [
  { 
    path: '', 
    component: DynamoComponent
  },
  {
    path: 'subscription',
    component: SubscriptionProfileComponent
  },
  {
    path: 'beforePaid',
    component: BeforePaidComponent
  },
  {
    path: 'subjectDetail',
    component: SubjectDetailComponent
  },
  {
    path: 'question',
    component: QuestionComponent
  },
  {
    path: 'finalScore',
    component: FinalScoreComponent
  },
  {
    path: 'leaderBoard',
    component: LeaderBoardComponent
  },
  {
    path: 'testSchedule',
    component: TestScheduleComponent
  },
  {
    path: 'coScholastic',
    component: CoScholasticComponent
  },
  // {
  //   path: 'cancelExam',
  //   Comment: CancelExamAlertComponent
  // },
  {
    path: 'reviewAnswer',
    component: ReviewAnswerComponent
  },
  {
    path: 'answerExplanation',
    component: AnswerExplanationComponent
  },
  {
    path: 'answerExplanationFeedback',
    component: AnswerExplanationFeedbackComponent
  },
  {
    path: 'question-image-ans',
    component: QuestionAnsImagePreviewComponent
  },
  {
    path: 'subject-modules',
    component: SubjectModuleListComponent
  }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        SharedModule,
        CountdownModule,
        MatBottomSheetModule
    ],
    schemas: [
      CUSTOM_ELEMENTS_SCHEMA
    ],
    declarations: [
        DynamoComponent,
        SubscriptionProfileComponent,
        AfterPaidComponent,
        BeforePaidComponent,
        SubjectDetailComponent,
        SubjectAppearComponent,
        ScheduleComponent,
        QuestionComponent,
        FinalScoreComponent,
        LeaderBoardComponent,
        TestScheduleComponent,
        CoScholasticComponent,
        CancelExamAlertComponent,
        ReviewAnswerComponent,
        AnswerExplanationComponent,
        AnswerExplanationFeedbackComponent,
        QuestionAnsImagePreviewComponent,
        SubjectModuleListComponent,
        OrderByPipe,
        SubjectSetupDetailComponent,
         
    ],
   // providers: [{ provide: CountdownConfig, useFactory: countdownConfigFactory }]
})

export class DynamoPageModule {}
