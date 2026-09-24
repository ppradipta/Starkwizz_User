import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from 'src/app/shared/shared.module';
import { ChangeRequestComponent } from './change-request/change-request.component';
import { ProfileComponent } from './profile.component';
import { SchoolInfoComponent } from './school-info/school-info.component';

export const routes = [
  {
    path: '',
    component: ProfileComponent,
    children: []
  },
  { path: 'change-request', component: ChangeRequestComponent },
  { path: 'school-info', component: SchoolInfoComponent },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    SharedModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatInputModule
  ],
  declarations: [
    ProfileComponent,
    ChangeRequestComponent,
    SchoolInfoComponent
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
],


})

export class ProfilePageModule { }

