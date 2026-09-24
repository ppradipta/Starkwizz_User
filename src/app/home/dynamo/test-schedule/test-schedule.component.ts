import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { DateUtilService } from 'src/app/common/util/date-util.service';
import { FirebaseCollection } from 'src/app/model/common/firebase-collection';
import { UserDetails, userEvents } from 'src/app/model/user';
import { EventService } from 'src/app/services/event.service';
import { UserHelperService } from 'src/app/services/helper/user-helper.service';
import { UserServiceService } from 'src/app/services/user-service.service';
import { UtilServiceService } from 'src/app/services/util-service.service';

@Component({
  selector: 'app-test-schedule',
  templateUrl: './test-schedule.component.html',
  styleUrls: ['./test-schedule.component.scss'],
})
export class TestScheduleComponent implements OnInit {
  scheduledDate: string='';
  time: string= '';
  examDetails: any;
  userDetails: UserDetails = new UserDetails();
  scheduledData: userEvents[] = [];
  constructor(
    private eventService: EventService,
    private dateUtilService: DateUtilService,
    private utilityService: UtilServiceService,
    private userService: UserServiceService,
    private router: Router,
    private firestore: AngularFirestore,
    private userHelperService: UserHelperService
  ) { }

  ngOnInit() {
    this.userService.getUserDetails().subscribe((userData) => {
      if (userData) {
        this.userDetails = userData;
      }
    })
    this.eventService.getExamForSchedule().subscribe((data)=>{
      this.examDetails = data;
    });
    this.getScheduleData();
  }

  reSchedule(){
    let result  = this.dateUtilService.getDateDifferenceInDays(this.scheduledDate, this.examDetails.eventEndDate);
    if(result >=0){
      this.examDetails.userId =  this.userDetails.id
      this.examDetails.status = 'RESCHEDULED'
      this.examDetails.scheduledDate = this.dateUtilService.formatDate(this.scheduledDate) ;
      this.examDetails.scheduledTime = this.dateUtilService.formatTimeZone(this.time);
      this.examDetails.mobileNo = this.userDetails.mobileNo
      this.userService.setUserEventsToCollections(this.examDetails);

      let userNoti = this.userHelperService.populateUserNotificationForReschedule(this.userDetails);
      this.userService.setUserNotificationData(userNoti);

      this.utilityService.showToast(('Event Updated Successfully !!!'), 'success', 'bottom');
      this.eventService.setSegmentValue('schedule');
      this.router.navigate(['home/dynamo/beforePaid']);
    }else{
      this.utilityService.showErrorAlert((`please select schedule before ${this.examDetails.eventDate}`));
    }
  }


  getScheduleData() {
    const query = this.firestore.collection(FirebaseCollection.USER_EVENTS);
    query.ref
    .where("userId", "==" , this.userDetails.id)
    .where('classId', '==', this.userDetails.classId)
    .where('boardId', '==', this.userDetails.boardId)
    .where("status", "==" , 'RESCHEDULED')
      .get().then((schedule: any) => {
        if (!schedule.empty) {
          schedule.forEach((data:any) => {
            this.scheduledData.push(data.data());
          });
        }
      });
  }
}
