import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { DateUtilService } from 'src/app/common/util/date-util.service';
import { UserDetails } from 'src/app/model/user';
import { UserServiceService } from 'src/app/services/user-service.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit {
  subscribeUserDetails: any;
  userDetails: UserDetails = new UserDetails();
  studentProfiles: any[] = [];
  constructor(
    private navCtrl: NavController,
    private router: Router,
    private firestore: AngularFirestore,
    private userService: UserServiceService,
    private dateUtil: DateUtilService
  ) { }

  ngOnInit() {
    this.userService.getUserDetails().subscribe(user => {
      this.userDetails = user;
      if ('PARENT' == this.userDetails.userType) {
        this.firestore.collection('users', ref => ref.where("parentId", "==", this.userDetails.id)).get().subscribe((res: any) => {
          res.forEach((element: any) => {
            let student = element.data();
            let index = this.studentProfiles.findIndex(std => std.id == element.id);
            if (index == -1) {
              this.studentProfiles.push(student);
            }
          });
        });
      } else if ('student' == this.userDetails.userType?.toLocaleLowerCase() && this.userDetails.parentId) {
        this.firestore.collection('users', ref => ref.where("parentId", "==", this.userDetails.parentId)).get().subscribe((res: any) => {
          res.forEach((element: any) => {
            let student = element.data();
            let index = this.studentProfiles.findIndex(std => std.id == element.id);
            if (index == -1) {
              this.studentProfiles.push(student);
            }
          });
        });
      }
    });

  }

  ionViewWillEnter() {
    this.userService.getUserDetails().subscribe(user => {
      this.userDetails = user;
      if ('PARENT' == this.userDetails.userType) {
        this.firestore.collection('users', ref => ref.where("parentId", "==", this.userDetails.id)).get().subscribe((res: any) => {
          res.forEach((element: any) => {
            let student = element.data();
            let index = this.studentProfiles.findIndex(std => std.id == element.id);
            if (index == -1) {
              this.studentProfiles.push(student);
            }
          });
        });
      } else if ('student' == this.userDetails?.userType?.toLocaleLowerCase() && this.userDetails.parentId) {
        this.firestore.collection('users', ref => ref.where("parentId", "==", this.userDetails.parentId)).get().subscribe((res: any) => {
          res.forEach((element: any) => {
            let student = element.data();
            let index = this.studentProfiles.findIndex(std => std.id == element.id);
            if (index == -1) {
              this.studentProfiles.push(student);
            }
          });
        });
      }
    });
  }


  goBack() {
    this.navCtrl.back();
  }

  onClickAdd() {
    this.router.navigate(['home/account/addAccount']);
  }

  onClickDetail() {
    this.router.navigate(['home/viewProfile']);
  }


  viewProfile(student: any) {
    this.userService.setUserDetails(student);
    this.lastSeenProfile(student);
    this.router.navigate(['/home/tabs/events']);
  }

  lastSeenProfile(user: any) {
    user.lastseenunix = this.dateUtil.getCurrentDateWithTime();
    user.lastseen = this.dateUtil.getCurrentDateWithTime();
    this.firestore.collection("users").doc(user.id).update({
      lastseenunix: user.lastseenunix,
      lastseen: user.lastseen
    });
  }


}