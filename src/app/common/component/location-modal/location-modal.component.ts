import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-location-modal',
  templateUrl: './location-modal.component.html',
  styleUrls: ['./location-modal.component.scss'],
})
export class LocationModalComponent implements OnInit {

  constructor(
    public modalController: ModalController,
  ) { }

  ngOnInit() {}

  onClickClose() {
    this.modalController.dismiss();
  }
}
