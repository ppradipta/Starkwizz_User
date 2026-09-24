import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { DateUtilService } from 'src/app/common/util/date-util.service';
import { FirebaseCollection } from 'src/app/model/common/firebase-collection';
import { UserDetails } from 'src/app/model/user';
import { UserServiceService } from 'src/app/services/user-service.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent implements OnInit {
  userDetails: UserDetails = new UserDetails();
  public notificationCount = 0;
  public notifications: any[] = [];

  constructor(
    private userService: UserServiceService,
    private firestore: AngularFirestore,
    private navCtrl: NavController,
    private dateUtilService: DateUtilService,
    private router: Router
  ) { }

  ngOnInit() {
      this.getUserDetails();
      this.getAllNotifications();
  }

  getUserDetails(){
    this.userService.getUserDetails().subscribe((userData) => {
      if (userData) {
        this.userDetails = userData;
      }
    });
  }

  getAllNotifications() {
    this.firestore.collection(FirebaseCollection.USER_NOTIFICATION ,ref => ref
      .where('userId', '==', this.userDetails.id))
      .valueChanges().subscribe((requests:any[]) => {
      this.notifications = requests;
      this.notifications = this.dateUtilService.sortingBasedOnCreationTime(this.notifications.filter(Boolean));
    });
  }

  goBack() {
    //mark seen to all notifications
    let activeNotifications = this.notifications.filter(message => message.status == 'ACTIVE');
    activeNotifications.forEach(noti => {
      this.userService.updateStatusForNotification(noti, 'SEEN');
    })

    //go back
    this.router.navigate(['home/tabs/starkwizzHome']);
  }
  clearAllNotification(){
    this.userService.deleteAllNotification(this.userDetails);
  }
}
