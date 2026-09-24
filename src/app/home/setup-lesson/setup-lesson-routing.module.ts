import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateLessonComponent } from './create-lesson/create-lesson.component';

import { SetupLessonPage } from './setup-lesson.page';
import { SetupNotesComponent } from './setup-notes/setup-notes.component';

const routes: Routes = [
  {
    path: '',
    component: SetupLessonPage
  },
  {
    path: 'create',
    component: CreateLessonComponent
  },
  {
    path: 'setupNote',
    component: SetupNotesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SetupLessonPageRoutingModule {}
