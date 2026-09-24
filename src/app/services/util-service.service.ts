import { Injectable } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UtilServiceService {

  constructor(public toastController: ToastController, private alertCtrl: AlertController) { }

  async showToast(msg: any, colors: any, positon: any) {
    if (msg && msg.includes("(auth/code-expired)")) {
      msg = 'The SMS code has expired. Please re-send the verification code to try again. ';
    }
    if (msg && msg.includes("(auth/network-request-failed)")) {
      msg = 'A network Error (such as timeout, interrupted connection or unreachable host) has occurred ';
    }

    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
      color: colors,
      position: positon
    });
    toast.present();
  }
  async showErrorAlert(msg: any) {
    const alert = await this.alertCtrl.create({
      header: 'Error',
      message: msg,
      buttons: ['OK']
    });

    await alert.present();
  }


  async showInfoAlert(msg: any) {
    const alert = await this.alertCtrl.create({
      header: 'Info',
      message: msg,
      buttons: ['OK']
    });

    await alert.present();
  }

  generateAlphaNumericId() {
    let result = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return result;
  }

  generateFreeSubjectPaymentId() {
    let result = 'stkwizz_free' + Math.random().toString(18).substring(2, 9) + Math.random().toString(36).substring(2, 9);
    return result;
  }

  generateDynamoPaymentId() {
    let result = 'skdynamo' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return result;
  }

  generateAlphaNumericIdWithApped(data: any) {
    let result = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return data + result;
  }

  generateAlphaNumericNumber() {
    let result = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    return result;
  }

  sortingBasedOnNumber(a: number, b: number) {
    return a - b;
  }
  getRandomWithRang(min, max, limit) {
    let randoms = [];
    while (randoms.length <= limit) {
      randoms.push(randoms.length + 1);
    }
    return randoms;
  }
  getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}
