import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SetupLessonPageRoutingModule } from './setup-lesson-routing.module';

import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SharedModule } from 'src/app/shared/shared.module';
import { CreateLessonComponent } from './create-lesson/create-lesson.component';
import { SetupLessonPage } from './setup-lesson.page';
import { SetupNotesComponent } from './setup-notes/setup-notes.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SetupLessonPageRoutingModule,
    SharedModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatInputModule,
  ],
  declarations: [SetupLessonPage, CreateLessonComponent, SetupNotesComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
],
})
export class SetupLessonPageModule {}
