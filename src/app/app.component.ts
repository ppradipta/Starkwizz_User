import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
//import { SplashScreen } from '@awesome-cordova-plugins/splash-screen/ngx';
import { AlertController, ModalController, Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
//import { FCM } from 'plugins/cordova-plugin-fcm-with-dependecy-updated/ionic/ngx';
import { FileOpener, FileOpenerOptions } from '@capacitor-community/file-opener';
import { Directory, DownloadFileResult, Filesystem } from '@capacitor/filesystem';

import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';
import { SplashScreen } from '@capacitor/splash-screen';
import { register } from 'swiper/element/bundle';
import { UserDetails } from './model/user';
import { AuthGuardService } from './services/auth-guard.service';
import { ConnectivityProvider } from './services/connectivity-service';
import { UserServiceService } from './services/user-service.service';
import { UtilServiceService } from './services/util-service.service';
import { AppUpdateService } from './services/app-update.service';
// import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';

import { App } from '@capacitor/app';
import { Location } from '@angular/common';


declare var navigator: any;
register();
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  public online: boolean = false;
  public backOnline: boolean = false;
  constructor(private platform: Platform, private router: Router, private storage: Storage,
    // private fcm: FCM,
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private userService: UserServiceService,
    private util: UtilServiceService,
    private alertController: AlertController,
    private modalController: ModalController,
    private connectivityProvider: ConnectivityProvider,
    private authGuardService: AuthGuardService,
    private location: Location,
    private appUpdateService: AppUpdateService,
  ) {
    // let any: SetOverlaysWebViewOptions = { overlay: false }
    // StatusBar.setOverlaysWebView(any);
    this.initializeApp();

  }

  async initializeApp() {
    // await SplashScreen.show({
    //   showDuration: 3000,
    //   autoHide: true,
    // });

    this.platform.ready().then(() => {
      this.splashScreen();
      // this.platform.backButton.subscribeWithPriority(10, () => {
      //   // if (this.router.url.includes('home/tabs/showcase' || 'home/tabs/events' || 'home/tabs/events/subscribedevents')) {
      //   if (this.router.url.includes('home/tabs/events/subscribedevents')) {
      //     this.presentAlertConfirm();
      //   }

      // });

      App.addListener('backButton', async ({ canGoBack }) => {

        const url = this.router.url || '';

        const topModal = await this.modalController.getTop();
        if (topModal) {
          await topModal.dismiss();
          return;
        }

        // Back handling inside Tabs is centralized in `TabsPage`.
        if (url.includes('home/tabs')) return;

        if (canGoBack) {
          this.location.back();   // Angular router back
        } else {
          App.exitApp();          // ✅ correct exit for Capacitor
        }
      });

      this.validateFirstTimeInstall();
      this.appUpdateService.start();
      this.getUserAuth();

    });

    this.connectivityProvider.appIsOnline$.subscribe(online => {
      if (online) {
        this.online = true;
        this.util.showToast('Network Connected', 'success', 'bottom');
      } else {
        this.online = false;
        this.util.showToast('Network  disconnected', 'danger', 'bottom');
      }
    });
  }

  ngOnInit(): void {
    //  this.splashScreen();
  }

  private splashScreen(): void {
    setTimeout(() => {
      SplashScreen.hide();
    }, 5000);
  }


  async setupFCM(user: any) {
    PushNotifications.requestPermissions().then(result => {
      if (result.receive === 'granted') {
        console.log('Sucess ', result);
        PushNotifications.register();
      } else {
        console.log(result);
      }
    });

    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration',
      (token: Token) => {
        // alert('Push registration success, token: ' + token.value);
        this.authGuardService.seFCMtToken(token.value);
        if (null != user && token) {
          this.firestore.collection("users").doc(user.id).update({
            token: token
          }).then(result => {
            console.log('token update');
            user.token = token;
            //this.userService.setUserDetails(user);
          });
        }
      }
    );

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError',
      (error: any) => {
        // alert('Error on registration: ' + JSON.stringify(error));
        console.log(error);
      }
    );

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener('pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        // alert('Push received: ' + JSON.stringify(notification));
      }
    );

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        //alert('Push action performed: ' + JSON.stringify(notification));

      }
    );

  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      // header: 'Confirm!',
      message: 'Are you sure you want to exit the app?',
      buttons: [{
        text: 'NO',
        role: 'NO',
        cssClass: 'secondary',
        handler: (blah) => {
          this.router.navigate(['home/tabs']);
        }
      }, {
        text: 'YES',
        handler: () => {
          App.exitApp();
        }
      }]
    });

    await alert.present();
  }


  async openUpdateUrl(url: string, fileName: string, type: string) {
    //await Browser.open({ url: url });
    Filesystem.downloadFile({
      path: fileName,
      url: url,
      directory: Directory.External,
      recursive: true
    }).then((res: DownloadFileResult) => {
      return this._openFileWithType(res?.path, type);
    });

  }

  private async _openFileWithType(filePath: any, fileType: string) {
    try {
      const fileOpenerOptions: FileOpenerOptions = {
        filePath: filePath,
        contentType: fileType,
        openWithDefault: true,
      };
      await FileOpener.open(fileOpenerOptions);
    } catch (e) {
      console.log('Error opening file', e);
    }
  }



  async validateFirstTimeInstall() {
    // this.storage.get('APP_INSTALLED').then(res => {
    //   alert(res)
    //   if (res && res == 1) {
    //     this.router.navigate(['login']);
    //   } else {
    //     this.router.navigate(['welcome']);
    //   }

    // });

  }




  getUserAuth() {

    this.afAuth.authState.subscribe((user: any) => {
      //SplashScreen.hide();
      if (user && user.uid) {
        this.setupFCM(user);
        const query = this.firestore.collection('users').doc(user.uid);
        query.ref.get().then((respone: any) => {
          if (respone.exists) {
            let userDetails = respone.data();
            userDetails.token = user.token;
            this.userService.setUserDetails(userDetails);
            if (userDetails.userType == 'PARENT') {
              this.router.navigate(['/home/user-listing']);
            }
            else {
              this.getAllSubscribedEvents(userDetails);
              this.userService.getAllEventParamters();
              // this.router.navigate(['/home/tabs/events']);
              this.router.navigate(['/home/tabs/starkwizzHome']);
              // this.userService.processMessageForLoginUser(userDetails.mobileNo, userDetails.displayName);
            }
          }
          else {
            let userDetails: UserDetails = new UserDetails();
            userDetails.id = user.uid;
            userDetails.mobileNo = user.phoneNumber;
            this.userService.setUserDetails(userDetails);
            this.router.navigate(['userType']);
          }
        }, err => {
          console.log('err', err);
          this.userService.setUserDetails({} as any);
          this.router.navigate(['/login']);

        })
      }
      else {
        this.userService.setUserDetails({} as any);
        // this.router.navigate(['/login']);
        this.router.navigate(['/welcome']);
      }
    });






  }

  getAllSubscribedEvents(userDetails: any) {
    this.firestore.collection('user_event_subscription', ref => ref
      .where('userId', '==', userDetails.id))
      .valueChanges().subscribe((events: any[]) => {
        let allevents: any[] = [];
        if (null != events && events.length > 0) {
          events.forEach(subscribeRecord => {
            if (null != subscribeRecord && null != subscribeRecord.events) {
              allevents.push(...subscribeRecord.events);
            }
          });
        }
        this.userService.setSubscribedUserEvents(allevents);
      });
  }
}
