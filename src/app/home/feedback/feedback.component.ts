import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { ModalController, NavController, ToastController } from '@ionic/angular';
import { DateUtilService } from 'src/app/common/util/date-util.service';
import { UserDetails } from 'src/app/model/user';
import { TypesOfUserComponent } from 'src/app/public/modal/types-of-user/types-of-user.component';
import { UserServiceService } from 'src/app/services/user-service.service';
import { UtilServiceService } from 'src/app/services/util-service.service';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss'],
})
export class FeedbackComponent implements OnInit {

  userDetails: any = {};
  message: string = '';

  constructor(
    private navCtrl: NavController,
    private userService: UserServiceService,
    private dateUtilService: DateUtilService,
    private util: UtilServiceService,
    private firestore: AngularFirestore,

  ) { }

  ngOnInit() {
    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
    });
  }


  goBack() {
    this.navCtrl.back();
  }

  confirm() {
    if (this.message) {
      let feedback = {
        id: this.util.generateAlphaNumericId(),
        createDate: this.dateUtilService.getCurrentDateWithTime(),
        createDateUnix: this.dateUtilService.getCurrentEpochTime(),
        type: 'USER_FEEDBACK',
        status: 'ACTIVE',
        message: this.message,
        name: this.userDetails.displayName,
        mobileNo: this.userDetails.mobileNo,
        userEmail: this.userDetails.emailId,
        dateOfBirth: this.userDetails.dateOfBirth,
        gender: this.userDetails.gender,
        userId: this.userDetails.id,
        month: this.dateUtilService.getCurrentMonth(),
        year: this.dateUtilService.getCurrentYear(),
        boardId: this.userDetails.boardId,
        boardName: this.userDetails.boardName,
        classId: this.userDetails.classId,
        className: this.userDetails.className,
        stateId: this.userDetails.stateId,
        stateName: this.userDetails.stateName,
        districtId: this.userDetails.districtId,
        districtName: this.userDetails.districtName,
        cityId: this.userDetails.cityId,
        cityName: this.userDetails.cityName,
        schoolId: this.userDetails.schoolId,
        schoolName: this.userDetails.schoolName,
      }

      this.firestore.collection('user_feedback').doc(feedback.id)
        .set(JSON.parse(JSON.stringify(feedback)), { merge: true });
      this.util.showToast(('Thanks for Feedback !!!'), 'success', 'bottom');
      this.goBack();
    } else {
      this.util.showToast(('Please Type Message!!!'), 'danger', 'bottom');
    }
  }
}


