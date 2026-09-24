import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-cancel-exam-alert',
  templateUrl: './cancel-exam-alert.component.html',
  styleUrls: ['./cancel-exam-alert.component.scss'],
})
export class CancelExamAlertComponent implements OnInit {
@Input() type: string='';
@Input() status: string='';
  constructor(
    private modalController: ModalController
  ) { }

  ngOnInit() {}

  cancel(){
    this.modalController.dismiss();
  }
  finish(){
    this.modalController.dismiss('FINISH');
  }
}
