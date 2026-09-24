import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NavigationExtras, Router } from '@angular/router';
import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';
import { AlertController, ModalController, NavController } from '@ionic/angular';
import { SendEnquiryModalComponent } from 'src/app/common/component/send-enquiry-modal/send-enquiry-modal.component';
import { DateUtilService } from 'src/app/common/util/date-util.service';
import { FirebaseCollection } from 'src/app/model/common/firebase-collection';
import { Hub } from 'src/app/model/hub/hub';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-hubs',
  templateUrl: './hubs.component.html',
  styleUrls: ['./hubs.component.scss'],
})
export class HubsComponent implements OnInit {
  userDetails: any = {};
  hubList: Hub[] = [];
  constructor(
    private navCtrl: NavController,
    private router: Router,
    private firestore: AngularFirestore,
    private modalController: ModalController,
    private eventService: EventService,
    private call: CallNumber,
    private dateUtilService: DateUtilService,
    private alertController: AlertController,

  ) { }

  ngOnInit() {
    // let applicableDate = '2025-04-10';
    // let isBefore = this.dateUtilService.checkDateBefore(this.dateUtilService.getCurrentDateWithYYYYMMDD(), applicableDate);
    // if (isBefore) {
    //   this.presentAlertForAppUpdate();
    // };

    this.getHubDetails();

  }

  goBack() {
    this.navCtrl.back();
  }

  async presentAlertForAppUpdate() {
    const alert = await this.alertController.create({
      message: 'The current service is not available in your local area.<br>This will be available shortly.<br>Thank you for your patience!',
      cssClass: 'customAlert popAlert',
      header: "Hub Alert",
      backdropDismiss: false,
      buttons: [{
        text: 'Proceed',
        handler: () => {
          console.log('Confirm YES: Yeahh');
          this.router.navigate(['/home/tabs/starkwizzHome']);
        }
      }]
    });
    await alert.present();
  }

  getHubDetails() {
    this.firestore.collection(FirebaseCollection.HUB, ref => ref
      .where('status', '==', 'APPROVED'))
      .valueChanges().subscribe((records: any[]) => {
        this.hubList = records;
      });

  }

  onClickOffer(hub: Hub) {
    let sendModel = {
      hubid: hub.id
    }
    let navigationExtras: NavigationExtras = { state: sendModel };
    this.router.navigate(['home/hubs/offers'], navigationExtras);
  }

  onClickOnNotice(hub: Hub) {
    let sendModel = {
      hubid: hub.id
    }
    let navigationExtras: NavigationExtras = { state: sendModel };
    this.router.navigate(['home/hubs/notice'], navigationExtras);
  }

  onClickHubsDetail(hub: any) {
    this.eventService.setHubDetails(hub);
    this.router.navigate(['home/hubs/hubsDetail', { hubId: hub.id }]);
  }

  async onClickEnquiry(hub) {
    this.eventService.setHubDetails(hub);
    const modal = await this.modalController.create({
      component: SendEnquiryModalComponent,
      cssClass: 'centerModal_2',
      backdropDismiss: false,
      componentProps: {
        enquiryType: 'HUB_ENQUIRY',
      },
    });
    await modal.present();
  }

  callNumber(hub: any) {
    console.log('call', hub.phoneNumber);
    this.call.callNumber(hub.phoneNumber, true)
      .then(res => console.log('Launched dialer!', res))
      .catch(err => console.log('Error launching dialer', err));
  }

  searchHubs(event: any) {
    let text = event.target.value;
    if (null != text && text.length > 2) {
      this.firestore.collection(FirebaseCollection.HUB, ref => ref.where("keywords", "array-contains", text.toLowerCase())
        .where('status', '==', 'APPROVED').limit(20)).get().subscribe(data => {
          data.forEach((res: any) => {
            this.hubList = [];
            if (res.exists) {
              this.hubList.push(res.data());
            }
          });
        });
    }

  }

  cancelSearch() {
    this.getHubDetails();
  }

}
