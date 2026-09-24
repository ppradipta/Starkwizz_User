import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { VideoReportModalComponent } from '../video-report-modal/video-report-modal.component';

@Component({
  selector: 'app-video-option-modal',
  templateUrl: './video-option-modal.component.html',
  styleUrls: ['./video-option-modal.component.scss'],
})
export class VideoOptionModalComponent implements OnInit {

  constructor(
    public modalController: ModalController,
  ) { }

  ngOnInit() {}

  close() {
    this.modalController.dismiss();
  }

  async onClickReport() {
    this.close();
    const modal = await this.modalController.create({
      component: VideoReportModalComponent,
      cssClass: 'reportModal',
      backdropDismiss: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
    });
    await modal.present();
  }

}
