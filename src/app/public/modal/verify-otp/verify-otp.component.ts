import { Component, Input, OnInit, OnDestroy, Inject } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { IonInput, ModalController, Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { DateUtilService } from 'src/app/common/util/date-util.service';
import { InputCode, OtpDetails } from 'src/app/model/otpcode';
import { UserDetails } from 'src/app/model/user';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import { AuthService } from 'src/app/services/auth.service';
import { LoadingService } from 'src/app/services/loading.service';
import { UserServiceService } from 'src/app/services/user-service.service';
import { UtilServiceService } from 'src/app/services/util-service.service';

@Component({
  selector: 'app-verify-otp',
  templateUrl: './verify-otp.component.html',
  styleUrls: ['./verify-otp.component.scss'],
})
export class VerifyOtpComponent implements OnInit, OnDestroy {
  @Input() type = {} as any;
  @Input() email = {} as any;
  @Input() freeTrial? = {} as any;
  @Input() subscriptionType = {} as any;
  @Input() backURL = {} as any;
  @Input() phone = {} as any;
  countryCode: any = '+91';

  maxTime: any = 60;
  expireOtp: boolean = false;
  phoneNo: string = '';
  passcode: InputCode = new InputCode();
  otpcode: number = 0;
  otpDetails: OtpDetails = new OtpDetails();
  userDetails: UserDetails = new UserDetails();

  // runtime-bound SMS event handler (used for adding/removing event listeners)
  private _smsEventHandler: any = null;
  // helpful debug: store the app hash when plugin provides it
  public smsAppHash: string = '';
  constructor(
    private router: Router,
    public modalController: ModalController,
    private userService: UserServiceService,
    private util: UtilServiceService,
    private firestore: AngularFirestore,
    private storage: Storage,
    private loading: LoadingService,
    private authGuardService: AuthGuardService,
    private dateUtilService: DateUtilService,
    private auth: AuthService,
    @Inject('SMS_RETRIEVER_PLUGIN') private smsRetriever: any,
    private platform: Platform
  ) { }

  async ngOnInit() {
    await this.storage.create();
    this.userService.getUserDetails().subscribe(userDetails => {
      if (userDetails) {
        this.userDetails = userDetails;
        this.phoneNo = userDetails.mobileNo;
      }
    })


    this.startTimer();
    // Start SMS retriever on Android so OTP can be read automatically
    this.initSmsListener();

    if (this.type == 'EMAIL_VERIFY') {
      this.getEmailOptDetails();
    }
  }

  goBack() {
    this.modalController.dismiss();
  }



  codeController(event: any, next: IonInput, prev: IonInput) {
    if (event.target.value.length < 1 && prev) {
      prev.setFocus();
    } else if (next && event.target.value.length > 0) {
      next.setFocus();
    } else {
      return 0;
    }
    return 0;
  }

  submit() {
    this.loading.presentLoadingWithoutDuration();
    let passcode = this.passcode.code1 + this.passcode.code2 + this.passcode.code3 + this.passcode.code4 + this.passcode.code5 + this.passcode.code6;
    if (this.type == 'EMAIL_VERIFY') {
      if (this.otpDetails.otpNumber == passcode) {
        this.firestore.collection('user_message_mail').doc(this.otpDetails.id).update({
          status: 'CLOSED'
        });
        let profileType: any = null;
        if (this.freeTrial) {
          profileType = 'FREETRAIL';
        }
        if (!this.userDetails.profileType.includes('FREETRAIL')) {
          this.userDetails.profileType.push(profileType);
        }
        this.userDetails.isEmailVerified = true;
        this.userService.updateUserEmailAfterVerificationToCollecton(this.userDetails, profileType);

        this.modalController.dismiss();
        this.loading.dismiss();
        if (this.subscriptionType == 'EVENT') {
          if (!this.userDetails.profileType.includes('EVENT_SUBSCRIBED')) {
            this.userDetails.profileType.push('EVENT_SUBSCRIBED');
          }

          this.userService.setUserDetails(this.userDetails);
          this.util.showInfoAlert('Your required Information Sucessfully Completed ,Now proceed with your activity.');
          this.router.navigate([this.backURL], { queryParams: { isKyc: true } });
        } else {
          this.userService.setUserDetails(this.userDetails);
          this.router.navigate(['home/dynamo/beforePaid'], { queryParams: { freeTrial: this.freeTrial } });
        }

      }
      else {
        this.util.showToast(('Pease Enter a Valid OTP'), 'danger', 'bottom');
        this.loading.dismiss();
      }
    } else {
      if (passcode) {
        this.auth.enterVerificationCode(passcode).then(userData => {
          if (userData) {
            this.firestore.collection('users').doc(userData.uid).get().subscribe((respone: any) => {
              if (respone.exists) {
                let userDetails = respone.data();
                // userDetails.status = 'CREATE';
                this.updateFCMToken(userDetails);
                this.userService.setUserDetails(userDetails);
                if (userDetails.userType == 'PARENT') {
                  this.router.navigate(['/home/user-listing']);
                  this.loading.dismiss();
                  this.modalController.dismiss();
                }
                if (userDetails.userType != 'PARENT') {
                  this.router.navigate(['home/tabs']);
                  this.loading.dismiss();
                  this.modalController.dismiss();
                }
              }
              else {
                this.userDetails.creationdate = this.dateUtilService.getCurrentDateWithTime();
                this.userService.setUserDetails(this.userDetails);
                this.router.navigate(['userType']);
                this.loading.dismiss();
                this.modalController.dismiss();
              }
            }, err => {
              console.log('err', err);
              this.loading.dismiss();

            })
          } else {
            this.util.showToast('No User found,Please try again.', 'danger', 'bottom');
          }
        }, err => {
          this.util.showToast((err), 'danger', 'bottom');
          this.loading.dismiss();
        })
      }
    }



  }

  resend() {
    if (this.type == 'EMAIL_VERIFY') {
      let otpNumber = Math.floor(100000 + Math.random() * 900000).toString();
      this.firestore.collection('user_message_mail').doc(this.otpDetails.id).update({
        otpNumber: otpNumber
      }).then((data) => {
        this.util.showToast(('OTP resend.Please check your mail'), 'success', 'bottom');
        this.maxTime = 60;
        this.startTimer();
      })

    } else {
      this.auth.signInWithPhoneNumber(this.countryCode + this.phone).then(success => {
        this.maxTime = 60;
        this.startTimer();
        this.passcode.code1 = '';
        this.passcode.code2 = '';
        this.passcode.code3 = '';
        this.passcode.code4 = '';
        this.passcode.code5 = '';
        this.passcode.code6 = '';
      })
    }
  }

  startTimer() {
    setTimeout(x => {
      if (this.maxTime <= 0) { }
      this.maxTime -= 1;
      if (this.maxTime > 0) {
        this.startTimer();
        this.expireOtp = false;
      }

      else {
        this.expireOtp = true;
      }

    }, 1000);


  }

  getEmailOptDetails() {
    const query = this.firestore.collection('user_message_mail', ref => ref
      .where('email', '==', this.email)
      .where('functionType', '==', 'EMAIL_OTP')
      .where('status', '==', 'ACTIVE'));
    query.valueChanges().subscribe((optData: any) => {
      optData.forEach((otp: any) => {
        this.otpDetails = otp;
      });
    });
  }

  updateFCMToken(user: any) {
    this.authGuardService.getFCMToken().subscribe(token => {
      if (null != user && token) {
        this.firestore.collection("users").doc(user.id).update({
          token: token
        }).then(result => {
          console.log('token update');
        });
      }
    });
  }

  // SMS Retriever integration: start watching for incoming SMS and extract OTP automatically
  ngOnDestroy() {
    this.stopSmsListener();
  }

  initSmsListener() {
    // Only run on Android devices where SMS Retriever SDK is available
    if (!this.platform || !this.platform.is || !this.platform.is('android')) {
      console.log('SMS Retriever: not on Android, skipping listener');
      return;
    }

    // bind handler so we can remove it later
    this._smsEventHandler = (e: any) => {
      try {
        console.log('SMS event received raw:', e);
        // plugin event payloads vary; try common fields and fallback to stringifying
        const raw = e && (e.message || e.data || e.body || (e.detail && e.detail.message) || e.text || e.sms) ?
          (e.message || e.data || e.body || (e.detail && e.detail.message) || e.text || e.sms) : (typeof e === 'string' ? e : JSON.stringify(e));
        console.log('SMS raw content:', raw);
        const codeMatch = ('' + raw).match(/(\d{4,6})/);
        if (codeMatch) {
          console.log('SMS code extracted:', codeMatch[1]);
          this.fillOtp(codeMatch[1]);
        }
      } catch (err) {
        console.log('Error in SMS event handler', err);
      }
    };

    try {
      console.log('SMS retriever plugin tokens:', { injected: this.smsRetriever, windowPlugin: (window as any).SMSRetriever });

      // get app hash (if available) for debugging
      if (this.smsRetriever && this.smsRetriever.getAppHash) {
        this.smsRetriever.getAppHash().then((hash: string) => {
          console.log('SMS Retriever App Hash:', hash);
          this.smsAppHash = hash;
        }).catch((err: any) => console.log('getAppHash error', err));
      } else if ((window as any).SMSRetriever && (window as any).SMSRetriever.getHash) {
        try {
          (window as any).SMSRetriever.getHash((h: any) => { console.log('SMS Retriever App Hash (native):', h); this.smsAppHash = h; }, (err: any) => console.log('getHash err', err));
        } catch (e) {
          console.log('native getHash call failed', e);
        }
      }

      // Add multiple event listeners (plugin implementations differ)
      document.addEventListener('onSMSArrive', this._smsEventHandler as EventListener);
      document.addEventListener('onSMSReceive', this._smsEventHandler as EventListener);

      // Try to start watch via wrapper (Promise) and via native callback API
      if (this.smsRetriever && this.smsRetriever.startWatch) {
        this.smsRetriever.startWatch().then((res: any) => {
          console.log('sms retriever started (wrapper)', res);
        }).catch((err: any) => {
          console.log('sms retriever start error (wrapper)', err);
        });
      }

      if ((window as any).SMSRetriever && (window as any).SMSRetriever.startWatch) {
        try {
          (window as any).SMSRetriever.startWatch(() => console.log('sms retriever started (native callback)'), (err: any) => console.log('native startWatch error', err));
        } catch (e) {
          console.log('native startWatch exception', e);
        }
      }

    } catch (e) {
      console.log('SMS Retriever init failure', e);
    }
  }

  stopSmsListener() {
    try {
      // remove event listeners
      if (this._smsEventHandler) {
        document.removeEventListener('onSMSArrive', this._smsEventHandler as EventListener);
        document.removeEventListener('onSMSReceive', this._smsEventHandler as EventListener);
        this._smsEventHandler = null;
      }

      // stop watchers if plugin exposes stopWatch
      if (this.smsRetriever && (this.smsRetriever as any).stopWatch) {
        try {
          (this.smsRetriever as any).stopWatch();
        } catch (e) {
          console.log('stopWatch failed (wrapper)', e);
        }
      }

      if ((window as any).SMSRetriever && (window as any).SMSRetriever.stopWatch) {
        try {
          (window as any).SMSRetriever.stopWatch(() => console.log('native stopWatch success'), (err: any) => console.log('native stopWatch error', err));
        } catch (e) {
          console.log('native stopWatch exception', e);
        }
      }

    } catch (e) {
      console.log('Error stopping SMS listener', e);
    }
  }

  fillOtp(code: string) {
    const digits = code.split('');
    this.passcode.code1 = digits[0] || '';
    this.passcode.code2 = digits[1] || '';
    this.passcode.code3 = digits[2] || '';
    this.passcode.code4 = digits[3] || '';
    this.passcode.code5 = digits[4] || '';
    this.passcode.code6 = digits[5] || '';

    // small delay to allow UI update, then auto-submit
    setTimeout(() => {
      try {
        this.submit();
      } catch (e) { }
    }, 500);
  }



}
