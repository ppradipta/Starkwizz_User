import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatBottomSheet, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { ModalController } from '@ionic/angular';
import { DateUtilService } from '../common/util/date-util.service';
import { EventService } from '../services/event.service';
import { UserServiceService } from '../services/user-service.service';
import { UtilServiceService } from '../services/util-service.service';

@Component({
  selector: 'app-subject-setup-detail',
  templateUrl: './subject-setup-detail.component.html',
  styleUrls: ['./subject-setup-detail.component.scss'],
})
export class SubjectSetupDetailComponent implements OnInit {
  userDetails: any;
  selectedSubject: any;
  examParam: any;
  paramRule: any;
  examAppearedDetails: any[] = [];
  previousCompletedExam: any[] = [];
  selectedModules: any[] = [];
  erroMsg: string = '';

  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public detailsParam: any,
    public modalController: ModalController,
    private bottomSheet: MatBottomSheet,
    private util: UtilServiceService,
    private userService: UserServiceService,
    private eventService: EventService,
    private dateUtilService: DateUtilService,
    private firestore: AngularFirestore) {
    this.examParam = detailsParam.examParam;
    this.paramRule = detailsParam.paramRule;
    this.examAppearedDetails = detailsParam.examAppearedDetails;
    this.previousCompletedExam = this.examAppearedDetails.filter((exmApp: any) => exmApp.categoryId == this.paramRule.rule.when_complete && exmApp.status == 'COMPLETED');

  }

  ngOnInit() {
    this.getUserDetails();
    this.getSelectedSubject();


  }
  getUserDetails() {
    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
    });
  }

  getSelectedSubject() {
    this.eventService.getSelectedSubject().subscribe(res => {
      this.selectedSubject = res;
    });
  }

  createExam() {

    this.createEventForExam();

  }

  cancelExam() {
    this.selectedModules = [];
    this.previousCompletedExam.forEach(pce => {
      pce.isChecked = false;
    });
    this.bottomSheet.dismiss();
  }

  selectModuleForTest(exam: any) {
    this.erroMsg = '';
    let selectIndex = this.selectedModules.findIndex(sm => sm.id == exam.id);
    if (selectIndex != -1) {
      this.selectedModules.splice(selectIndex, 1)
      let pcIndex = this.previousCompletedExam.findIndex(pce => pce.id == exam.id);
      if (pcIndex != -1) {
        this.previousCompletedExam[pcIndex].isChecked = false;
      }
    } else {
      if (this.paramRule.rule.complete_type > this.selectedModules.length) {
        this.selectedModules.push(exam);
        let pcIndex = this.previousCompletedExam.findIndex(pce => pce.id == exam.id);
        if (pcIndex != -1) {
          this.previousCompletedExam[pcIndex].isChecked = true;
        }
      } else {
        let pcIndex = this.previousCompletedExam.findIndex(pce => pce.id == exam.id);
        if (pcIndex != -1) {
          this.previousCompletedExam[pcIndex].isChecked = false;
        }
        this.erroMsg = 'You can select maximum ' + this.paramRule.rule.complete_type + ' modules.';
      }
    }


  }

  createEventForExam() {
    let dynamoEvent = this.populateEventDetails();
    this.firestore.collection('user_dyanmo_exam').doc(dynamoEvent.id)
      .set(JSON.parse(JSON.stringify(dynamoEvent)), { merge: true }).then(result => {
        this.bottomSheet.dismiss(dynamoEvent);
        this.util.showToast('Exam Created Sucessfully!!', 'green', 'bottom');
      });
  }


  populateEventDetails() {
    let eventDetail: any = {};
    eventDetail.id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    eventDetail.eventCode = ('SKU-' + Math.random().toString(36).substring(2, 8)).toUpperCase();
    eventDetail.eventInfo = '';
    eventDetail.userEventId=eventDetail.id ;
    eventDetail.eventId=eventDetail.id ;
    eventDetail.boardName = this.userDetails.boardName;
    eventDetail.boardId = this.userDetails.boardId;
    eventDetail.className = this.userDetails.className;
    eventDetail.classId = this.userDetails.classId;
    eventDetail.subjectName = this.selectedSubject.displayName;
    eventDetail.subjectId = this.selectedSubject.id;
    let modules: any[] = [];
    let moduleIds: string[] = [];
    let eventNames: string[] = [];
    this.selectedModules.forEach(mod => {
      let singleModule = {
        id: mod.moduleId,
        displayName: mod.moduleName
      }
      eventNames.push(mod.moduleName);
      moduleIds.push(mod.moduleId);
      modules.push(singleModule);
    });
    eventDetail.eventName = eventNames;
    eventDetail.moduleIds = moduleIds;
    eventDetail.modules = modules;
    eventDetail.status = 'ACTIVE';
    eventDetail.category = this.examParam.displayName;
    eventDetail.categoryId = this.examParam.id;
    eventDetail.totalHour = this.paramRule.events_details.duration;
    eventDetail.perQuestionHour = this.paramRule.events_details.perQuestionHour;
    eventDetail.type = 'DYNAMO EXAM';
    eventDetail.typeId = 'dynamoexam';
    eventDetail.eventMarks = this.paramRule.events_details.eventMark;
    eventDetail.creationDate = this.dateUtilService.getCurrentDateWithYYYYMMDD();
    eventDetail.startTime = this.dateUtilService.getCurrentTimeWith12hrFormat();
    eventDetail.endTime = this.dateUtilService.getCurrentTimeWith12hrFormat();
    eventDetail.eventStartDate = eventDetail.creationDate;
    eventDetail.eventEndDate = this.dateUtilService.addDayToCurrentData(366);
    eventDetail.eventDate = eventDetail.creationDate;
    eventDetail.applicableType = 'SUBSCRIBTION';
    eventDetail.description = this.paramRule.description;
    eventDetail.questionPattern = this.paramRule.events_details.questionType;
    eventDetail.questionToAttemp = this.paramRule.events_details.allowToAttemp;
    eventDetail.isPassScoreApplicable = this.paramRule.events_details.isPassScoreApplicable;
    eventDetail.createdBy = 'USER';
    eventDetail.userId = this.userDetails.id;
    eventDetail.createdDetails = {
      id: this.userDetails.id,
      mobileNo: this.userDetails.mobileNo,
      imgUrl: this.userDetails.imageUrl,
      displayName: this.userDetails.firstName + " " + this.userDetails.lastName
    }
    eventDetail.token = this.userDetails.token;

    return eventDetail;
  }

}
