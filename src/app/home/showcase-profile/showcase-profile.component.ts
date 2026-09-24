import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { UserDetails } from 'src/app/model/user';
import { UserServiceService } from 'src/app/services/user-service.service';
import { PostedVideoModalComponent } from '../playpostedvideo/posted-video-modal.component';

@Component({
  selector: 'app-showcase-profile',
  templateUrl: './showcase-profile.component.html',
  styleUrls: ['./showcase-profile.component.scss'],
})
export class ShowcaseProfileComponent implements OnInit {
  @ViewChildren('videoElements') videoElements: QueryList<ElementRef>= {} as QueryList<ElementRef>;
  segmentValue: string = "videoClips";
  achive = [1, 2, 3, 4, 5, 6]
  userProfileDetails: UserDetails = new UserDetails();
  videoUserData: any;
  postedVideos: any[] = [];
  userVideoPostCount: number = 0;
  postedImages: any[] = [];
  userImagePostCount: number = 0;
  constructor(
    private userService: UserServiceService,
    private firestore: AngularFirestore,
    private router: Router,
    private modalController:ModalController
  ) { }

  ngOnInit() {


    this.userService.getVideoUserDetails().subscribe((user) => {
      this.videoUserData = user;
    });
    if (this.videoUserData.userId) {
      this.getSchoolName();
      this.getPostDetails();
      this.getSnapoShotsDetails();
    }
  }


  getSchoolName() {
    this.firestore.collection("users_profile", ref => ref.where("id", "==", this.videoUserData.userId)).get().subscribe((data: any) => {
      data.forEach((res:any) => {
        this.userProfileDetails = res.data();
      })
    });
  }

  getPostDetails() {


    this.firestore.collection("video_upload", ref => ref.where("userId", "==", this.videoUserData.userId).where('status', '==', 'APPROVED')).get().subscribe((data: any) => {
      data.forEach((res:any) => {
        if (res.exists) {
          this.postedVideos.push(res.data());
        }
      });
      this.userVideoPostCount = this.postedVideos.length;
    });
  }


  getSnapoShotsDetails() {
    this.firestore.collection("image_upload", ref => ref.where("userId", "==", this.videoUserData.userId).where('status', '==', 'APPROVED')).get().subscribe((data: any) => {
      data.forEach((res:any) => {
        if (res.exists) {
          this.postedImages.push(res.data());
        }
      });
      this.userImagePostCount = this.postedImages.length;
    });
  }

  segmentChanged(event:any) {
    this.segmentValue = event.detail.value;
  }

  fileChangeEvent(event: any) {
    let items = {
      imageType: 'PROFILE-IMAGE',
      userId: this.videoUserData.userId,
      imageUrl: event,

    }
    this.userService.setImagesDataForUpload(items);
    this.router.navigate(['imageUpload']);
  }

  async onClickPlayVideo(video:any){
    const modal = await this.modalController.create({
      component: PostedVideoModalComponent,
      cssClass: 'addEvent-modal',
      backdropDismiss: false,
      componentProps: { video: video },
    });
    await modal.present();
  }
}
