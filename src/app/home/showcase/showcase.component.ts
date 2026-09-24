import { AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
//import { VideoOptions } from '@awesome-cordova-plugins/video-player/ngx';
import { AlertController, IonInfiniteScroll, ModalController, Platform } from '@ionic/angular';
//import { SchoolDaysModalComponent } from 'src/app/home/short-videos/school-days-modal/school-days-modal.component';
import { UserDetails } from 'src/app/model/user';
import { LoadingService } from 'src/app/services/loading.service';
import { UserServiceService } from 'src/app/services/user-service.service';
import { VideoUploadService } from 'src/app/services/videouploaded.service';
// import SwiperCore, { Autoplay, Keyboard, Pagination, Scrollbar, Zoom } from 'swiper';
// SwiperCore.use([Autoplay, Keyboard, Pagination, Scrollbar, Zoom]);

@Component({
  selector: 'app-showcase',
  templateUrl: './showcase.component.html',
  styleUrls: ['./showcase.component.scss'],
})
export class ShowcaseComponent implements OnInit, AfterViewInit {
  @ViewChildren('videoElements') videoElements: QueryList<ElementRef>={} as QueryList<ElementRef>;
  public videoPlayers :any[]= [];
  subscribeUserDetails: any;
  userDetails: UserDetails = new UserDetails();
  studentProfile: any[] = [];
  userSubjectSubscriptions: any;
  queuePosition = 0;
  video: any = null;
  slideOpts = {
    direction: 'vertical',
    initialSlide: 0,
    slidesPerView: 1,
    autoplay: false
  };
  videoList: any = [];
  videoContent: any;
  imageList: any = [];
  imageContent: any;
  infiniteScroll: IonInfiniteScroll={} as IonInfiniteScroll;
  lastPlayedVideoIndex: number = 0;
  videoLike: any;
  isShowToster = true;
  lastvideo: any;
  videoPlayPause = false;
  isHideBtn = false;
  selectedContentType: any = {
    'typevalue': 'videoclips',
    'type': 'type'
  };
 // videoOptions: VideoOptions;
  constructor(private router: Router, private userService: UserServiceService,
    private firestore: AngularFirestore, public modalController: ModalController,
    private videoUploadService: VideoUploadService, private platform: Platform,
    private loading: LoadingService,
    private alertCtrl: AlertController) {


  }

  ngOnInit() {


    let id =''; //this.router.getCurrentNavigation().extras.state;
    if (id) {
      this.getUserProfileDetails(id);
    }
    else {
      this.userService.getUserDetails().subscribe((userData) => {
        this.userDetails = userData;
      })
    }

    this.videoPlayPause = true;
    this.userService.getFilterContentType().subscribe(contentType => {
      this.selectedContentType = contentType
    });
    //this.loading.presentLoading(6000);
    this.getVideoList();
    this.getSnapShots();
  }

  ionViewWillEnter() {

  }

  ngAfterViewInit() {
    this.videoElements.changes
      .subscribe((queryChanges) => {
        this.videoPlayers = this.videoElements.toArray();
        if (this.videoPlayers.length > 0) {
          const videoElement =
            this.videoPlayers[this.lastPlayedVideoIndex].nativeElement;
          if (videoElement) {
            videoElement.style.display = 'block';
            this.videoPlayPause = false;
            videoElement.play();
            this.videoUploadService.setLastPlayVideos(videoElement);
          }
        }
      });
  }

  ionViewDidEnter() {
    if (this.videoPlayers.length > 0) {
      const videoElement =
        this.videoPlayers[this.lastPlayedVideoIndex].nativeElement;
      if (videoElement) {
        videoElement.style.display = 'block';
        this.videoPlayPause = false;
        videoElement.play();
        this.videoUploadService.setLastPlayVideos(videoElement);
      }
    }


  }

  ngOnDestroy() {
    if (this.videoPlayers[this.lastPlayedVideoIndex]) {
      const lastPlayedVideoElement =
        this.videoPlayers[this.lastPlayedVideoIndex].nativeElement;

      if (lastPlayedVideoElement) {
        lastPlayedVideoElement.pause();
      }
    }

  }

  ionViewDidLeave() {
    if (this.videoPlayers[this.lastPlayedVideoIndex]) {
      const lastPlayedVideoElement =
        this.videoPlayers[this.lastPlayedVideoIndex].nativeElement;
      if (lastPlayedVideoElement) {
        lastPlayedVideoElement.pause();
      }
    }

  }

  ionViewWillLeave() {
    this.videoUploadService.getLastPlayVideos().subscribe(lastvideo => {
      this.lastvideo = lastvideo;
    });
    if (this.lastvideo) {
      this.lastvideo.pause();
    }
  }

  getUserProfileDetails(uid:any) {
    this.firestore.collection('users_profile').doc(uid).get().subscribe((respone: any) => {
      if (respone.exists) {
        this.userDetails = respone.data();
        this.userService.setUserDetails(this.userDetails);
      }
    })
  }

  fileChangeEvent(event: any) {
    let items = {
      imageUrl: event,
      userId: this.userDetails.id
    }
    this.userService.setImagesDataForUpload(items);
    this.router.navigate(['imageUpload']);
  }




  async onClickLabel(type:any) {
    if (this.videoPlayers[this.lastPlayedVideoIndex]) {
      const lastPlayedVideoElement =
        this.videoPlayers[this.lastPlayedVideoIndex].nativeElement;
      if (lastPlayedVideoElement) {
        lastPlayedVideoElement.pause();
      }
    }

    // const modal = await this.modalController.create({
    //   component: SchoolDaysModalComponent,
    //   cssClass: 'schoolDayModal',
    //   backdropDismiss: false,
    //   componentProps: {
    //     type: type,
    //   },
  //  });
   // await modal.present();
  }


  async findNext(event:any) {
    await this.videoUploadService.getAllUploadedVideoDetails();
    event.target.complete();
  }

  async findNextForImage(event:any) {
    await this.videoUploadService.getAllUploadedImageDetails();
    event.target.complete();
  }

  async doRefresh(event:any) {
    //this.videoUploadService.nextQueryAfter = null;
    await this.videoUploadService.getAllUploadedVideoDetails();
    event.target.complete();
  }

  async doRefreshForImage(event:any) {
    //this.videoUploadService.nextImageQueryAfter = null;
    await this.videoUploadService.getAllUploadedImageDetails();
    event.target.complete();
  }

  async getSnapShots() {
    await this.videoUploadService.getAllUploadedImageDetails();
    this.videoUploadService.uploadedImages.subscribe((results:any) => {
      this.imageList = [];
      results.forEach((docSnapshot:any) => {
        let img = docSnapshot.data();
        img['likes'] = img.likes ? img.likes : 0;
        img['comments'] = 0;
        img['userPic'] = this.userDetails.imageUrl;
        if (img.likesUser) {
          img.likesUser.forEach((element:any) => {
            if (element.id == this.userDetails.id) {
              img['videoLike'] = true;
            }
          });
        }
        if (img.followUsers) {
          img.followUsers.forEach((element:any) => {
            if (element.id == this.userDetails.id) {
              img['videoFollow'] = true;
            }
          });
        }
        img['contenttype'] = 'IMAGE';
        this.imageList.push(img);
      });
      this.imageContent =
      {
        isBeginningSlide: true,
        isEndSlide: false,
        slidesItems: this.imageList
      };

    });
  }

  async getVideoList() {
    await this.videoUploadService.getAllUploadedVideoDetails();
    this.videoUploadService.uploadedVideos.subscribe((results:any) => {
      this.videoList = [];
      results.forEach((docSnapshot:any) => {
        let vid = docSnapshot.data();
        vid['likes'] = vid.likes ? vid.likes : 0;
        vid['comments'] = 0;
        vid['userPic'] = this.userDetails.imageUrl;
        if (vid.likesUser) {
          vid.likesUser.forEach((element:any) => {
            if (element.id == this.userDetails.id) {
              vid['videoLike'] = true;
            }
          });
        }
        if (vid.followUsers) {
          vid.followUsers.forEach((element:any) => {
            if (element.id == this.userDetails.id) {
              vid['videoFollow'] = true;
            }
          });
        }
        vid['contenttype'] = 'VIDEO';
        this.videoList.push(vid);
      });
      this.videoContent =
      {
        isBeginningSlide: true,
        isEndSlide: false,
        slidesItems: this.videoList
      };

    });
  }

  onClickFilter() {
    if (this.videoPlayers[this.lastPlayedVideoIndex]) {
      const lastPlayedVideoElement =
        this.videoPlayers[this.lastPlayedVideoIndex].nativeElement;
      if (lastPlayedVideoElement) {
        lastPlayedVideoElement.pause();
      }
    }
    this.router.navigate(['home/filter']);

  }



  onSlideTapped() {
    this.isHideBtn = true;
    setTimeout(() => {
      this.isHideBtn = false;
    }, 700);
    const videoElement =
      this.videoPlayers[this.lastPlayedVideoIndex].nativeElement;
    if (videoElement && videoElement.paused) {
      videoElement.style.display = 'block';
      this.videoPlayPause = false;
      videoElement.play();
      this.videoUploadService.setLastPlayVideos(videoElement);
    } else {
      this.videoPlayPause = true;
      videoElement.pause();
    }
  }

  videoEnd() {
    const lastPlayedVideoElement =
      this.videoPlayers[this.lastPlayedVideoIndex].nativeElement;
    if (lastPlayedVideoElement) {
      this.videoPlayPause = false;
      lastPlayedVideoElement.play();
    }
  }

  slideChanged(event:any) {
    const lastPlayedVideoElement =
      this.videoPlayers[this.lastPlayedVideoIndex].nativeElement;
    if (lastPlayedVideoElement) {
      this.videoPlayPause = true;
      lastPlayedVideoElement.pause();
    }
    let index = event.target.swiper.activeIndex;
    const videoElement =
      this.videoPlayers[index].nativeElement;
    if (videoElement) {
      videoElement.style.display = 'block';
      this.videoPlayPause = false;
      videoElement.play();
      this.lastPlayedVideoIndex = index;
      this.videoUploadService.setLastPlayVideos(videoElement);
    }
  }

  imageSlideChanged(event:any) {

    let index = event.target.swiper.activeIndex;

  }

  /* presentBackButtonAlert() {
    this.alertCtrl.create({
      header: 'Exit?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
          }

        }, {
          text: 'Yes',
          handler: () => {
            console.log('Confirm Okay');
           
          }
        }
      ]

    });
  } */

  async presentBackButtonAlert() {
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: 'Confirm!',
      message: 'Exit?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          id: 'cancel-button',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Okay',
          id: 'confirm-button',
          handler: () => {
            console.log('Confirm Okay');
           // navigator['app'].exitApp();
          }
        }
      ]
    });

    await alert.present();
  }

  goToDynamo() {
    const lastPlayedVideoElement =
      this.videoPlayers[this.lastPlayedVideoIndex].nativeElement;

    if (lastPlayedVideoElement) {
      lastPlayedVideoElement.pause();
    }
    this.router.navigate(['home/dynamo']);
  }

}


