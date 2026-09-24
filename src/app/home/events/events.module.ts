import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from 'src/app/shared/shared.module';
import { EventDescriptionModalComponent } from './event-description-modal/event-description-modal.component';
import { EventSubscriptionComponent } from './event-subscription/event-subscription.component';
import { EventsPage } from './events.page';

export const routes = [
  {
    path: '',
    component: EventsPage
  },
  {
    path: 'subscribedevents',
    component: EventSubscriptionComponent
  }
];


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    SharedModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  declarations: [EventsPage,EventSubscriptionComponent,EventDescriptionModalComponent]
})
export class EventsPageModule { }
