import { Component, Input, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { DateUtilService } from 'src/app/common/util/date-util.service';
import { FirebaseCollection } from 'src/app/model/common/firebase-collection';
import { UserDetails } from 'src/app/model/user';
import { UserServiceService } from 'src/app/services/user-service.service';


@Component({
  selector: 'posted-video-modal',
  templateUrl: './posted-video-modal.component.html',
  styleUrls: ['./posted-video-modal.component.scss'],
})
export class PostedVideoModalComponent implements OnInit {

  @Input() video: any;
  notificationCount = 0;
  userDetails: UserDetails = new UserDetails();

  constructor(
    public modalController: ModalController,
    public firestore: AngularFirestore,
    private router: Router,
    private dateUtilService: DateUtilService,
    private userService: UserServiceService,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
      this.getAllNotifications();
    });
  }

  goBack() {
    this.modalController.dismiss();
  }



  approveVideo() {
    this.firestore.collection('video_upload').doc(this.video.id)
      .update({
        status: 'APPROVED',
        publishdate: this.dateUtilService.getCurrentDateWithTime(),
        publishBy: 'ADMIN'
      });
  }


  rejectVideo() {
    this.firestore.collection('video_upload').doc(this.video.id)
      .update({
        status: 'REJECTED',
        rejectedDate: this.dateUtilService.getCurrentDateWithTime(),
        rejectedBy: 'ADMIN'
      });

  }



  getAllNotifications() {
    this.firestore.collection(FirebaseCollection.USER_NOTIFICATION, ref => ref
      .where('userId', '==', this.userDetails.id))
      .valueChanges().subscribe((requests: any[]) => {
        this.notificationCount = requests.filter(message => message.status == 'ACTIVE').length;
      });
  }
  goToNotification() {
    this.router.navigate(['home/notification']);
  }



}

