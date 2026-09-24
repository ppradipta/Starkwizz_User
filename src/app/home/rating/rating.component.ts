import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NavController } from '@ionic/angular';
import { DateUtilService } from 'src/app/common/util/date-util.service';
import { UserServiceService } from 'src/app/services/user-service.service';
import { UtilServiceService } from 'src/app/services/util-service.service';

@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.scss'],
})
export class RatingComponent implements OnInit {
  userDetails: any = {};
  rating = [
    { id: 1, isTrue: false },
    { id: 2, isTrue: false },
    { id: 3, isTrue: false },
    { id: 4, isTrue: false },
    { id: 5, isTrue: false },
  ]
  orderType: any;
  review: string = '';
  orderID: any;
  selectRating: any = [];
  orderDetails: any = {};
  constructor(
    private navCtrl: NavController,
    private userService: UserServiceService,
    private util: UtilServiceService,
    private dateUtilService: DateUtilService,
    private firestore: AngularFirestore,

  ) {
  }

  ngOnInit() {
    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
    });

  }

  goBack() {
    this.navCtrl.back();
  }

  onClickRating(list: any) {
    let selectedRating = 0;
    if (selectedRating === 0) {

      this.rating.filter((star) => {

        if (star.id <= list) {
          star.isTrue = true;
        } else {
          star.isTrue = false;
        }

        return star;
      });

    }

    this.selectRating = this.rating.filter(rt => (rt.isTrue == true))
  }

  confirm() {
    if (this.review) {
      let rate = {
        id: this.util.generateAlphaNumericId(),
        createDate: this.dateUtilService.getCurrentDateWithTime(),
        createDateUnix: this.dateUtilService.getCurrentEpochTime(),
        type: 'TYPE_RATING',
        status: 'ACTIVE',
        review: this.review,
        rating: this.selectRating,
        name: this.userDetails.displayName,
        userEmail: this.userDetails.emailId,
        mobileNo: this.userDetails.mobileNo,
        userId: this.userDetails.id,
        boardId: this.userDetails.boardId,
        boardName: this.userDetails.boardName,
        classId: this.userDetails.classId,
        className: this.userDetails.className,
        dateOfBirth: this.userDetails.dateOfBirth,
        gender: this.userDetails.gender,
        stateId: this.userDetails.stateId,
        stateName: this.userDetails.stateName,
        districtId: this.userDetails.districtId,
        districtName: this.userDetails.districtName,
        cityId: this.userDetails.cityId,
        cityName: this.userDetails.cityName,
        schoolId: this.userDetails.schoolId,
        schoolName: this.userDetails.schoolName,
        appId: this.userDetails.applicationId,
        month: this.dateUtilService.getCurrentMonth(),
        year: this.dateUtilService.getCurrentYear(),
      }
      this.firestore.collection('user_rating').doc(rate.id)
        .set(JSON.parse(JSON.stringify(rate)), { merge: true });
      this.util.showToast(('Rate & Review Updated Successfully !!!'), 'success', 'bottom');
      this.goBack();
    } else {
      this.util.showToast(('Please Text Review!!!'), 'danger', 'bottom');

    }
  }

}