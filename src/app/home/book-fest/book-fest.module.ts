import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from 'src/app/shared/shared.module';
import { BookAdsComponent } from './book-ads/book-ads.component';
import { BookDetailComponent } from './book-detail/book-detail.component';
import { BookFestComponent } from './book-fest.component';
import { ChatListComponent } from './chat-list/chat-list.component';
import { ChatPageComponent } from './chat-page/chat-page.component';

export const routes = [
  { 
    path: '', 
    component: BookFestComponent
  },
  {
    path: 'bookAds',
    component: BookAdsComponent
  },
  {
    path: 'bookDetail',
    component: BookDetailComponent
  },
  {
    path: 'chat',
    component: ChatPageComponent
  },
   {
    path: 'buyerlist',
    component: ChatListComponent
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
  declarations: [
    BookFestComponent,
    BookAdsComponent,
    BookDetailComponent,
    ChatPageComponent,
    ChatListComponent
  ],

})

export class BookFestModule {}