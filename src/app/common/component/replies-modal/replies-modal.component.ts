import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CommentModalComponent } from '../comment-modal/comment-modal.component';

@Component({
  selector: 'app-replies-modal',
  templateUrl: './replies-modal.component.html',
  styleUrls: ['./replies-modal.component.scss'],
})
export class RepliesModalComponent implements OnInit {
  replies: any[] = []
  @Input() commentId: string = '';
  constructor(
    public modalController: ModalController,
  ) { }

  ngOnInit() {}

  close() {
    this.modalController.dismiss();
  }

  async goBack() {
    this.close();
    const modal = await this.modalController.create({
      component: CommentModalComponent,
      cssClass: 'ratingModal',
      backdropDismiss: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
    });
    await modal.present();
  }

}
