import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
// import { VgBufferingModule } from '@videogular/ngx-videogular/buffering';
// import { VgControlsModule } from '@videogular/ngx-videogular/controls';
// import { VgCoreModule } from '@videogular/ngx-videogular/core';
// import { VgOverlayPlayModule } from '@videogular/ngx-videogular/overlay-play';
import { SharedModule } from 'src/app/shared/shared.module';
import { MyClassComponent } from './my-class.component';
import { VideoClassComponent } from './video-class/video-class.component';

export const routes = [
  { 
    path: '', 
    component: MyClassComponent
  },
  {
    path: 'videoClass', 
    component: VideoClassComponent
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    SharedModule,
    // VgCoreModule,
    // VgControlsModule,
    // VgOverlayPlayModule,
    // VgBufferingModule,
    MatBottomSheetModule
  ],
  declarations: [
    MyClassComponent,
    VideoClassComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
],
})

export class MyClassModule {}
