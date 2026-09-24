import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { DateUtilService } from 'src/app/common/util/date-util.service';
import { UserDetails } from 'src/app/model/user';
import { LoadingService } from 'src/app/services/loading.service';
import { UserServiceService } from 'src/app/services/user-service.service';

@Component({
  selector: 'app-leader-board',
  templateUrl: './leader-board.component.html',
  styleUrls: ['./leader-board.component.scss'],
})
export class LeaderBoardComponent implements OnInit {
  selectedSubject: any;
  rankType: string = 'SCHOOL';
  eventId: string = '';
  eventType: string = '';
  userDetails: UserDetails = {} as UserDetails;
  rankRecords: any[] = [];
  rankOnePostion: any = {};
  rankTwoPostion: any = {};
  rankThreewoPostion: any = {};
  myRankPostion: any =null;
  segmentValue: string = "top3";
  constructor(
    private userService: UserServiceService,
    private navCtrl: NavController,
    private route: Router,
    private activeRoute: ActivatedRoute,
    private firestore: AngularFirestore,
    private loadingService: LoadingService,
    private dateUtilService: DateUtilService
  ) { }

  getRankExamTimeDisplay(rank: any): string {
    if (!rank) return '-';

    const persistedDisplay = String(rank?.totalExamTimeUsDisplay || '').trim();
    if (persistedDisplay) return persistedDisplay;

    const totalUs = Number(rank?.totalExamTimeUs);
    if (Number.isFinite(totalUs) && totalUs >= 0) {
      return this.dateUtilService.formatMicroSecondsToHhMmSsUs(totalUs);
    }

    const totalSeconds = Number(rank?.totalExamTime);
    if (Number.isFinite(totalSeconds) && totalSeconds >= 0) {
      return this.dateUtilService.formatMicroSecondsToHhMmSsUs(Math.round(totalSeconds * 1_000_000));
    }

    const legacyDisplay = String(rank?.totalExamTimeDisplay || '').trim();
    return legacyDisplay || '-';
  }

