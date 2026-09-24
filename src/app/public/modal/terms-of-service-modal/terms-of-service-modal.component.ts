import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-terms-of-service-modal',
  templateUrl: './terms-of-service-modal.component.html',
  styleUrls: ['./terms-of-service-modal.component.scss'],
})
export class TermsOfServiceModalComponent implements OnInit {
  @Input() type={} as any;
  
  constructor(
    public modalController: ModalController,
  ) { }

  ngOnInit() {}

  onClickClose() {
    this.modalController.dismiss();
  }

  onClickOk(value:any) {
    this.modalController.dismiss(value);
  }

}
