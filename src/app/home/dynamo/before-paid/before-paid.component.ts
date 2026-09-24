import { KeyValue } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { IonModal, NavController } from '@ionic/angular';
import { DateUtilService } from 'src/app/common/util/date-util.service';
import { CommonService } from 'src/app/model/common/comman.service';
import { FirebaseCollection } from 'src/app/model/common/firebase-collection';
import { EventService } from 'src/app/services/event.service';
import { UserHelperService } from 'src/app/services/helper/user-helper.service';
import { UserServiceService } from 'src/app/services/user-service.service';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-before-paid',
  templateUrl: './before-paid.component.html',
  styleUrls: ['./before-paid.component.scss'],
})
export class BeforePaidComponent implements OnInit {
  @ViewChild(IonModal) dynamoInfoModal: IonModal = {} as IonModal;
  isDynamoInfoModalOpen: boolean = false;
  subjForSubscription: any[] = [];
  subjForSubscriptionMap = new Map<String, any[]>();
  userDetails: any = {};
  subsImages= [
    { id: 0, img: '/assets/images/dynamo/Biology.png', label: 'Biology' },
    { id: 1, img: '/assets/images/dynamo/Chemistry.png', label: 'Chemistry' },
    { id: 2, img: '/assets/images/dynamo/Computer.png', label: 'Computer' },
    { id: 6, img: '/assets/images/dynamo/EVS.png', label: 'EVS' },
    { id: 7, img: '/assets/images/dynamo/English Grammar.png', label: 'English Grammar' },
    { id: 8, img: '/assets/images/dynamo/English Literature.png', label: 'English Literature' },
    { id: 9, img: '/assets/images/dynamo/General Knowledge.png', label: 'General Knowledge' },
    { id: 10, img: '/assets/images/dynamo/geography.png', label: 'Geography' },
    { id: 11, img: '/assets/images/dynamo/Hindi Grammar.png', label: 'Hindi Grammar' },
    { id: 12, img: '/assets/images/dynamo/Hindi Literature.png', label: 'Hindi Literature' },
    { id: 13, img: '/assets/images/dynamo/History and Civics.png', label: 'History and Civics' },
    { id: 14, img: '/assets/images/dynamo/Mathematics.png', label: 'Mathematics' },
    { id: 15, img: '/assets/images/dynamo/Odia Grammar.png', label: 'Odia Grammar' },
    { id: 16, img: '/assets/images/dynamo/Odia Literature.png', label: 'Odia Literature' },
    { id: 17, img: '/assets/images/dynamo/physics.png', label: 'Physics' },
    { id: 18, img: '/assets/images/dynamo/Science.png', label: 'Science' },
    { id: 19, img: '/assets/images/dynamo/SST.png', label: 'Social Science' },
    { id: 20, img: '/assets/images/dynamo/SST.png', label: 'SST' },
    { id: 21, img: '/assets/images/dynamo/SST.png', label: 'Social Studies' },
  ]
  currentMonth: string = '';
  // subjectList: any[] = [];
  // viewType: string = 'PAYMENT_PENDING';
  // segmentValue: string = 'subjects';
  // notificationCount = 0;
  // isFreeTrial: boolean = false;
  // subscriptionType: string = '';
  // userSubscribedSujects: any[] = [];
  // userReferal: any = {};
  linkedPublishers: any[] = [];
  constructor(
    private navCtrl: NavController,
    private firestore: AngularFirestore,
    private userService: UserServiceService,
    private dateUtilService: DateUtilService,
    private userHelperService: UserHelperService,
    private commonService: CommonService,
    private eventService: EventService,
    private router: Router,
    private route: ActivatedRoute,
    private loading: LoadingService,
  ) { }

