import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-types-of-user',
  templateUrl: './types-of-user.component.html',
  styleUrls: ['./types-of-user.component.scss'],
})
export class TypesOfUserComponent implements OnInit {
  segmentValue: string = "STUDENT";
  constructor(
    public modalController: ModalController,
  ) { }

  ngOnInit() {}

  onClickClose() {
    this.modalController.dismiss();
  }

  segmentChanged(event:any) {
    this.segmentValue = event.detail.value;
  }

}
