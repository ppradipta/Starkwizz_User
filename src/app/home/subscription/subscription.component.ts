import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { DateUtilService } from 'src/app/common/util/date-util.service';
import { FirebaseCollection } from 'src/app/model/common/firebase-collection';
import { UserDetails } from 'src/app/model/user';
import { UserHelperService } from 'src/app/services/helper/user-helper.service';
import { UserServiceService } from 'src/app/services/user-service.service';
import { SubjectModuleListComponent } from '../dynamo/subject-module-list/subject-module-list.component';

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss'],
})
export class SubscriptionComponent implements OnInit {
  subjectList: any[] = [];
  scholasticsLists: any[] = [];
  coScholasticsLists: any[] = [];
  subscribedSubjects: any[] = [];
  subscribeUserDetails: any;
  userDetails: UserDetails = new UserDetails();
  currentMonth: string='';
  newSubj: any[] = [];
  constructor(
    private firestore: AngularFirestore,
    private userHelperService: UserHelperService,
    private userService: UserServiceService,
    private dateUtilService: DateUtilService,
    private bottomSheet: MatBottomSheet
  ) { }

  ngOnInit() {
    this.currentMonth = this.dateUtilService.getMonth();
    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
    });
    this.getSubjectData();
    this.getUserSubcribeSubjects();
    this.userHelperService.getSubjectsList().subscribe(subjts => {
      if (null != subjts) {
        this.subjectList = subjts;
      }
    });
  }

  checkSubject(inputsubject:any) {
    this.userHelperService.setSubjectsList(this.subjectList);
    let subject = this.subjectList.find(sub => sub.id == inputsubject.id);
    this.bottomSheet.open(SubjectModuleListComponent, {
      data: {
        subject
      },
      panelClass: 'bottom-sheet'
    });

    // this.bottomSheet._openedBottomSheetRef.afterDismissed().subscribe((data: any) => {

    // });
  }

  getSubjectData() {
    if (this.userDetails.classId) {
      const query = this.firestore.collection(FirebaseCollection.SUBJECTS);
      query.ref
        .where('classId', '==', this.userDetails.classId)
        .where('boardId', '==', this.userDetails.boardId)
        .where('applicableType', '==', 'SUBSCRIBTION')
        .where('category', '==', 'Scholastic')
        .get().then((subjects: any) => {
          this.subjectList = [];
          if (!subjects.empty) {
            subjects.forEach((data:any) => {
              let sub = data.data();
              sub.isChecked = false;
              this.subjectList.push(sub);
            });
          }
        })
    }
  }

  getUserSubcribeSubjects() {
    const query = this.firestore.collection(FirebaseCollection.USER_SUBSCRIPTION);
    query.ref
      .where('userId', '==', this.userDetails.id)
      .get().then((subj: any) => {
        if (!subj.empty) {
          subj.forEach((data:any) => {
            let result = data.data();
            result.subject.forEach((element:any) => {
              this.subscribedSubjects.push(element.subjectId)
              let subjIndex = this.subjectList.findIndex(sub => sub.id == element.subjectId);
              if (subjIndex != -1) {
                this.subjectList.splice(subjIndex, 1);
              }
            });
          });
        }
      });
  }

}
