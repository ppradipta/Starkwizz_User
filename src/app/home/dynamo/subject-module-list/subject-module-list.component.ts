import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheet } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { EventService } from 'src/app/services/event.service';
import { UserHelperService } from 'src/app/services/helper/user-helper.service';
import { LoadingService } from 'src/app/services/loading.service';
import { UserServiceService } from 'src/app/services/user-service.service';
import { UtilServiceService } from 'src/app/services/util-service.service';
@Component({
  selector: 'app-subject-module-list',
  templateUrl: './subject-module-list.component.html',
  styleUrls: ['./subject-module-list.component.scss'],
})
export class SubjectModuleListComponent implements OnInit {
  moduleList: any[] = [];
  subject: any;
  subjects: any[] = [];
  type: string;
  userDetails: any = {};
  publishers: any[] = [];
  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    public modalController: ModalController,
    private bottomSheet: MatBottomSheet,
    private userHelperService: UserHelperService,
    private userService: UserServiceService,
    private utilService: UtilServiceService,
    private eventService: EventService,
    private router: Router,
    private firestore: AngularFirestore,
    private loading: LoadingService,
  ) {

    this.subject = data.subject;
    console.log('this.subject: ', this.subject);
    this.type = data.type;
    console.log('this.type: ', this.type);
    // const query = this.firestore.collection('modules');
    // query.ref
    //   .where("subjectId", "==", this.subject.id)
    //   .get().then((modules: any) => {
    //     this.moduleList = [];
    //     if (!modules.empty) {
    //       modules.forEach((data:any) => {
    //         let record = data.data();
    //         this.moduleList.push(record);
    //       });

    //     }
    //   })





  }

  ngOnInit() {
    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
      console.log('this.userDetails: ', this.userDetails);
      if (this.userDetails.userLinkType == 'SCHOOL_SPECIFICE') {
        this.getModulesForLinkedSchool();
      }
    });
    this.userHelperService.getSubjectsList().subscribe(subject => {
      this.subjects = subject;
      console.log('this.subjects: ', this.subjects);
    });

    const query = this.firestore.collection('book_publishers');
    query.ref
      .where("className", "==", this.userDetails.className)
      .where("board", "==", this.userDetails.boardName)
      .get().then((publisher: any) => {
        this.publishers = [];
        console.log('this.publishers: ', this.publishers);
        if (!publisher.empty) {
          publisher.forEach((data: any) => {
            let record = data.data();
            record.isExpand = false;
            this.publishers.push(record);
          });

        }
      })

  }

  acceptForPublisher(publisher: any) {
    this.loading.present();
    //This old code for subject setup
    let sindex = this.subjects.findIndex(subj => subj.id == this.subject.id);
    if (sindex != -1) {
      this.subjects[sindex].isChecked = true;
    }
    this.userHelperService.setSubjectsList(this.subjects);
    // this will be new code for publisher setup
    // open publisher setup (user_prefrence_publisher)
    //subjectid, boardName, classId, userid,publisherid and name 
    let userPublisherPrefrence = {
      id: this.utilService.generateAlphaNumericId(),
      classId: this.userDetails.classId,
      className: this.userDetails.className,
      boardName: this.userDetails.boardName,
      userId: this.userDetails.id,
      subjectId: this.subject.id,
      subjectName: this.subject.displayName,
      publisherId: publisher.publisherCode,
      publisherName: publisher.displayName
    }
    this.eventService.setUserPublisherPrefrenceToCollections(userPublisherPrefrence).then(result => {
      this.bottomSheet.dismiss(publisher);
      this.utilService.showToast('Publisher sucessfully selected for subject ', 'success', 'bottom');
    });

  }

  close() {
    this.bottomSheet.dismiss();
  }

  removeFromOption() {
    let sindex = this.subjects.findIndex(subj => subj.id == this.subject.id);
    if (sindex != -1) {
      this.subjects[sindex].isChecked = false;
    }
    this.userHelperService.setSubjectsList(this.subjects);
    this.bottomSheet.dismiss();
  }

  onSelectPublisher(pub: any) {
    this.publishers.filter(publisher => publisher.id != pub.id).forEach(publi => {
      publi.isExpand = false;
    })
    pub.isExpand = pub.isExpand ? false : true;
    let pubIndex = this.publishers.findIndex(pub => pub.id == pub.id);
    if (pubIndex != -1) {
      this.publishers[pubIndex] = pub;
    }

    if (pub.isExpand) {
      const query = this.firestore.collection('modules');
      query.ref
        .where("subjectId", "==", this.subject.id)
        .where("publisherId", "==", pub.id)
        .get().then((modules: any) => {
          this.moduleList = [];
          if (!modules.empty) {
            modules.forEach((data: any) => {
              let record = data.data();
              this.moduleList.push(record);
            });

          }
        })

    }
  }

  getModulesForLinkedSchool() {
    const query = this.firestore.collection('modules');
    query.ref
      .where("subjectId", "==", this.subject.id)
      .where("linkvalues", "array-contains", this.userDetails.schoolId)
      .get().then((modules: any) => {
        this.moduleList = [];
        if (!modules.empty) {
          modules.forEach((data: any) => {
            let record = data.data();
            this.moduleList.push(record);
          });

        }
      })
  }


  proceedToExam() {
    this.bottomSheet.dismiss();
  }

}
