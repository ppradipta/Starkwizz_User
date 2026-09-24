
import { Component, Input, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { ModalController } from '@ionic/angular';
import firebase from 'firebase/compat/app';
import { UserDetails } from 'src/app/model/user';
import { UserServiceService } from 'src/app/services/user-service.service';
import { VideoUploadService } from 'src/app/services/videouploaded.service';
import { VideoOptionModalComponent } from '../video-option-modal/video-option-modal.component';


@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
})
export class FeedComponent implements OnInit {
  @Input() video: any;
  userDetails: UserDetails = new UserDetails();
  videoLike: any[] = [];
  videoId: string='';
  lastvideo: any;
  constructor(
    private router: Router,
    private userService: UserServiceService,
    private firestore: AngularFirestore,
    public modalController: ModalController,
    private socialSharing: SocialSharing,
    private videoUploadService: VideoUploadService
  ) {
  }

  ngOnInit() {
    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
    })
    this.videoUploadService.getLastPlayVideos().subscribe(lastvideo => {
      this.lastvideo = lastvideo;
    });

  }

  onClickprofile(video:any) {
    if (this.lastvideo) {
      this.lastvideo.pause();
    }
    this.userService.setVideoUserDetails(video)
    this.router.navigate(['home/showcaseProfile']);
  }

  likeVideo(videoData:any) {
    let likeCount = videoData.likes;
    if (videoData.videoLike) {
      this.firestore.collection('user_favourite', ref => ref.where("videoId", "==", this.video.id)).get().subscribe((res: any) => {
        res.forEach((element:any) => {
          let video = element.data();
          this.firestore.collection('video_upload').doc(this.video.id).update({
            'likesUser': firebase.firestore.FieldValue.arrayRemove({ id: this.userDetails.id })
          });
          this.video.videoLike = false;
          likeCount -= 1;
          this.video.likes = likeCount;
          this.userService.updateLikeToCollection(this.video);
          this.firestore.collection('user_favourite').doc(video.id).delete();
        });
      })
    } else {
      let userFavouriteDetails = this.userService.populateUserFavourite(this.userDetails, this.video)
      this.firestore.collection('video_upload').doc(this.video.id).update({
        'likesUser': firebase.firestore.FieldValue.arrayUnion({ id: this.userDetails.id })
      });
      this.video.videoLike = true;
      likeCount = + 1;
      this.video.likes = likeCount;
      this.userService.updateLikeToCollection(this.video);
      this.userService.setUserFavouriteToCollection(userFavouriteDetails);
    }

  }

  videoComment(comment:any) {
    console.log(comment);

  }
  flowUser(video:any) {
    if (this.userDetails.followUsers.includes(this.video.userId)) {
      //if (video.videoFollow) {
      this.firestore.collection('user_follow', ref => ref.where("videoId", "==", this.video.id)).get().subscribe((res: any) => {
        res.forEach((element:any) => {
          let video = element.data();
          this.firestore.collection('users').doc(this.userDetails.id).update({
            followUsers: firebase.firestore.FieldValue.arrayRemove(this.video.userId)
          });
          let UserIndex = this.userDetails.followUsers.findIndex(userId => userId == this.video.userId);
          if (UserIndex != -1) {
            this.userDetails.followUsers.splice(UserIndex, 1);
          }
          this.video.videoFollow = false;
          this.userService.updateLikeToCollection(this.video);
          this.firestore.collection('user_follow').doc(video.id).delete();
        });
      })
    }
    else {
      let userFlow = this.userService.populateUserFlow(this.userDetails, this.video);
      this.userDetails.followUsers.push(this.video.userId);
      this.firestore.collection('users').doc(this.userDetails.id).update({
        followUsers: firebase.firestore.FieldValue.arrayUnion(this.video.userId)
      });
      this.video.videoFollow = true;
      this.userService.setUserFlowToCollection(userFlow);
    }
  }
  async onClickOption() {
    const modal = await this.modalController.create({
      component: VideoOptionModalComponent,
      cssClass: 'optionModal',
      backdropDismiss: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
    });
    await modal.present();
  }

  shareVideo(video:any) {
    this.socialSharing.share(video.videoText, '', '', video.videoUrl).then(res => {
      console.log(res);
    }, err => {
      console.log(err);
    });
  }
}
