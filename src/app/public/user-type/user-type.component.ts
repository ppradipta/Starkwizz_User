import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, ToastController } from '@ionic/angular';
import { UserDetails } from 'src/app/model/user';
import { UserServiceService } from 'src/app/services/user-service.service';
import { TypesOfUserComponent } from '../modal/types-of-user/types-of-user.component';

@Component({
  selector: 'app-user-type',
  templateUrl: './user-type.component.html',
  styleUrls: ['./user-type.component.scss'],
})
export class UserTypeComponent implements OnInit {
  subscribeUserDetails: any;
  userDetails: UserDetails = new UserDetails();
  checkedBtn = false;
  selectedType = [
    { id: 1, name: 'Student', value: 'STUDENT', isActive: false },
    { id: 2, name: 'Parent', value: 'PARENT', isActive: false }
  ]
  constructor(
    private router: Router,
    private modalController: ModalController,
    private userService: UserServiceService,
    private toastController: ToastController,
  ) { }

  ngOnInit() {
    this.subscribeUserDetails = this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
    })
  }



  ionViewWillLeave() {
    this.subscribeUserDetails.unsubscribe();
  }

  onClickType(type: any) {
    this.userDetails.userType = type.value;
    this.selectedType.forEach(el => {
      if (type?.id === el?.id) {
        el.isActive = true;
        type.isActive = true;
      } else {
        el.isActive = false;
      }
      return el;
    });
    this.userService.setUserDetails(this.userDetails);
    this.checkedBtn = true;
  }

  onClickProceed() {
    this.router.navigate(['persolanInfo']);
  }

  async presentToast(msg: any) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
      color: 'dark',
      cssClass: 'customDarkToaster'
    });
    toast.present();
  }

  async clickKnowMore() {
    const modal = await this.modalController.create({
      component: TypesOfUserComponent,
      cssClass: 'centerModal_2',
      componentProps: {
      }
    });
    await modal.present();
  }

}
