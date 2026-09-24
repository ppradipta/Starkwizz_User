import { Component, Input, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ModalController } from '@ionic/angular';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-event-description-modal',
  templateUrl: './event-description-modal.component.html',
  styleUrls: ['./event-description-modal.component.scss'],
})
export class EventDescriptionModalComponent implements OnInit {
  @Input() eventId: String='';
  eventDetails: any={} as any;
  constructor(
    public modalController: ModalController,
    private firestore: AngularFirestore,
    private loadingService: LoadingService
  ) { }

  ngOnInit() {
    this.getEventDetailsDescription();
  }

  onClickClose() {
    this.modalController.dismiss();
  }

  getEventDetailsDescription() {
    this.loadingService.presentLoading(2000);
    const query = this.firestore.collection('events').ref
      .where("id", "==", this.eventId);
    query.get().then((userevnt: any) => {
      if (!userevnt.empty) {
        userevnt.forEach((data:any) => {
          this.eventDetails = data.data();
        });
      }
    });
  }

}