  ngOnInit() {

    this.currentMonth = this.dateUtilService.getMonth();
    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
    });
    // this.userService.getUserReferalType().subscribe((userRefl) => {
    //   this.userReferal = userRefl;
    // });

    // this.getViewType();
    this.getsubjectsForSubscription();
    this.getLinkPublisherForSubscribeSubjects();
  }

  getLinkPublisherForSubscribeSubjects() {
    this.eventService.getLinkedPublisherForUser(this.userDetails).subscribe(result => {
      this.linkedPublishers = result;
    });
  }

  ionViewDidEnter() {
    this.loading.present();

    // this.getViewType();
    this.getsubjectsForSubscription();
    this.getLinkPublisherForSubscribeSubjects();
  }

  doRefresh(event: any) {
    this.loading.present();

    // this.getViewType();
    this.getsubjectsForSubscription();
    this.getLinkPublisherForSubscribeSubjects();
    event.target.complete();
  }

  goBack() {
    this.router.navigate(['home/tabs/starkwizzHome']);
    // this.navCtrl.back();
  }

  // getViewType() {
  //   this.userService.getPageViewType().subscribe(view => {
  //     this.viewType = view;
  //   });
  //   this.userService.getSubscribedUserExamSubjects().subscribe(subjects => {
  //     this.userSubscribedSujects = subjects;
  //   });

  // }

  keyDescOrder = (a: KeyValue<string, any[]>, b: KeyValue<string, any[]>): number => {
    return a.key.localeCompare(b.key);
  }

  getsubjectsForSubscription() {
    const query = this.firestore.collection(FirebaseCollection.SUBJECTS);
    query.ref
      .where('classId', '==', this.userDetails.classId)
      .where('category', 'in', ['Scholastic'])
      .get().then((subjects: any) => {
        this.subjForSubscription = [];
        if (!subjects.empty) {
          subjects.forEach((data: any) => {
            let subject = data.data();
            this.subjForSubscription.push(subject);
          });
          this.userHelperService.setSubjectsList(this.subjForSubscription);
          this.subjForSubscriptionMap = this.subjForSubscription.reduce(function (r, a) {
            r[a.category] = r[a.category] || [];
            r[a.category].push(a);
            return r;
          }, Object.create(null));

        }
      });
  }

  // getSubjectsForEvents(events: any) {
  //   let subjects: any[] = []
  //   let uniqueSubjects = this.commonService.uniqueArray(events, 'subjectId')
  //   uniqueSubjects.forEach(subj => {
  //     const query = this.firestore.collection(FirebaseCollection.SUBJECTS);
  //     query.ref
  //       .where("id", "==", subj.subjectId)
  //       .get().then((subj: any) => {
  //         if (!subj.empty) {
  //           subj.forEach((data: any) => {
  //             subjects.push(data.data());
  //           });
  //           this.subjectList = subjects.reduce(function (r, a) {
  //             r[a.category] = r[a.category] || [];
  //             r[a.category].push(a);
  //             return r;
  //           }, Object.create(null));
  //         }
  //       })
  //   });

  // }

  onClickSubjectDetail(subject: any) {
    this.loading.present();
     // open publisher setup (user_prefrence_publisher)
    //subjectid, boardName, classId, userid,publisherid and name 
    this.getUserEventForSelectedSubject(subject);
    let linkSubjectIndex = this.linkedPublishers.findIndex(linPub => linPub.subjectId == subject.id);
    if (linkSubjectIndex != -1) {
      subject.publisherId = this.linkedPublishers[linkSubjectIndex].publisherId;
      subject.publisherName = this.linkedPublishers[linkSubjectIndex].publisherName;
    }

    // Navigate directly without asking user to pick publisher/modules
    if (subject.category == 'Co-Scholastic') {
      this.eventService.setSelectedSubject(subject);
      this.router.navigate(['home/dynamo/coScholastic']);
    } else if (subject.category == 'Quiz Whizz') {
      this.eventService.setQizWhizzSubject(subject);
      this.router.navigate(['home/quizwhizz']);
    } else {
      this.eventService.setSelectedSubject(subject);
      this.router.navigate(['home/dynamo/subjectDetail']);
    }
  }

  // getAllChaptersForSubject(subject: any) {

  // }

  getUserEventForSelectedSubject(subject: any) {
    if (subject.category == 'Quiz Whizz') {
      this.firestore.collection("user_quizwhizz_events", ref => ref
        .where('userId', '==', this.userDetails.id)
        .where('classId', '==', this.userDetails.classId)
        .where('boardId', '==', this.userDetails.boardId)
        .where("subjectId", "==", subject.id))
        .valueChanges().subscribe((requests: any[]) => {
          this.eventService.setQuizWhizzSubjectEvents(requests);
        });
    } else {
      this.firestore.collection("user_events", ref => ref
        .where('userId', '==', this.userDetails.id)
        .where('classId', '==', this.userDetails.classId)
        .where('boardId', '==', this.userDetails.boardId)
        .where("subjectId", "==", subject.id))
        .valueChanges().subscribe((requests: any[]) => {
          this.eventService.setEventsForSelectedSubject(requests);
        });

      this.firestore.collection("user_dyanmo_exam", ref => ref
        .where('userId', '==', this.userDetails.id)
        .where('classId', '==', this.userDetails.classId)
        .where('boardId', '==', this.userDetails.boardId)
        .where("subjectId", "==", subject.id))
        .valueChanges().subscribe((requests: any[]) => {
          this.eventService.setDynamoExamForSelectedSubject(requests);
        });
    }

  }

  // segmentChanged(event: any) {
  //   this.segmentValue = event.detail.value;
  // }

  // goToNotification() {
  //   this.router.navigate(['home/notification']);
  // }

  // getAllNotifications() {
  //   this.firestore.collection(FirebaseCollection.USER_NOTIFICATION, ref => ref
  //     .where('userId', '==', this.userDetails.id))
  //     .valueChanges().subscribe((requests: any[]) => {
  //       this.notificationCount = requests.filter(message => true && message.status == 'ACTIVE').length;
  //     });
  // }


  // onClickSubjectSubscription(type: any) {
  //   if (this.subjForSubscription.length > 0) {
  //     let subjectIndex = this.subjForSubscription.findIndex(sub => sub.id == type.id);
  //     if (subjectIndex != -1) {
  //       this.userHelperService.setSubjectsList(this.subjForSubscription);
  //       let subject = this.subjForSubscription[subjectIndex];
  //       this.bottomSheet.open(SubjectModuleListComponent, {
  //         data: {
  //           subject
  //         },
  //         panelClass: 'bottom-sheet'
  //       });

  //     }
  //   }
  // }


  knowMoreInfo() {
    this.isDynamoInfoModalOpen = true;
  }

  
  modalDismiss() {
    this.isDynamoInfoModalOpen = false;
    this.dynamoInfoModal.dismiss(null, 'cancel');
  }
}
