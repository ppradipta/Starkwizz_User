import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { AlertController, IonModal, ModalController, NavController, ToastController } from '@ionic/angular';
import firebase from 'firebase/compat/app';
import { UserDetails } from 'src/app/model/user';
import { AuthService } from 'src/app/services/auth.service';
import { UserServiceService } from 'src/app/services/user-service.service';
import { LoadingService } from 'src/app/services/loading.service';
import { TermsOfServiceModalComponent } from '../modal/terms-of-service-modal/terms-of-service-modal.component';


@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
})
export class RegistrationComponent implements OnInit {
  userDetails: UserDetails = new UserDetails();
  phoneNo: any = '';
  countryCode: any = '+91';
  password: string = '';
  confirmPassword: string = '';
  email: any = '';
  isVisible = false;
  isVisible1 = false;
  checkedBtn = false;
  isChecked = false;
  @ViewChild(IonModal) resisterModal: IonModal = {} as IonModal;
  isResisterModalOpen: boolean = false;
  constructor(
    private router: Router,
    private modalController: ModalController,
    private userService: UserServiceService,
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private loading: LoadingService,
    private toastController: ToastController,
    private navCtrl: NavController,
  ) { }

  ngOnInit() {
    this.email = JSON.parse(JSON.stringify(localStorage.getItem('email')));
  }

  goBack() {
    this.navCtrl.back();
  }

  async createWithEmailPassword() {
    this.loading.present();
    if (this.password !== this.confirmPassword) {
      this.loading.dismiss();
      this.presentToast('Please Check Confirm Password!');
      return;
    }

    const email = (this.email || '').toString().trim().toLowerCase();
    const mobileNo = ((this.countryCode || '') + (this.phoneNo || '')).toString().replace(/\s+/g, '');

    if (!email || !mobileNo) {
      this.loading.dismiss();
      this.presentToast('Please enter your email and mobile number.');
      return;
    }

    try {
      const success = await this.afAuth.createUserWithEmailAndPassword(email, this.password);
      const uid = success.user?.uid;
      if (!uid) {
        this.loading.dismiss();
        this.presentToast('Unable to create user. Please try again.');
        return;
      }

      const reserveResult = await this.reserveMobileRegistry(mobileNo, email, uid);
      if (reserveResult === 'exists_other') {
        try { await success.user?.delete(); } catch (e) { console.log(e); }
        try { await this.afAuth.signOut(); } catch { }
        this.loading.dismiss();
        this.presentToast('This mobile number is already registered with another email.');
        return;
      }

      this.userDetails.id = uid;
      this.userDetails.emailId = email;
      this.userDetails.mobileNo = mobileNo;
      localStorage.setItem("email", email);
      localStorage.setItem("phoneNo", this.userDetails.mobileNo);
      this.userService.setUserDetails(this.userDetails);
      this.loading.dismiss();
      this.presentToast('User Added Successfully!');
      this.isResisterModalOpen = true;
    } catch (error: any) {
      console.log(error);
      this.loading.dismiss();
      this.presentToast(JSON.stringify(error?.code || error));
    }

  }

  private async reserveMobileRegistry(mobileNo: string, email: string, userId: string): Promise<'ok' | 'exists_other'> {
    try {
      const existingUsers = await this.firestore.firestore
        .collection('users')
        .where('mobileNo', '==', mobileNo)
        .limit(20)
        .get();

      for (const doc of existingUsers.docs) {
        const data: any = doc.data() || {};
        const existingEmail = (data.emailId || '').toString().trim().toLowerCase();
        if (existingEmail && existingEmail !== email) {
          return 'exists_other';
        }
      }
    } catch (e) {
      console.log(e);
    }

    const docRef = this.firestore.collection('mobile_registry').doc(encodeURIComponent(mobileNo)).ref;

    const hasConflict = await this.firestore.firestore.runTransaction(async (t) => {
      const snap = await t.get(docRef);
      if (!snap.exists) {
        t.set(docRef, {
          mobileNo,
          emailId: email,
          userId,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        return false;
      }

      const data: any = snap.data() || {};
      const existingEmail = (data.emailId || '').toString().trim().toLowerCase();
      if (existingEmail && existingEmail !== email) {
        return true;
      }

      if (!existingEmail && email) {
        t.update(docRef, {
          emailId: email,
          userId,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      }

      return false;
    });

    if (hasConflict) {
      return 'exists_other';
    }

    return 'ok';
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


  onClickShow(event: any) {
    if (event.detail.checked == true) {
      this.checkedBtn = true;
    } else {
      this.checkedBtn = false;
    }
  }

  async termsOfService(type: any) {
    const modal = await this.modalController.create({
      component: TermsOfServiceModalComponent,
      cssClass: 'termsModal',
      componentProps: {
        type: type
      }
    });
    await modal.present();
    await modal.onDidDismiss().then(res => {
      if (res.data) {
        this.isChecked = true;
      } else {
        this.isChecked = false;
      }
    });
  }

  modalDismiss() {
    this.isResisterModalOpen = false;
    this.resisterModal.dismiss(null, 'cancel');
  }

  goToProfile() {
    this.modalDismiss();
    this.router.navigate(['/userType']);
    // window.location.reload();
  }

  goToFeature() {
    this.router.navigate(['/login']);
  }


  signInWithEmailPassword() {
    this.router.navigate(['/login']);
  }
}
