import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CommentModalComponent } from '../common/component/comment-modal/comment-modal.component';
import { DescriptionModalComponent } from '../common/component/description-modal/description-modal.component';
import { FeedComponent } from '../common/component/feed/feed.component';
import { GeneralModalComponent } from '../common/component/general-modal/general-modal.component';
import { HeaderComponent } from '../common/component/header/header.component';
import { LocationModalComponent } from '../common/component/location-modal/location-modal.component';
import { LogoutModalComponent } from '../common/component/logout-modal/logout-modal.component';
import { PaymentCardComponent } from '../common/component/payment-card/payment-card.component';
import { PersonaModalComponent } from '../common/component/persona-modal/persona-modal.component';
import { RatingModalComponent } from '../common/component/rating-modal/rating-modal.component';
import { ReferralCodeModalComponent } from '../common/component/referral-code-modal/referral-code-modal.component';
import { RepliesModalComponent } from '../common/component/replies-modal/replies-modal.component';
import { SendEnquiryModalComponent } from '../common/component/send-enquiry-modal/send-enquiry-modal.component';
import { VideoOptionModalComponent } from '../common/component/video-option-modal/video-option-modal.component';
import { VideoReportModalComponent } from '../common/component/video-report-modal/video-report-modal.component';
import { BlinkCaretDirective } from './directives/blink-caret.directive';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule
    ],
    declarations: [
        PersonaModalComponent,
        LocationModalComponent,
        GeneralModalComponent,
        HeaderComponent,
        SendEnquiryModalComponent,
        PaymentCardComponent,
        FeedComponent,
        ReferralCodeModalComponent,
        DescriptionModalComponent,
        RatingModalComponent,
        VideoReportModalComponent,
        VideoOptionModalComponent,
        CommentModalComponent,
        RepliesModalComponent,
        LogoutModalComponent,
        BlinkCaretDirective
    ],
    exports: [
        HeaderComponent,
        PaymentCardComponent,
        FeedComponent,
        BlinkCaretDirective
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class SharedModule { }
