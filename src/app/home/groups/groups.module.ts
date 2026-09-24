import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from 'src/app/shared/shared.module';
import { AddGroupMemberComponent } from './add-group-member/add-group-member.component';
import { CreateGroupComponent } from './create-group/create-group.component';
import { GroupDetailComponent } from './group-detail/group-detail.component';
import { GroupMemberComponent } from './group-member/group-member.component';
import { GroupsChatComponent } from './groups-chat/groups-chat.component';
import { GroupsComponent } from './groups.component';

export const routes = [
  { 
    path: '', 
    component: GroupsComponent, 
    children: [
      
    ]
  },
  {
    path: 'group-detail', 
    component: GroupDetailComponent
  },
  {
    path: 'group-member', 
    component: GroupMemberComponent
  },
  {
    path: 'create-group', 
    component: CreateGroupComponent
  },
  {
    path: 'add-member', 
    component: AddGroupMemberComponent
  },
  {
    path: 'group-chat', 
    component: GroupsChatComponent
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
    GroupsComponent,
    GroupDetailComponent,
    GroupMemberComponent,
    CreateGroupComponent,
    AddGroupMemberComponent,
    GroupsChatComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
],
})

export class GroupsModule {}
