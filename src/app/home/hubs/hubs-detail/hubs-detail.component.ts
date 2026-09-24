import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';
import { ModalController, NavController } from '@ionic/angular';
import { SendEnquiryModalComponent } from 'src/app/common/component/send-enquiry-modal/send-enquiry-modal.component';
import { Hub } from 'src/app/model/hub/hub';
import { EventService } from 'src/app/services/event.service';
import { UserServiceService } from 'src/app/services/user-service.service';

@Component({
  selector: 'app-hubs-detail',
  templateUrl: './hubs-detail.component.html',
  styleUrls: ['./hubs-detail.component.scss'],
})
export class HubsDetailComponent implements OnInit {

  hubDetls: Hub = {} as Hub;

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private firestore: AngularFirestore,
    private modalController: ModalController,
    private route: ActivatedRoute,
    private userService: UserServiceService,
    private eventService: EventService,
    private call: CallNumber
  ) { }

  ngOnInit() {
    this.eventService.getHubDetails().subscribe((hub: any) => {
      this.hubDetls = hub;
    })

  }


  goBack() {
    this.navCtrl.back();
  }

  onClickOffer() {
    let sendModel = {
      hubid: this.hubDetls.id
    }
    let navigationExtras: NavigationExtras = { state: sendModel };
    this.router.navigate(['home/hubs/offers'], navigationExtras);
  }

  onClickNotice() {
    let sendModel = {
      hubid: this.hubDetls.id
    }
    let navigationExtras: NavigationExtras = { state: sendModel };
    this.router.navigate(['home/hubs/notice'], navigationExtras);
  }

  async onClickEnquiry() {
    const modal = await this.modalController.create({
      component: SendEnquiryModalComponent,
      cssClass: 'centerModal_2',
      backdropDismiss: false,
      componentProps: {},
    });
    await modal.present();
  }

  // fileChangeEvent(event: any) {
  //   let items = {
  //     type: 'HUB_DETAIL',
  //     imageUrl: event,
  //     userId:null,
  //     hubDetailId: this.hubDetls.id
  //   }
  //   this.userService.setImagesDataForUpload(items);
  //   this.router.navigate(['imageUpload']);
  // }
  callNumber() {
    let call = '+916371469050';
    this.call.callNumber(call, true)
      .then(res => console.log('Launched dialer!', res))
      .catch(err => console.log('Error launching dialer', err));
  }

  openInMap() {
    let destination = this.hubDetls.latitude + ',' + this.hubDetls.longitude;
    window.open(`https://maps.google.com/?q=${this.hubDetls.latitude},${this.hubDetls.longitude}`);
  }

  whatsAppChat() {
    window.open(`https://api.whatsapp.com/send?phone=${this.hubDetls.whatsappNumber}`);

  }
}
