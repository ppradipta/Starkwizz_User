import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { HubEnquiry } from 'src/app/model/event';
import { UserDetails } from 'src/app/model/user';
import { EventService } from 'src/app/services/event.service';
import { UserServiceService } from 'src/app/services/user-service.service';
import { UtilServiceService } from 'src/app/services/util-service.service';

@Component({
  selector: 'app-send-enquiry-modal',
  templateUrl: './send-enquiry-modal.component.html',
  styleUrls: ['./send-enquiry-modal.component.scss'],
})
export class SendEnquiryModalComponent implements OnInit {
  @Input() enquiryType: string;
  // hubEnquiry: HubEnquiry = new HubEnquiry();
  hubDetls: any;
  userDetails: UserDetails = new UserDetails();

  constructor(
    public modalController: ModalController,
    public userService: UserServiceService,
    public eventService: EventService,
    private util: UtilServiceService,
  ) { }

  ngOnInit() {
    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
    });

    this.eventService.getHubDetails().subscribe((hub: any) => {
      this.hubDetls = hub;
    })
  }

  onClickCancel() {
    this.modalController.dismiss();
  }

  sendEnquiry() {
    if (this.enquiryType == 'HUB_ENQUIRY') {
      this.userService.setHubEnquiryToCollection(this.hubDetls, this.hubDetls?.email).then(() => {
        this.modalController.dismiss();
        this.util.showToast(('Hub Enquiry send Successfully !!!'), 'success', 'bottom');
      })
    } else if (this.enquiryType == 'SYLLABUS_ENQUIRY') {
      let address = this.userDetails.cityName + ", " + this.userDetails.districtName + ", " + this.userDetails.stateName;
      this.userService.setSyllabusEnquiryToCollection(this.userDetails, this.userDetails.emailId, address).then(() => {
        this.modalController.dismiss();
        this.util.showToast(('Syllabus Enquiry send Successfully !!!'), 'success', 'bottom');
      })
    }


  }

  close() {
    this.modalController.dismiss();
  }
}
