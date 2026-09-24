import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from 'src/app/shared/shared.module';
import { AccountListComponent } from './account-list/account-list.component';
import { AccountComponent } from './account.component';
import { AddAccountComponent } from './add-account/add-account.component';

export const routes = [
  {
    path: '',
    component: AccountComponent,
    children: []
  },
  {
    path: 'accountList',
    component: AccountListComponent
  },
  {
    path: 'addAccount',
    component: AddAccountComponent
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    SharedModule,
    MatDatepickerModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  declarations: [
    AccountComponent,
    AccountListComponent,
    AddAccountComponent
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
  ]

})

export class AccountPageModule { }