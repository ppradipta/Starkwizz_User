import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
//import { MediaCapture } from '@awesome-cordova-plugins/media-capture/ngx';
//import { File } from '@ionic-native/file/ngx';
//import { Media } from '@ionic-native/media/ngx';
//import { StreamingMedia } from '@ionic-native/streaming-media/ngx';
import { IonicModule } from '@ionic/angular';
import { ShowcaseComponent } from '../home/showcase/showcase.component';
import { AuthGuardService } from '../services/auth-guard.service';
import { SharedModule } from '../shared/shared.module';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      { path: 'showcase', component: ShowcaseComponent },

      {
        path: 'starkwizzHome',
        canActivate: [AuthGuardService],
        loadChildren: () => import('../home/starkwizz-home/starkwizzHome.module').then(m => m.StarkwizzHomePageModule)
      },
      {
        path: 'events',
        canActivate: [AuthGuardService],
        loadChildren: () => import('../home/events/events.module').then(m => m.EventsPageModule)
      },

    ]
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
  declarations: [TabsPage,
    ShowcaseComponent
  ],
  providers: [
    // MediaCapture,
    //File,
    // Media,
    // StreamingMedia,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
})
export class TabsPageModule { }
