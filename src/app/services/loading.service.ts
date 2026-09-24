import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  isLoading = false;
  //loaderToShow: Promise<void>;
  constructor(public loadingController: LoadingController) { }

  async present() {
    this.isLoading = true;
    return await this.loadingController.create({
      cssClass: 'page-loader clock-loader',
      spinner: null, // removes default spinner
      message: 'Getting ready...',
      backdropDismiss: false,
      duration: 1500,
    }).then(a => {
      a.present().then(() => {
        if (!this.isLoading) {
          a.dismiss();
        }
      });
    });
  }

  async dismiss() {
    this.isLoading = false;
    return await this.loadingController.getTop().then(v => v ? this.doStopLoader() : null);
  }
  doStopLoader() {
    this.loadingController.dismiss();
  }
  async presentLoading(duration: number) {
    this.isLoading = true;
    this.loadingController.create({
      cssClass: 'page-loader clock-loader',
      spinner: null, // removes default spinner
      message: 'Getting ready...',
      backdropDismiss: false,
      duration: duration
    }).then((res) => {
      res.present().then(() => {
        if (!this.isLoading) {
          res.dismiss();
        }
      });
    });
  }

  async presentLoadingWithoutDuration() {
    this.isLoading = true;
    return await this.loadingController.create({
      cssClass: 'page-loader clock-loader',
      spinner: null, // removes default spinner
      message: 'Getting ready...',
      backdropDismiss: false,
    }).then(a => {
      a.present().then(() => {
        if (!this.isLoading) {
          a.dismiss();
        }
      });
    });
  }

  

}
