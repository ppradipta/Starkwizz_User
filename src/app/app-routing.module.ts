import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { ImageUploadComponent } from './public/image-upload/image-upload.component';
import { PersolanInfoComponent } from './public/persolan-info/persolan-info.component';
import { RegistrationComponent } from './public/registration/registration.component';
import { UserTypeComponent } from './public/user-type/user-type.component';
import { WelcomeComponent } from './public/welcome/welcome.component';
import { ParentsInfoComponent } from './public/parents-info/parents-info.component';
import { SchoolLocationInfoComponent } from './public/school-location-info/school-location-info.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full'
  },
  // {
  //   path: "splash",
  //   component: SplashScreenComponent
  // },
  {
    path: "welcome",
    component: WelcomeComponent
  },
  {
    path: "registration",
    component: RegistrationComponent
  },
  {
    path: "userType",
    component: UserTypeComponent
  },
  {
    path: "persolanInfo",
    component: PersolanInfoComponent
  },
  {
    path: "perantsInfo",
    component: ParentsInfoComponent
  },
  {
    path: "school-location-Info",
    component: SchoolLocationInfoComponent
  },
  {
    path: "login",
    loadChildren: () => import('./public/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule),
    // canActivate: [AuthGuardService]
  },
  {
    path: "imageUpload",
    component: ImageUploadComponent
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
