import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { IonModal, ModalController } from '@ionic/angular';
import { DateUtilService } from 'src/app/common/util/date-util.service';
import { UserDetails } from 'src/app/model/user';
import { EventService } from 'src/app/services/event.service';
import { UserServiceService } from 'src/app/services/user-service.service';

@Component({
  selector: 'app-co-scholastic',
  templateUrl: './co-scholastic.component.html',
  styleUrls: ['./co-scholastic.component.scss'],
})
export class CoScholasticComponent implements OnInit {
  @ViewChild(IonModal) eventInfoModal: IonModal = {} as IonModal;
  selectedEvent: any = {};
  currenMonth: string = '';
  selectedSubject: any;
  slideOpts = {
    slidesPerView: 1.15,
    spaceBetween: 20,
    speed: 400
  };
  eventsList: any[] = [];
  userDetails: UserDetails = {} as UserDetails;
  isEventInfoModalOpen: boolean = false;
  constructor(
    private modalController: ModalController,
    public firestore: AngularFirestore,
    private dateUtilService: DateUtilService,
    private userService: UserServiceService,
    private eventService: EventService,
  ) { }

  ngOnInit() {
    this.getSelectedSubject();
    this.currenMonth = this.dateUtilService.getMonth();
    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
    })
    this.getEvents();
  }


  async uploadeventVideos(event: any) {
    // const modal = await this.modalController.create({
    //   component: DanceCollectionModalComponent,
    //   cssClass: 'fullScreenModal',
    //   backdropDismiss: false,
    //   componentProps: { event: event },
    // });
    // await modal.present();

  }


  getEvents() {
    this.eventsList = [];
    this.firestore.collection("events", ref =>
      ref.where("boardId", "==", this.userDetails.boardId)
        .where("classId", "==", this.userDetails.classId)
        .where("subjectId", '==', this.selectedSubject.id)
        .where("eventCategory", "==", 'Co-Scholastic')).get().subscribe(data => {
          let events: any[] = [];
          data.forEach(res => {
            events.push(res.data());
          });
          if (events.length > 0) {
            this.eventsList = events.reduce(function (r, a) {
              r[a.category] = r[a.category] || [];
              r[a.category].push(a);
              return r;
            }, Object.create(null));
          }
        });
  }
  getSelectedSubject() {
    this.eventService.getSelectedSubject().subscribe(res => {
      this.selectedSubject = res;
    });
  }

  modalDismiss() {
    this.isEventInfoModalOpen = false;
    this.eventInfoModal.dismiss(null, 'cancel');
  }

  onClickEventInfo(key: any) {
    this.isEventInfoModalOpen = true;
    this.selectedEvent = this.eventsList[key]?.description
  }
}
