import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';
import { ModalController, NavController } from '@ionic/angular';
import { SendEnquiryModalComponent } from 'src/app/common/component/send-enquiry-modal/send-enquiry-modal.component';
import { UserServiceService } from 'src/app/services/user-service.service';

@Component({
  selector: 'app-add-syllabus',
  templateUrl: './add-syllabus.component.html',
  styleUrls: ['./add-syllabus.component.scss'],
})
export class AddSyllabusComponent implements OnInit {
  userDetails: any = {};

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private userService: UserServiceService,
    private modalController: ModalController,
    private call: CallNumber

  ) { }

  ngOnInit() {
    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
    });
  }

  goBack() {
    this.navCtrl.back();
  }

  async onClickEnquiry() {
    const modal = await this.modalController.create({
      component: SendEnquiryModalComponent,
      cssClass: 'centerModal_2',
      backdropDismiss: false,
      componentProps: {
        enquiryType: 'SYLLABUS_ENQUIRY',
      },
    });
    await modal.present();
  }

  callNumber() {
    let call = '+916371469050';
    this.call.callNumber(call, true)
      .then(res => console.log('Launched dialer!', res))
      .catch(err => console.log('Error launching dialer', err));
  }





}