  ngOnInit() {
    this.loadingService.presentLoading(2000);
    this.rankType = this.activeRoute.snapshot.queryParams['rankType'];
    this.eventId = this.activeRoute.snapshot.queryParams['eventId'];
    this.eventType = this.activeRoute.snapshot.queryParams['eventType'];
    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
    });
    this.userService.intializeUserRanks();
    if (this.rankType == 'SCHOOL') {
      //this.userService.nextQueryAfterSchool = null;
      this.userService.getRanksSchoolWise(this.eventId, this.userDetails.schoolId, this.eventType);
      if (this.eventType == 'QUIZWHIZZ EXAM') {
        let myRankQuery = this.firestore.collection("user_quizwhizz_school_ranks").ref
          .where('status', '==', 'COMPLETED')
          .where('eventId', '==', this.eventId)
          .where('schoolId', '==', this.userDetails.schoolId)
          .where('userId', '==', this.userDetails.id);
        myRankQuery.get().then((eventRankDetail: any) => {
          this.myRankPostion = null;
          if (!eventRankDetail.empty) {
            eventRankDetail.forEach((data: any) => {
              this.myRankPostion = data.data();
            });
          }
        });
      } else {
        let myRankQuery = this.firestore.collection("user_event_school_ranks").ref
          .where('status', '==', 'COMPLETED')
          .where('eventId', '==', this.eventId)
          .where('schoolId', '==', this.userDetails.schoolId)
          .where('userId', '==', this.userDetails.id);
        myRankQuery.get().then((eventRankDetail: any) => {
          this.myRankPostion = null;
          if (!eventRankDetail.empty) {
            eventRankDetail.forEach((data: any) => {
              this.myRankPostion = data.data();
            });
          }
        });
      }
    }
    if (this.rankType == 'CITY') {
      //this.userService.nextQueryAfterCity = null;
      this.userService.getRanksCityWise(this.eventId, this.userDetails.cityId, this.userDetails.districtId, this.eventType);
      if (this.eventType == 'QUIZWHIZZ EXAM') {
        let myRankQuery = this.firestore.collection("user_quizwhizz_city_ranks").ref
          .where('status', '==', 'COMPLETED')
          .where('eventId', '==', this.eventId)
          .where('cityId', '==', this.userDetails.cityId)
          .where('userId', '==', this.userDetails.id);
        myRankQuery.get().then((eventRankDetail: any) => {
          this.myRankPostion = null;
          if (!eventRankDetail.empty) {
            eventRankDetail.forEach((data: any) => {
              this.myRankPostion = data.data();
            });
          }
        });
      } else {
        let myRankQuery = this.firestore.collection("user_event_city_ranks").ref
          .where('status', '==', 'COMPLETED')
          .where('eventId', '==', this.eventId)
          .where('cityId', '==', this.userDetails.cityId)
          .where('userId', '==', this.userDetails.id);
        myRankQuery.get().then((eventRankDetail: any) => {
          this.myRankPostion = null;
          if (!eventRankDetail.empty) {
            eventRankDetail.forEach((data: any) => {
              this.myRankPostion = data.data();
            });
          }
        });
      }

    }
    if (this.rankType == 'DISTRICT') {
      // this.userService.nextQueryAfterDistrict = null;
      this.userService.getRanksDistrictWise(this.eventId, this.userDetails.districtId, this.eventType);
      if (this.eventType == 'QUIZWHIZZ EXAM') {
        let myRankQuery = this.firestore.collection("user_quizwhizz_district_ranks").ref
          .where('status', '==', 'COMPLETED')
          .where('eventId', '==', this.eventId)
          .where('districtId', '==', this.userDetails.districtId)
          .where('userId', '==', this.userDetails.id);
        myRankQuery.get().then((eventRankDetail: any) => {
          this.myRankPostion = null;
          if (!eventRankDetail.empty) {
            eventRankDetail.forEach((data: any) => {
              this.myRankPostion = data.data();
            });
          }
        });
      } else {
        let myRankQuery = this.firestore.collection("user_event_district_ranks").ref
          .where('status', '==', 'COMPLETED')
          .where('eventId', '==', this.eventId)
          .where('districtId', '==', this.userDetails.districtId)
          .where('userId', '==', this.userDetails.id);
        myRankQuery.get().then((eventRankDetail: any) => {
          this.myRankPostion = null;
          if (!eventRankDetail.empty) {
            eventRankDetail.forEach((data: any) => {
              this.myRankPostion = data.data();
            });
          }
        });
      }
    }
    if (this.rankType == 'STATE') {
      // this.userService.nextQueryAfterState = null;
      this.userService.getRanksStateyWise(this.eventId, this.userDetails.stateId, this.eventType);
      if (this.eventType == 'QUIZWHIZZ EXAM') {
        let myRankQuery = this.firestore.collection("user_quizwhizz_state_ranks").ref
          .where('status', '==', 'COMPLETED')
          .where('eventId', '==', this.eventId)
          .where('stateId', '==', this.userDetails.stateId)
          .where('userId', '==', this.userDetails.id);
        myRankQuery.get().then((eventRankDetail: any) => {
          this.myRankPostion = null;
          if (!eventRankDetail.empty) {
            eventRankDetail.forEach((data: any) => {
              this.myRankPostion = data.data();
            });
          }
        });
      } else {
        let myRankQuery = this.firestore.collection("user_event_state_ranks").ref
          .where('status', '==', 'COMPLETED')
          .where('eventId', '==', this.eventId)
          .where('stateId', '==', this.userDetails.stateId)
          .where('userId', '==', this.userDetails.id);
        myRankQuery.get().then((eventRankDetail: any) => {
          this.myRankPostion = null;
          if (!eventRankDetail.empty) {
            eventRankDetail.forEach((data: any) => {
              this.myRankPostion = data.data();
            });
          }
        });
      }
    }
    if (this.rankType == 'COUNTRY') {
      //this.userService.nextQueryAfterCountry = null;
      this.userService.getRanksCountryWise(this.eventId, this.eventType);
      if (this.eventType == 'QUIZWHIZZ EXAM') {
        let myRankQuery = this.firestore.collection("user_quizwhizz_all_ranks").ref
          .where('status', '==', 'COMPLETED')
          .where('eventId', '==', this.eventId)
          .where('userId', '==', this.userDetails.id)
        myRankQuery.get().then((eventRankDetail: any) => {
          this.myRankPostion = null;
          if (!eventRankDetail.empty) {
            eventRankDetail.forEach((data: any) => {
              this.myRankPostion = data.data();
            });
          }
        });
      } else {
        let myRankQuery = this.firestore.collection("user_event_all_ranks").ref
          .where('status', '==', 'COMPLETED')
          .where('eventId', '==', this.eventId)
          .where('userId', '==', this.userDetails.id)
        myRankQuery.get().then((eventRankDetail: any) => {
          this.myRankPostion = null;
          if (!eventRankDetail.empty) {
            eventRankDetail.forEach((data: any) => {
              this.myRankPostion = data.data();
            });
          }
        });
      }
    }

    this.userService.userRanks.subscribe(record => {
      if (null != record && record.length > 0) {
        record.forEach(urecord => {
          this.rankRecords.push(urecord.data());
        });
        this.rankOnePostion = this.rankRecords.find(rank => rank.calculateRank == 1);
        this.rankTwoPostion = this.rankRecords.find(rank => rank.calculateRank == 2);
        this.rankThreewoPostion = this.rankRecords.find(rank => rank.calculateRank == 3);
      } else {
        this.rankRecords = [];
      }

    });

  }

  segmentChanged(event: any) {
    this.segmentValue = event.detail.value;
  }

  goBack() {
    this.navCtrl.back();
  }


  async findNext(event: any) {
    if (this.rankType == 'SCHOOL') {
      await this.userService.getRanksSchoolWise(this.eventId, this.userDetails.schoolId, this.eventType);
    }
    if (this.rankType == 'CITY') {
      await this.userService.getRanksCityWise(this.eventId, this.userDetails.cityId, this.userDetails.districtId, this.eventType);
    }
    if (this.rankType == 'DISTRICT') {
      await this.userService.getRanksDistrictWise(this.eventId, this.userDetails.districtId, this.eventType);
    }
    if (this.rankType == 'STATE') {
      await this.userService.getRanksStateyWise(this.eventId, this.userDetails.stateId, this.eventType);
    }
    if (this.rankType == 'COUNTRY') {
      await this.userService.getRanksCountryWise(this.eventId, this.eventType);

    }
    event.target.complete();
  }

}
