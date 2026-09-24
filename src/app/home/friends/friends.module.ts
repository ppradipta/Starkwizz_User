import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from 'src/app/shared/shared.module';
import { ChatComponent } from './chat/chat.component';
import { FriendsComponent } from './friends.component';

export const routes = [
  { 
    path: '', 
    component: FriendsComponent, 
    children: []
  },
  {
    path: 'chat', 
    component: ChatComponent
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
    FriendsComponent,
    ChatComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
],
})

export class FriendsModule {}
