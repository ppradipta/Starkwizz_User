import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { environment } from 'src/environments/environment.prod';
import { TermsOfServiceModalComponent } from '../modal/terms-of-service-modal/terms-of-service-modal.component';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent implements OnInit {
  checkedBtn = false;
  isChecked = false;
  welcomeInfo: any = {};
  constructor(
    private router: Router,
    private modalController: ModalController,
    private firestore: AngularFirestore,
  ) {
    this.firestore.collection('user_welcome_info', ref => ref).valueChanges().subscribe((data: any) => {
      this.welcomeInfo = data[0];
    });

  }

  ngOnInit() {
    this.firestore.collection('user_welcome_info', ref => ref).valueChanges().subscribe((data: any) => {
      this.welcomeInfo = data[0];
    });

    localStorage.setItem("app_version_Key", JSON.stringify(environment.versionNumber));
  }

  slideOpts = {
    speed: 400,
    autoplay: {
      delay: 5000,
    },
  };

  onClickShow(event: any) {
    if (event.detail.checked == true) {
      this.checkedBtn = true;
    } else {
      this.checkedBtn = false;
    }
  }

  onClickStart() {
    this.router.navigate(['login']);
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
}
