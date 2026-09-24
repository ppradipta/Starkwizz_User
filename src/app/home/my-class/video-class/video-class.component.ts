import { AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';
import { IonModal, ModalController, ToastController } from '@ionic/angular';
import { CommentModalComponent } from 'src/app/common/component/comment-modal/comment-modal.component';
import { RatingModalComponent } from 'src/app/common/component/rating-modal/rating-modal.component';
import { UserServiceService } from 'src/app/services/user-service.service';

@Component({
  selector: 'app-video-class',
  templateUrl: './video-class.component.html',
  styleUrls: ['./video-class.component.scss'],
})
export class VideoClassComponent implements OnInit, AfterViewInit {

  @ViewChild(IonModal) videoDesc: IonModal = {} as IonModal;
  @ViewChildren('videoElements') videoElements: QueryList<ElementRef> = {} as QueryList<ElementRef>;
  segmentValue: string = "videoClass";
  currentModal = null;
  filterBoardId: string = '';
  filterClassId: string = '';
  filterSubjectId: string = '';
  filterModuleId: string = '';
  eClassList: any[] = [];
  videoPlayers: any[] = [];
  lastPlayedVideoIndex: number = 0;
  user: any = {};
  isHideBtn = false;
  videoPlayPause = false;
  selectVideo: any = {};
  isVideoDescOpen = false;
  constructor(
    public modalController: ModalController,
    public toastController: ToastController,
    private firestore: AngularFirestore,
    private activeRoute: ActivatedRoute,
    private userService: UserServiceService,
    private modal: ModalController
  ) { }

  ngOnInit() {
    this.userService.getUserDetails().subscribe((userData) => {
      this.user = userData;
    });
    this.filterBoardId = this.activeRoute.snapshot.queryParams['boardId'];
    this.filterClassId = this.activeRoute.snapshot.queryParams['classId'];
    this.filterSubjectId = this.activeRoute.snapshot.queryParams['subjectId'];
    this.filterModuleId = this.activeRoute.snapshot.queryParams['moduleId'];
    this.search();
  }

  segmentChanged(event: any) {
    this.segmentValue = event.detail.value;
  }

  async onClickDesc(event: any) {
    this.selectVideo = event;
    this.isVideoDescOpen = true;
  }

  modalDismiss() {
    this.selectVideo = null;
    this.isVideoDescOpen = false;
    this.modal.dismiss(null, 'cancel');
  }

  async onClickViewRatingDetails(event: any) {
    const modal = await this.modalController.create({
      component: RatingModalComponent,
      cssClass: 'ratingModal',
      backdropDismiss: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      componentProps: {
        event: event,
        user: this.user,

      },
    });
    await modal.present();
  }


  ngAfterViewInit() {
    this.videoElements.changes
      .subscribe((queryChanges) => {
        this.videoPlayers = this.videoElements.toArray();
      });
  }

  ionViewDidEnter() {

    this.videoElements.changes
      .subscribe((queryChanges) => {
        this.videoPlayers = this.videoElements.toArray();
      });

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


  async onClickComment(event: any) {
    const modal = await this.modalController.create({
      component: CommentModalComponent,
      cssClass: 'ratingModal',
      backdropDismiss: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      componentProps: {
        videoId: event.id,
        user: this.user
      },
    });
    await modal.present();
  }

  async presentToast(msg: any) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 3000,
      cssClass: 'successToast',
    });
    toast.present();
  }


  async search() {
    let query;
    if (this.filterClassId && this.filterSubjectId && this.filterModuleId) {
      query = this.firestore.collection('eclass').ref
        .where('boardName', '==', this.filterBoardId)
        .where('className', '==', this.filterClassId)
        .where('subjectId', '==', this.filterSubjectId)
        .where('moduleId', '==', this.filterModuleId)
        .where('status', '==', 'APPROVED')
        .orderBy('subjectName');
    } else if (this.filterBoardId && this.filterClassId && this.filterSubjectId) {
      query = this.firestore.collection('eclass').ref
        .where('boardName', '==', this.filterBoardId)
        .where('className', '==', this.filterClassId)
        .where('subjectId', '==', this.filterSubjectId)
        .where('status', '==', 'APPROVED')
        .orderBy('subjectName');
    } else {
      query = this.firestore.collection('eclass').ref
        .where('boardName', '==', this.filterBoardId)
        .where('className', '==', this.filterClassId)
        .where('status', '==', 'APPROVED')
        .orderBy('subjectName');
    }
    query.get().then((eventDetail: any) => {
      if (!eventDetail.empty) {
        eventDetail.forEach((data: any) => {
          let document = data.data();
          document['id'] = data.id;
          this.eClassList.push(document);
        });
      }
    });
  }





  videoPlayClick(event: any,videoIndex:number) {
  
    if(videoIndex!=this.lastPlayedVideoIndex){
      const lastPlayedVideoElement =
      this.videoPlayers[this.lastPlayedVideoIndex].nativeElement;
    if (lastPlayedVideoElement) {
      this.videoPlayPause = true;
      lastPlayedVideoElement.pause();
    }
    const currentPlayedVideoElement =
      this.videoPlayers[videoIndex].nativeElement;
    if (currentPlayedVideoElement) {
      currentPlayedVideoElement.style.display = 'block';
      this.videoPlayPause = false;
      currentPlayedVideoElement.play();
      this.lastPlayedVideoIndex = videoIndex;
    }
    }

  }

  videoEnd(event: any, index: number) {
    this.firestore.collection('eclass').doc(event.id).update({
      viewsCount: event.viewsCount + 1
    }).then(result => {
    })
  }
  onClickLike(event: any) {
    this.firestore.collection('eclass').doc(event.id).update({
      likeCount: event.likeCount + 1
    }).then(result => {
      this.presentToast('You have liked this video!!!');
    })
  }
  onClickDisLike(event: any) {
    this.firestore.collection('eclass').doc(event.id).update({
      dislikeCount: event.dislikeCount + 1
    }).then(result => {
      this.presentToast('You have disliked this video!!!');
    })
  }

}
