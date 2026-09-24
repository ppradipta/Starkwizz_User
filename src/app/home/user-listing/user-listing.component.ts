import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { DateUtilService } from 'src/app/common/util/date-util.service';
import { UserDetails } from '../../model/user';
import { UserServiceService } from '../../services/user-service.service';

@Component({
  selector: 'app-user-listing',
  templateUrl: './user-listing.component.html',
  styleUrls: ['./user-listing.component.scss'],
})
export class UserListingComponent implements OnInit {
  subscribeUserDetails: any;
  userDetails: UserDetails = new UserDetails();
  studentProfiles: any[] = [];
  userId: string = '';
  constructor(private router: Router, private userService: UserServiceService, private dateUtil: DateUtilService,
    private firestore: AngularFirestore, private afAuth: AngularFireAuth) { }

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
      }
    });

  }


  viewProfile(student: any) {

    this.lastSeenProfile(student);
    this.userService.setUserDetails(student);
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

