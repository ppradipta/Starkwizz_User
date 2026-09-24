import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';
//import { Chooser } from '@awesome-cordova-plugins/chooser/ngx';
//import { VideoPlayer } from '@awesome-cordova-plugins/video-player/ngx';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TabsPageModule } from '../home-tabs/tabs.module';
import { QuizwhizzDetailsComponent } from '../quizwhizz-details/quizwhizz-details.component';
import { QuizwhizzComponent } from '../quizwhizz/quizwhizz.component';
import { SharedModule } from '../shared/shared.module';
import { AccountPageModule } from './account/account.module';
import { BookFestModule } from './book-fest/book-fest.module';
import { ClaimComponent } from './claim/claim.component';
import { DynamoPageModule } from './dynamo/dynamo.module';
import { FilterComponent } from './filter/filter.component';
import { FriendsModule } from './friends/friends.module';
import { GroupsModule } from './groups/groups.module';
import { HomePageRoutingModule } from './home-routing.module';
import { HomePage } from './home.page';
import { HubsPageModule } from './hubs/hubs.module';
import { LocationComponent } from './location/location.component';
import { MyClassModule } from './my-class/my-class.module';
import { NotificationComponent } from './notification/notification.component';
import { PostedVideoModalComponent } from './playpostedvideo/posted-video-modal.component';
import { ProfilePageModule } from './profile/profile.module';
import { RankComponent } from './rank/rank.component';
import { SettingModule } from './setting/setting.module';
//import { ShortVideosModule } from './short-videos/short-videos.module';
import { ShowcaseProfileComponent } from './showcase-profile/showcase-profile.component';
import { SubscriptionModule } from './subscription/subscription.module';
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
import { IndividualPlanComponent } from './combo-offer/category-offer/individual-plan/individual-plan.component';
import { FamilyPlanComponent } from './combo-offer/category-offer/family-plan/family-plan.component';
import { SchoolPlanComponent } from './combo-offer/category-offer/school-plan/school-plan.component';
import { PrivateInstitutionPlanComponent } from './combo-offer/category-offer/private-institution-plan/private-institution-plan.component';
import { MonthlyPlanComponent } from './combo-offer/category-offer/individual-plan/monthly-plan/monthly-plan.component';
import { QuarterlyPlanComponent } from './combo-offer/category-offer/individual-plan/quarterly-plan/quarterly-plan.component';
import { YearlyPlanComponent } from './combo-offer/category-offer/individual-plan/yearly-plan/yearly-plan.component';
import { SubscriptionDetailsComponent } from './subscription-details/subscription-details.component';
import { QrCodeComponent } from './qr-code/qr-code.component';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    HubsPageModule,
    DynamoPageModule,
    ProfilePageModule,
    AccountPageModule,
    SubscriptionModule,
    BookFestModule,
    //ShortVideosModule,
    FriendsModule,
    GroupsModule,
    SettingModule,
    MyClassModule,
    SharedModule,
    TabsPageModule

  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  declarations: [
    HomePage,
    UserListingComponent,
    ViewProfileComponent,
    LocationComponent,
    ShowcaseProfileComponent,
    FilterComponent,
    RankComponent,
    NotificationComponent,
    PostedVideoModalComponent,
    TxnHistoryComponent, 
    QuizwhizzComponent,
    QuizwhizzDetailsComponent,
    ClaimComponent,
    PaymentDetailComponent,
    ComboOfferComponent,
    DetailComboOfferComponent,
    KnowMoreInfoComponent,
    AchievementComponent,
    RewardComponent,
    MySyllabusComponent,
    SyllabusDetailComponent,
    AddSyllabusComponent,
    AddSubjectDetailComponent,
    SyllabusListComponent,
    CancelSubscriptionComponent,
    FeedbackComponent,
    RatingComponent,
    FaqComponent,
    CategoryOfferComponent,
    IndividualPlanComponent,
    FamilyPlanComponent,
    SchoolPlanComponent,
    PrivateInstitutionPlanComponent,
    MonthlyPlanComponent,
    QuarterlyPlanComponent,
    YearlyPlanComponent,
    SubscriptionDetailsComponent,
    QrCodeComponent

  ],
  providers: [
    // Chooser,
    AppVersion,
    //  VideoPlayer,
    CallNumber
  ],
})
export class HomePageModule { }
