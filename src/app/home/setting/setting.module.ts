import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from 'src/app/shared/shared.module';
import { SettingComponent } from './setting.component';

export const routes = [
  { 
    path: '', 
    component: SettingComponent, 
    children: [
      
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
  declarations: [
    SettingComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
],
})

export class SettingModule {}
