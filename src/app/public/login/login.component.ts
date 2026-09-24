import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NavigationStart, Router, ActivatedRoute } from '@angular/router';
import { IonModal, ModalController, Platform, ToastController } from '@ionic/angular';
import firebase from 'firebase/compat/app';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { DateUtilService } from 'src/app/common/util/date-util.service';
import { UserDetails } from 'src/app/model/user';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import { AuthService } from 'src/app/services/auth.service';
import { LoadingService } from 'src/app/services/loading.service';
import { UserServiceService } from 'src/app/services/user-service.service';
import { VerifyOtpComponent } from '../modal/verify-otp/verify-otp.component';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  email: string = '';
  password: string = '';
  loginOption: string = "email";
  phoneNo: any = '';
  countryCode: any = '+91';
  userDetails: UserDetails = new UserDetails();
  @ViewChild('loginWithEmailModal') loginWithEmailModal?: IonModal;
  isLoginWithEmailModalOpen: boolean = false;
  isVisible = false;
  checkedBtn = false;
  isChecked = false;
  progress = false;
  loginForm: FormGroup;
  loginFormWithEmail: FormGroup;
  private backButtonSub?: Subscription;
  private routerEventsSub?: Subscription;
  private queryParamsSub?: Subscription;
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private auth: AuthService,
    private modalController: ModalController,
    private userService: UserServiceService,
    private afAuth: AngularFireAuth,
    private loading: LoadingService,
    private toastController: ToastController,
    private authGuardService: AuthGuardService,
    private firestore: AngularFirestore,
    private dateUtilService: DateUtilService,
    private platform: Platform,

  ) {
    this.loginForm = new FormGroup({
      phoneNo: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(10), Validators.maxLength(10)]
      }),
    });

    this.loginFormWithEmail = new FormGroup({
      email: new FormControl(null, { validators: [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")] }),
    });
  }

  ngOnInit() {
    this.email = JSON.parse(JSON.stringify(localStorage.getItem('email')));

    // When user presses hardware back while the email-login modal is open,
    // close the modal and return to mobile login view (instead of leaving a blank overlay).
    this.backButtonSub = this.platform.backButton.subscribeWithPriority(9999, () => {
      if (this.isLoginWithEmailModalOpen) {
        this.closeEmailLoginModal(true);
      }
    });

    // If the user navigates away (browser back / router navigation) while modal is open,
    // ensure the overlay is removed so it doesn't "stick" on the next page.
    this.routerEventsSub = this.router.events
      .pipe(filter((e) => e instanceof NavigationStart))
      .subscribe(() => {
        if (this.isLoginWithEmailModalOpen) {
          // Don't trigger another router navigation here (it can cancel the intended navigation,
          // e.g. "Sign up"). Just make sure the overlay is dismissed.
          this.dismissEmailLoginModalOverlay();
        }
      });

    // Keep modal state in the URL so browser back closes the modal first:
    // `/login?emailLogin=1` -> back -> `/login` (mobile login visible).
    this.queryParamsSub = this.activatedRoute.queryParamMap.subscribe((params) => {
      const shouldOpen = params.get('emailLogin') === '1';
      if (shouldOpen && !this.isLoginWithEmailModalOpen) {
        this.isLoginWithEmailModalOpen = true;
      } else if (!shouldOpen && this.isLoginWithEmailModalOpen) {
        this.dismissEmailLoginModalOverlay();
      }
    });
  }

  ngOnDestroy(): void {
    this.backButtonSub?.unsubscribe();
    this.routerEventsSub?.unsubscribe();
    this.queryParamsSub?.unsubscribe();
    this.dismissEmailLoginModalOverlay();
  }



  async onLogin() {
    this.loading.presentLoading(7000);
    this.loginForm.value.phoneNo = this.phoneNo;
    this.progress = true;
    try {
      if (!this.loginForm.value.phoneNo) {
        this.loginForm.markAllAsTouched();
        return;
      }

      this.afAuth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(() => {
        this.auth.signInWithPhoneNumber(this.countryCode + this.loginForm.value.phoneNo).then(success => {
          this.onClickVerify(null);
        })
      })
    } catch (e) {
      console.log(e);
    }
  }


  async onClickVerify(res) {
    this.progress = false;
    const modal = await this.modalController.create({
      component: VerifyOtpComponent,
      backdropDismiss: false,
      componentProps: {
        phone: this.loginForm.value.phoneNo
      },
    });
    await modal.present();
  }

  goToEmailLogin() {
    this.loading.present();
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { emailLogin: 1 },
      queryParamsHandling: 'merge',
    });
  }

  modalDismiss() {
    this.closeEmailLoginModal(true);
  }

  onEmailLoginModalDidDismiss() {
    // Keep URL + local state in sync even if modal is dismissed programmatically.
    if (this.activatedRoute.snapshot.queryParamMap.get('emailLogin') === '1') {
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: { emailLogin: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }
    this.dismissEmailLoginModalOverlay();
  }

  private closeEmailLoginModal(_popHistory: boolean) {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { emailLogin: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
    this.dismissEmailLoginModalOverlay();
  }

  private dismissEmailLoginModalOverlay() {
    this.isLoginWithEmailModalOpen = false;
    this.loginWithEmailModal?.dismiss(null, 'cancel').catch(() => { });
    this.modalController.dismiss(null, 'cancel').catch(() => { });
    this.loading.dismiss();
  }

  async onClickSignup() {
    this.loading.present();
    this.dismissEmailLoginModalOverlay();
    await this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { emailLogin: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
    await this.router.navigate(['registration']);
  }

  async presentToast(msg: any) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
      color: 'dark',
      cssClass: 'customDarkToaster'
    });
    toast.present();
  }

  forgetPassword() {
    this.loading.present();
    if (this.email) {
      this.afAuth.sendPasswordResetEmail(this.email).then(result => {
        this.presentToast('Check your email for password reset.');
      })
    } else {
      this.presentToast('Please eneter your email details for password reset.');
    }
  }

  onClickShow(event: any) {
    this.loading.present();
    if (event.detail.checked == true) {
      this.checkedBtn = true;
    } else {
      this.checkedBtn = false;
    }
  }


  signInWithEmailPassword() {
    this.loading.present();
    if (this.email && this.password) {
      this.afAuth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(() => {
        this.afAuth.signInWithEmailAndPassword(this.email, this.password).then((success) => {
          if (null != success.user && null != success.user.uid) {
            this.firestore.collection('users').doc(success.user.uid).get().subscribe((respone: any) => {
              if (respone.exists) {
                let userDetails = respone.data();
                if (userDetails.emailId || userDetails.emailId == "") {
                  this.updateEmail(userDetails, this.email);
                }
                this.updateFCMToken(userDetails);
                userDetails.emailId = this.email;
                localStorage.setItem("email", this.email);
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
                this.loading.dismiss();
                // this.modalDismiss();

              }
              else {
                this.userDetails.creationdate = this.dateUtilService.getCurrentDateWithTime();
                this.userDetails.mobileNo = this.countryCode + this.phoneNo;
                this.userDetails.emailId = this.email;
                localStorage.setItem("email", this.email);
                this.userService.setUserDetails(this.userDetails);
                this.router.navigate(['userType']);
                this.loading.dismiss();
                // this.modalDismiss();
              }
            }, err => {
              console.log('err', err);
              this.loading.dismiss();

            })
          } else {
            this.presentToast('Invalid Password or email. Please try again.');
          }

        }).catch(function (error) {
          alert(error.message);
        });
      })


    } else {
      this.presentToast('Check your email or password .');
    }
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



  updateEmail(user, email) {
    if (null != user && email) {
      this.firestore.collection("users").doc(user.id).update({
        emailId: email
      }).then(result => {
        console.log('token update');
      });
    }
  }

  onClickLogin() {
    this.loading.present();
    this.modalDismiss();
  }

}
