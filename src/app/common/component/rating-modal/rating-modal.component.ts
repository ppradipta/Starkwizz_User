import { Component, Input, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ModalController } from '@ionic/angular';
import { UtilServiceService } from 'src/app/services/util-service.service';
import { DateUtilService } from '../../util/date-util.service';

@Component({
  selector: 'app-rating-modal',
  templateUrl: './rating-modal.component.html',
  styleUrls: ['./rating-modal.component.scss'],
})
export class RatingModalComponent implements OnInit {
  @Input() event: any = {};
  @Input() user: any = {};
  ratingDetls: any = {
    rate: 5,
    rateText: 'Truly Satisfied',
    rateIcon: 'assets/images/TrulySatisfied.gif'
  };
  isRatingDisable: boolean = false;
  constructor(
    public modalController: ModalController,
    private firestore: AngularFirestore,
    private dateUtil: DateUtilService,
    private util: UtilServiceService
  ) { }

  ngOnInit() {
    this.getRatingForThisVideoGivenByUser();
  }

  onClickClose() {
    this.modalController.dismiss();
  }

  getRatingForThisVideoGivenByUser() {
    this.firestore.collection('eclass_video_rating').ref
      .where('userId', '==', this.user.id)
      .where('videoId', '==', this.event.id)
      .where('status', '==', 'APPROVED').get().then((ratings: any) => {
        this.isRatingDisable = false;
        if (!ratings.empty) {
          ratings.forEach((data: any) => {
            this.ratingDetls = data.data();
            this.isRatingDisable = true;
          });
        }
      });
  }

  ratingChanged(rate: number) {
    this.ratingDetls.rate = rate;
    if (rate == 1) {
      this.ratingDetls.rateText = 'Disappointed',
        this.ratingDetls.rateIcon = 'assets/images/disappointed.gif'
    }
    if (rate == 2) {
      this.ratingDetls.rateText = 'Unhappy',
        this.ratingDetls.rateIcon = 'assets/images/Unhappy.gif'
    }
    if (rate == 3) {
      this.ratingDetls.rateText = 'Average',
        this.ratingDetls.rateIcon = 'assets/images/nutral.gif'
    }
    if (rate == 4) {
      this.ratingDetls.rateText = 'Happy',
        this.ratingDetls.rateIcon = 'assets/images/happy.gif'
    }
    if (rate == 5) {
      this.ratingDetls.rateText = 'Truly Satisfied',
        this.ratingDetls.rateIcon = 'assets/images/TrulySatisfied.gif'
    }
  }
  closeRatingModal() {
    this.modalController.dismiss();
  }

  proceedForRateToConfirm() {
    if (this.ratingDetls.userId) {
      this.util.showToast(('You have already ratted for this video !!!'), 'success', 'bottom');
    } else {
      let rating = {
        userId: this.user.id,
        name: this.user.displayName,
        image: this.user.imageUrl,
        videoId: this.event.id,
        date: this.dateUtil.getCurrentDateWithTime(),
        status: 'APPROVED',
        rate: this.ratingDetls.rate
      }
      this.firestore.collection('eclass_video_rating').add(JSON.parse(JSON.stringify(rating))).then(result => {
        this.util.showToast(('Ratted Successfully for this video !!!'), 'success', 'bottom');
        this.modalController.dismiss();
      }).then(result => {
        let totalRate = this.event.ratingCount + this.ratingDetls.rate;
        let avgRate = Math.round(totalRate / (this.event.ratedByUserCount + 1))
        this.firestore.collection('eclass').doc(this.event.id).update({
          avgRate: avgRate,
          ratingCount: totalRate,
          ratedByUserCount: Number(this.event.ratedByUserCount) + 1
        });

      })
    }
  }

}
