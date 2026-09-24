import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import * as moment from 'moment';
import { DateUtilService } from 'src/app/common/util/date-util.service';
import { FirebaseCollection } from 'src/app/model/common/firebase-collection';
import { LoadingService } from 'src/app/services/loading.service';
import { UserServiceService } from 'src/app/services/user-service.service';

@Component({
  selector: 'app-reward',
  templateUrl: './reward.component.html',
  styleUrls: ['./reward.component.scss'],
})
export class RewardComponent implements OnInit {
  userDetails: any = {};
  allRewardList: any = [];
  months: any = [];
  selectMonth: any = {};
  selectYear: string = '';
  currentMonth = moment().format('MMM');
  currentYear = moment().format('YYYY');
  lastMonth: string;
  currentMonthReward: any[] = [];
  lastMonthReward: any[] = [];
  allTotalRewardPoint: number = 0;
  currentTotalRewardPoint: number = 0;
  lastTotalRewardPoint: number = 0;
  constructor(
    private userService: UserServiceService,
    private firestore: AngularFirestore,
    private loading: LoadingService,
    private dateUtilService: DateUtilService,
  ) {
    this.months = this.dateUtilService.get12Months();
    this.selectMonth = this.months[0];
    this.selectYear = this.currentYear;
  }

  ngOnInit() {
    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
    });

    this.lastMonth = this.dateUtilService.getLastMonth();
    this.getHubDetails();
  }


  searchOrders() {
    this.loading.present();
    this.getHubDetails();
  }



  getHubDetails() {
    this.loading.present();
    this.firestore.collection(FirebaseCollection.EXAM_REWARD, ref => ref
      .where('userId', '==', this.userDetails.id)
      .where('year', '==', this.selectYear))
      .valueChanges().subscribe((records: any[]) => {
        this.allRewardList = records;
        this.allTotalRewardPoint = this.allRewardList.reduce((sum, item) => sum + item.totalPoint, 0);

        this.currentMonthReward = this.allRewardList.filter(message => message.month == this.selectMonth.title);
        this.currentTotalRewardPoint = this.currentMonthReward.reduce((sum, item) => sum + item.totalPoint, 0);

        this.lastMonthReward = this.allRewardList.filter(message => message.month == this.lastMonth);
        this.lastTotalRewardPoint = this.lastMonthReward.reduce((sum, item) => sum + item.totalPoint, 0);
      });


  }
}
