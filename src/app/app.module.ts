
import { AngularFireModule } from "@angular/fire/compat";
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { AngularFirestore, AngularFirestoreModule, SETTINGS } from '@angular/fire/compat/firestore';
import { FormsModule } from '@angular/forms';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';
// SMS Retriever plugin is optional at build time; we inject it via a runtime token so build won't fail when the npm package isn't installed.
//import { SMSRetriever } from '@awesome-cordova-plugins/sms-retriever/ngx';
//import { Camera } from '@awesome-cordova-plugins/camera/ngx';
import { Diagnostic } from '@awesome-cordova-plugins/diagnostic/ngx';
import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy/ngx';
//mport { Network } from '@awesome-cordova-plugins/network/ngx';
import { PhotoViewer } from '@awesome-cordova-plugins/photo-viewer/ngx';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
//import { SplashScreen } from '@awesome-cordova-plugins/splash-screen/ngx';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { CountdownConfig, CountdownModule } from 'ngx-countdown';
import { ImageCropperComponent } from 'ngx-image-cropper';
//import { FCM } from 'plugins/cordova-plugin-fcm-with-dependecy-updated/ionic/ngx';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FileOpener } from "@awesome-cordova-plugins/file-opener/ngx";
import { environment } from 'src/environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ImageUploadComponent } from './public/image-upload/image-upload.component';
import { ForgotPasswordComponent } from './public/modal/forgot-password/forgot-password.component';
import { TermsOfServiceModalComponent } from './public/modal/terms-of-service-modal/terms-of-service-modal.component';
import { TypesOfUserComponent } from './public/modal/types-of-user/types-of-user.component';
import { VerifyOtpComponent } from './public/modal/verify-otp/verify-otp.component';
import { ParentsInfoComponent } from "./public/parents-info/parents-info.component";
import { PersolanInfoComponent } from './public/persolan-info/persolan-info.component';
import { RegistrationComponent } from './public/registration/registration.component';
import { SchoolLocationInfoComponent } from "./public/school-location-info/school-location-info.component";
import { UserTypeComponent } from './public/user-type/user-type.component';
import { WelcomeComponent } from './public/welcome/welcome.component';
import { SharedModule } from './shared/shared.module';

export function countdownConfigFactory(): CountdownConfig {
    return {};
}

@NgModule({
    declarations: [
        AppComponent,
        WelcomeComponent,
        RegistrationComponent,
        UserTypeComponent,
        PersolanInfoComponent,
        TermsOfServiceModalComponent,
        ForgotPasswordComponent,
        VerifyOtpComponent,
        TypesOfUserComponent,
        ImageUploadComponent,
        ParentsInfoComponent,
        SchoolLocationInfoComponent
    ],

    imports: [
        FormsModule,
        BrowserModule,
        IonicModule.forRoot(),
        AppRoutingModule,
        FormsModule,
        AngularFireModule.initializeApp(environment.firebase),
        //AngularFirestoreModule.enablePersistence(),
        AngularFireDatabaseModule,
        AngularFirestoreModule,
        ImageCropperComponent,
        CountdownModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatNativeDateModule,
        MatInputModule,
        BrowserAnimationsModule,
        SharedModule
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ],
    // providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy, }, { provide: CountdownGlobalConfig, useFactory: countdownConfigFactory }, { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy, }, { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }, {
        provide: SETTINGS,
        useValue: { cacheSizeBytes: 10485760 } // 10MB cache
    },
        Geolocation,
        Diagnostic,
        LocationAccuracy,
        AndroidPermissions,
        AppVersion,
        // Provide SMS Retriever runtime token (returns plugin if available on window)
        { provide: 'SMS_RETRIEVER_PLUGIN', useFactory: () => (typeof window !== 'undefined' ? (window as any).SMSRetriever : null) },
        //NativeStorage,
        Storage,
        // Network,
        CallNumber,
        SocialSharing,
        //  Camera,
        PhotoViewer,
        //SplashScreen,
        AngularFirestore,
        //  FCM
        FileOpener
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
