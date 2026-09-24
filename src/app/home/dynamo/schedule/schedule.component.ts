import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { CountdownConfig } from 'ngx-countdown';
import { DateUtilService } from 'src/app/common/util/date-util.service';
import { FirebaseCollection } from 'src/app/model/common/firebase-collection';
import { UserDetails, userEvents } from 'src/app/model/user';
import { UserServiceService } from 'src/app/services/user-service.service';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss'],
})
export class ScheduleComponent implements OnInit {
 // @ViewChild('cd', { static: false }) private countdown: CountdownComponent;

  rescheduledExams: userEvents[] = []
  userDetails: UserDetails = new UserDetails();

  timerConfig: CountdownConfig = {
    leftTime: 0,
    format: 'd:H:mm:ss',
  };

  constructor(
    private firestore: AngularFirestore,
    private dateUtilService: DateUtilService,
    private userService: UserServiceService
  ) { }

  ngOnInit() {
    this.userService.getUserDetails().subscribe((userData) => {
      if (userData) {
        this.userDetails = userData;
      }
    })
    this.getScheduledExams();
  }


  getScheduledExams() {
    const query = this.firestore.collection(FirebaseCollection.USER_EVENTS);
    query.ref
    .where("userId", "==" , this.userDetails.id)
    .where('classId', '==', this.userDetails.classId)
    .where('boardId', '==', this.userDetails.boardId)
    .where("status", "==" , 'RESCHEDULED')
      .get().then((exam: any) => {
        if (!exam.empty) {
          exam.forEach((data:any) => {
            let schduleExam = data.data();
            let result = this.dateUtilService.getTimeDifferenceInHoursWithCurrentTime(schduleExam.scheduledDate);
            if (result > 0) {
              schduleExam['schdulestatus'] = 'ACTIVE';
              let config = {
                leftTime: (result * 3600 * 1000),
                format: 'd:H:mm:ss',
              };
              schduleExam['timerConfig'] = config;
            } else {
              schduleExam['schdulestatus'] = 'EXPIRED';
            }

            this.rescheduledExams.push(schduleExam);

          });
        }
      })
  }
}
