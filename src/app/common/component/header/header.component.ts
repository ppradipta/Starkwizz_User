import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { FirebaseCollection } from 'src/app/model/common/firebase-collection';
import { UserDetails } from 'src/app/model/user';
import { UserHelperService } from 'src/app/services/helper/user-helper.service';
import { UserServiceService } from 'src/app/services/user-service.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  userDetails: UserDetails = new UserDetails();
  notificationCount = 0;

  constructor(
    private navCtrl: NavController,
    private userHelperService: UserHelperService,
    private router: Router,
    private firestore: AngularFirestore,
    private userService: UserServiceService
  ) { }

  ngOnInit() {
    this.getUserDetails();
    this.getAllNotifications();
  }

  goBack() {
    this.navCtrl.back();
    let res: any[] = []
    this.userHelperService.setSubjectsList(res);
    this.firestore.collection('users').doc(this.userDetails.id).get().subscribe((user: any) => {
      if (user.exists) {
        this.userService.setUserDetails(user.data());
      }
    })

  }


  goToNotification() {
    this.router.navigate(['home/notification']);
  }

  getUserDetails() {
    this.userService.getUserDetails().subscribe((userData) => {
      if (userData) {
        this.userDetails = userData;
      }
    });
  }

  getAllNotifications() {
    this.firestore.collection(FirebaseCollection.USER_NOTIFICATION, ref => ref
      .where('userId', '==', this.userDetails.id))
      .valueChanges().subscribe((requests: any[]) => {
        this.notificationCount = requests.filter(message => true && message.status == 'ACTIVE').length;
      });
  }

}
