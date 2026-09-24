import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ModalController } from '@ionic/angular';
import { FirebaseCollection } from 'src/app/model/common/firebase-collection';
import { Event } from 'src/app/model/event';
import { UserDetails, userEvents } from 'src/app/model/user';
import { UserHelperService } from 'src/app/services/helper/user-helper.service';
import { UserServiceService } from 'src/app/services/user-service.service';
import { UtilServiceService } from 'src/app/services/util-service.service';
import { CancelExamAlertComponent } from '../cancel-exam-alert/cancel-exam-alert.component';
import { SubjectAppearComponent } from '../subject-appear/subject-appear.component';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
})
export class EventsComponent implements OnInit {
  segmentValue: string = "upcoming";
  eventDtls: Event[] = [];
  completedEvents: userEvents[] = [];
  userSubDetails: any = [] = [];
  userDetails: UserDetails = new UserDetails();  
  constructor(
    private firestore: AngularFirestore,
    private userService: UserServiceService,
    private util: UtilServiceService,
    private userHelperService: UserHelperService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.userService.getUserDetails().subscribe((userData) => {
      if (userData) {
        this.userDetails = userData;
      }
    })
  }

  ionViewDidEnter() {
    this.getUserSubscriptionData();
    this.getCompletedEvents();
  }


  segmentChanged(event:any) {
    this.segmentValue = event.detail.value;
    if (this.segmentValue == 'completed') {
      // this.getCompletedEvents();
    }
    else if (this.segmentValue == 'upcoming') {
      this.getUserSubscriptionData()
    }
  }

  getUserSubscriptionData() {
    const query = this.firestore.collection(FirebaseCollection.USER_SUBSCRIPTION);
    query.ref
      .where("userId", "==", this.userDetails.id)
      .get().then((hub: any) => {
        if (!hub.empty) {
          hub.forEach((data:any) => {
            this.userSubDetails.push(data.data());
            this.userSubDetails.forEach((subjDetails:any) => {
              this.getActiveEventData(subjDetails);
            });
          });
        }
      });
  }

  getActiveEventData(userSubDetails:any) {
    const query = this.firestore.collection("events", ref => ref
      .where("type", "==", 'EVENT')
      .where("classId", "==", userSubDetails.classId)
      .where("boardId", '==', this.userDetails.boardId));
    query.valueChanges().subscribe((data:any) => {
      this.eventDtls = [] = [];
      let userEventData: Event[] = [];
      data.forEach((res: any) => {
        userEventData.push(res);
      });
      userSubDetails.subject.forEach((userSub:any) => {
        let result = userEventData.filter(evnt => evnt.subjectId == userSub.subjectId);
        if (result.length > 0) {
          if (this.completedEvents.length == 0) {
            this.eventDtls = result;
          }
          this.completedEvents.forEach(res => {
            let data = result.filter(completeEvnt => completeEvnt.id != res.eventId);
            if (data) {
              this.eventDtls = data;
            }
          });
        }
      });
    });
  }

  onClickAppear(event:any) {
    if (event.questions.length > 0) {
      this.getUserEventData(event);
    } else {
      this.util.showToast(('No Questions for this test'), 'danger', 'bottom');
    }
  }

  getUserEventData(event:any) {
    this.firestore.collection("user_events", ref => ref
      .where("eventId", "==", event.id)
      .where('classId', '==', this.userDetails.classId)
      .where('boardId', '==', this.userDetails.boardId))
      .get().subscribe(data => {
        if (!data.empty) {
          data.forEach((res: any) => {
            let userEvnt = res.data();
            if (userEvnt.status == 'COMPLETED') {
              this.util.showToast(('Already appeared for this EVENT'), 'danger', 'bottom')
            } else {
              this.cancelEventAlert(event, res.id, userEvnt.status);
              // this.updateUserEvent(event, res.id);
            }
          });
        } else {
          this.createUserEvent(event);
        }
      });
  }

  async createUserEvent(eventView:any) {
    //set data to userEvent
    let quesData = this.userHelperService.populateUserEventData(null, eventView, this.userDetails, 'STARTED', 'EVENT', '');
    this.userService.setUserEventsToCollections(quesData)
    const modal = await this.modalController.create({
      component: SubjectAppearComponent,
      cssClass: 'fullScreenModal',
      componentProps: {
        event: eventView,
        userEventId: quesData.id
      }
    });
    await modal.present();
  }


  async updateUserEvent(userEventData:any, id:any) {
    const modal = await this.modalController.create({
      component: SubjectAppearComponent,
      cssClass: 'fullScreenModal',
      componentProps: {
        event: userEventData,
        userEventId: id
      }
    });
    await modal.present();
  }

  getCompletedEvents() {
    this.firestore.collection(FirebaseCollection.USER_EVENTS, ref => ref
      .where('userId', '==', this.userDetails.id)
      .where('classId', '==', this.userDetails.classId)
      .where('boardId', '==', this.userDetails.boardId)
      .where('type', '==', "EVENT")
      .where('status', '==', "COMPLETED")).valueChanges().subscribe((events: any[]) => {
        this.completedEvents = events;
      });
  }

  async cancelEventAlert(event:any, id:any, status:any) {
    const modal = await this.modalController.create({
      component: CancelExamAlertComponent,
      backdropDismiss: true,
      componentProps: {
        type: 'EVENT',
        status: status
      },
      cssClass: 'examAlertModal'
    })

    await modal.present();
    await modal.onDidDismiss().then(res => {
      if (res.data) {
        this.updateUserEvent(event, id);
      }
    })
  }
}
