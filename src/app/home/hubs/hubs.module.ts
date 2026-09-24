import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from 'src/app/shared/shared.module';
import { HubsDetailComponent } from './hubs-detail/hubs-detail.component';
import { HubsComponent } from './hubs.component';
import { NoticeComponent } from './notice/notice.component';
import { OffersComponent } from './offers/offers.component';

export const routes = [
  { 
    path: '', 
    component: HubsComponent
  },
  {
    path: 'offers', 
    component: OffersComponent
  },
  {
    path: 'notice', 
    component: NoticeComponent
  },
  {
    path: 'hubsDetail', 
    component: HubsDetailComponent
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    SharedModule
  ],
  declarations: [
    HubsComponent,
    OffersComponent,
    NoticeComponent,
    HubsDetailComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
],
})

export class HubsPageModule {}
