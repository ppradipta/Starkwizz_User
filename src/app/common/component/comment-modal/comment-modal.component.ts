import { Component, Input, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ModalController } from '@ionic/angular';
import { RepliesModalComponent } from '../replies-modal/replies-modal.component';

@Component({
  selector: 'app-comment-modal',
  templateUrl: './comment-modal.component.html',
  styleUrls: ['./comment-modal.component.scss'],
})
export class CommentModalComponent implements OnInit {
  comments: any[] = []
  @Input() videoId: string = '';
  @Input() user:any={};
  commentText:string='';
  constructor(
    public modalController: ModalController,
    private firestore: AngularFirestore,
  ) { }

  ngOnInit() { }

  close() {
    this.modalController.dismiss();
  }

  getVideoComments() {
    let query = this.firestore.collection('video_comments').ref
      .where('videoId', '==', this.videoId).limit(20).orderBy('date').get().then((results: any) => {
        this.comments = [];
        if (!results.empty) {
          results.forEach((data: any) => {
            let lcomment: any = data.data();
            this.comments.push(lcomment);
          });
        }
      });
  }

  async onClickReplie(commn: any) {
    this.close();
    const modal = await this.modalController.create({
      component: RepliesModalComponent,
      cssClass: 'ratingModal',
      backdropDismiss: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      componentProps: {
        videoId: commn.id,
      },
    });
    await modal.present();
  }

}
