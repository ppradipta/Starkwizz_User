import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-referral-code-modal',
  templateUrl: './referral-code-modal.component.html',
  styleUrls: ['./referral-code-modal.component.scss'],
})
export class ReferralCodeModalComponent implements OnInit {

  constructor(
    public modalController: ModalController,
  ) { }

  ngOnInit() {}

  onClickClose() {
    this.modalController.dismiss();
  }
}
