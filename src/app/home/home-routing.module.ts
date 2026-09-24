import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuizwhizzDetailsComponent } from '../quizwhizz-details/quizwhizz-details.component';
import { QuizwhizzComponent } from '../quizwhizz/quizwhizz.component';
import { AuthGuardService } from '../services/auth-guard.service';
import { ClaimComponent } from './claim/claim.component';
import { FilterComponent } from './filter/filter.component';
import { HomePage } from './home.page';
import { LocationComponent } from './location/location.component';
import { NotificationComponent } from './notification/notification.component';
import { RankComponent } from './rank/rank.component';
import { ShowcaseProfileComponent } from './showcase-profile/showcase-profile.component';
import { TxnHistoryComponent } from './txn-history/txn-history.component';
import { UserListingComponent } from './user-listing/user-listing.component';
import { ViewProfileComponent } from './view-profile/view-profile.component';
import { PaymentDetailComponent } from './payment-detail/payment-detail.component';
import { ComboOfferComponent } from './combo-offer/combo-offer.component';
import { DetailComboOfferComponent } from './combo-offer/detail-combo-offer/detail-combo-offer.component';
import { KnowMoreInfoComponent } from './combo-offer/know-more-info/know-more-info.component';
import { AchievementComponent } from './achievement/achievement.component';
import { RewardComponent } from './reward/reward.component';
import { MySyllabusComponent } from './my-syllabus/my-syllabus.component';
import { SyllabusDetailComponent } from './my-syllabus/syllabus-detail/syllabus-detail.component';
import { AddSyllabusComponent } from './my-syllabus/add-syllabus/add-syllabus.component';
import { AddSubjectDetailComponent } from './my-syllabus/add-subject-detail/add-subject-detail.component';
import { SyllabusListComponent } from './my-syllabus/syllabus-list/syllabus-list.component';
import { CancelSubscriptionComponent } from './combo-offer/cancel-subscription/cancel-subscription.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { RatingComponent } from './rating/rating.component';
import { FaqComponent } from './faq/faq.component';
import { CategoryOfferComponent } from './combo-offer/category-offer/category-offer.component';
import { SubscriptionDetailsComponent } from './subscription-details/subscription-details.component';
import { QrCodeComponent } from './qr-code/qr-code.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/tabs',
    pathMatch: 'full'
  },
  {
    path: '',
    component: HomePage,
    children: [
      {
        path: "tabs",
        loadChildren: () => import('../home-tabs/tabs.module').then(m => m.TabsPageModule)
      },
      // {
      //   path: 'hubs',
      //   canActivate: [AuthGuardService],
      //   loadChildren: () => import('./hubs/hubs.module').then(m => m.HubsPageModule)
      // },
      {
        path: 'dynamo',
        canActivate: [AuthGuardService],
        loadChildren: () => import('./dynamo/dynamo.module').then(m => m.DynamoPageModule)
      },
      {
        path: 'profile',
        canActivate: [AuthGuardService],
        loadChildren: () => import('./profile/profile.module').then(m => m.ProfilePageModule)
      },
      {
        path: 'dashboard',
        canActivate: [AuthGuardService],
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardPageModule)
      },
      {
        path: 'account',
        canActivate: [AuthGuardService],
        loadChildren: () => import('./account/account.module').then(m => m.AccountPageModule)
      },
      {
        path: 'subscription',
        canActivate: [AuthGuardService],
        loadChildren: () => import('./subscription/subscription.module').then(m => m.SubscriptionModule)
      },
      {
        path: 'bookFest',
        canActivate: [AuthGuardService],
        loadChildren: () => import('./book-fest/book-fest.module').then(m => m.BookFestModule)
      },
      { 
        path: 'friends',
        canActivate: [AuthGuardService],
        loadChildren: () => import('./friends/friends.module').then(m => m.FriendsModule)
      },
      {
        path: 'groups',
        canActivate: [AuthGuardService],
        loadChildren: () => import('./groups/groups.module').then(m => m.GroupsModule)
      },
      {
        path: 'setting',
        canActivate: [AuthGuardService],
        loadChildren: () => import('./setting/setting.module').then(m => m.SettingModule)
      },
      {
        path: 'eclass',
        loadChildren: () => import('./my-class/my-class.module').then(m => m.MyClassModule)
      },
      {
        path: 'quizwhizz',
        component: QuizwhizzComponent,
        canActivate: [AuthGuardService]
      },
      {
        path: 'quizwhizz-details',
        component: QuizwhizzDetailsComponent,
        canActivate: [AuthGuardService]
      },
      {
        path: 'user-listing',
        component: UserListingComponent,
        canActivate: [AuthGuardService]
      },
      {
        path: 'viewProfile',
        canActivate: [AuthGuardService],
        component: ViewProfileComponent,
      },
      {
        path: 'location',
        component: LocationComponent,
        canActivate: [AuthGuardService]
      },
      {
        path: 'filter',
        component: FilterComponent,
      },
      {
        path: 'showcaseProfile',
        component: ShowcaseProfileComponent,
      },
      {
        path: 'notification',
        component: NotificationComponent
      },
      {
        path: 'rank',
        component: RankComponent,
      },
      {
        path: 'txnhistory',
        component: TxnHistoryComponent,
      },
      {
        path: 'claim',
        component: ClaimComponent,
      },
      {
        path: 'setup-lesson',
        loadChildren: () => import('./setup-lesson/setup-lesson.module').then(m => m.SetupLessonPageModule)
      },
      {
        path: 'payment-detail',
        component: PaymentDetailComponent,
      },
      {
        path: 'combo-offer',
        component: ComboOfferComponent,
      },
      {
        path: 'category-offer',
        component: CategoryOfferComponent
      },
      {
        path: 'offer-detail',
        component: DetailComboOfferComponent,
      },
      {
        path: 'KnowMore-info',
        component: KnowMoreInfoComponent
      },
      {
        path: 'achievement',
        component: AchievementComponent
      },
      {
        path: 'reward',
        component: RewardComponent
      },
      {
        path: 'syllabus',
        component: MySyllabusComponent
      },
      {
        path: 'detail-syllabus',
        component: SyllabusDetailComponent
      },
      {
        path: 'add-syllabus',
        component: AddSyllabusComponent
      },
      {
        path: 'add-subject',
        component: AddSubjectDetailComponent
      },
      {
        path: 'syllabus-list',
        component: SyllabusListComponent
      },
      {
        path: 'cancel-subscription',
        component: CancelSubscriptionComponent
      },
      {
        path: 'feedback',
        component: FeedbackComponent
      },      {
        path: 'rating',
        component: RatingComponent
      },
      {
        path: 'faq',
        component: FaqComponent
      },
      {
        path: 'subscription-details',
        component: SubscriptionDetailsComponent
      },
      {
        path: 'qr-code',
        canActivate: [AuthGuardService],
        component: QrCodeComponent,
      },
       
    ]
  },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomePageRoutingModule { }
