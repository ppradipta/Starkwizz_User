import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';
import { AlertController, IonModal, ModalController, NavController } from '@ionic/angular';
import { DateUtilService } from 'src/app/common/util/date-util.service';
import { UserServiceService } from 'src/app/services/user-service.service';
import { UtilServiceService } from 'src/app/services/util-service.service';

@Component({
  selector: 'app-cancel-subscription',
  templateUrl: './cancel-subscription.component.html',
  styleUrls: ['./cancel-subscription.component.scss'],
})
export class CancelSubscriptionComponent implements OnInit {
  userDetails: any = {};
  reasonList: any = [
    { id: 1, displayName: 'Dissatisfaction' },
    { id: 2, displayName: 'Poor service' },
    { id: 3, displayName: 'Change in needs' },
    { id: 4, displayName: 'Technical issues' },
    { id: 5, displayName: 'Other' },
  ]
  reason: string = '';
  message: string = '';
    @ViewChild(IonModal) refundPolicyModal: IonModal = {} as IonModal;
    isRefundPolicyModalOpen: boolean = false;
  constructor(
    private router: Router,
    private firestore: AngularFirestore,
    private navCtrl: NavController,
    private userService: UserServiceService,
    private call: CallNumber,
    private util: UtilServiceService,
    private dateUtilService: DateUtilService,
    private alertController: AlertController,
  ) { }

  ngOnInit() {
    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
    });

    // let applicableDate = '2025-04-10'
    // let isBefore = this.dateUtilService.checkDateBefore(this.dateUtilService.getCurrentDateWithYYYYMMDD(), applicableDate);
    // if (isBefore) {
    //   this.presentAlertForAppUpdate();
    // }
  }

  goBack() {
    this.navCtrl.back();
  }

  confirm() {
    if (this.reason) {
      let subsCancel = {
        id: this.util.generateAlphaNumericId(),
        createDate: this.dateUtilService.getCurrentDateWithTime(),
        createDateUnix: this.dateUtilService.getCurrentEpochTime(),
        type: 'CANCEL_SUBSCRIPTION',
        status: 'ACTIVE',
        reason: this.reason,
        message: this.message,
        name: this.userDetails.displayName,
        userEmail: this.userDetails.emailId,
        mobileNo: this.userDetails.mobileNo,
        classId: this.userDetails.classId,
        boardName: this.userDetails.boardName,
        userId: this.userDetails.id,
        month: this.dateUtilService.getCurrentMonth(),
        year: this.dateUtilService.getCurrentYear(),
        userDetail: {
          id: this.userDetails.id,
          name: this.userDetails.displayName,
          email: this.userDetails.emailId,
          mobileNo: this.userDetails.mobileNo,
          classId: this.userDetails.classId,
          className: this.userDetails.className,
          boardId: this.userDetails.boardId,
          boardName: this.userDetails.boardName,
          dateOfBirth: this.userDetails.dateOfBirth,
          gender: this.userDetails.gender,
          districtId: this.userDetails.districtId,
          districtName: this.userDetails.districtName,
          schoolId: this.userDetails.schoolId,
          stateId: this.userDetails.stateId,
          stateName: this.userDetails.stateName,
        }
      }
      this.firestore.collection('cancel_subscription').doc(subsCancel.id)
        .set(JSON.parse(JSON.stringify(subsCancel)), { merge: true });
      this.util.showToast(('Subscription Cancel Successfully !!!'), 'success', 'bottom');
      this.goBack();
    } else {
      this.util.showToast(('Please Select Reason!!!'), 'danger', 'bottom');

    }
  }

  callNumber() {
    let call = '+916371469050';
    this.call.callNumber(call, true)
      .then(res => console.log('Launched dialer!', res))
      .catch(err => console.log('Error launching dialer', err));
  }

  async presentAlertForAppUpdate() {
    const alert = await this.alertController.create({
      message: 'You may cancel your subscription and claim a refund between <br>April 10, 2025, and April 12, 2025.',
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

  async onClickReturnPolicyInfo() {
    this.isRefundPolicyModalOpen = true;

  }


  modalDismiss() {
    this.isRefundPolicyModalOpen = false;
    this.refundPolicyModal.dismiss(null, 'cancel');
  }

}
