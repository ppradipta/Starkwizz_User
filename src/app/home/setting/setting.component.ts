import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { LogoutModalComponent } from 'src/app/common/component/logout-modal/logout-modal.component';
import { UserDetails } from 'src/app/model/user';
import { AuthService } from 'src/app/services/auth.service';
import { UserServiceService } from 'src/app/services/user-service.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss'],
})
export class SettingComponent implements OnInit {
  userDetails: UserDetails= {} as UserDetails; 
  selectprofileAccess = [
    { id: 1, name: 'No One', value: 'No One', isActive: false },
    { id: 2, name: 'My Friends', value: 'My Friends', isActive: false },
    { id: 3, name: 'Everyone', value: 'Everyone', isActive: false }
  ]
  constructor(
    private userService: UserServiceService,
    private alertController: AlertController,
    private authService: AuthService,
    private router: Router,
    public modalController: ModalController,
  ) { }

  ngOnInit() {
    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
    });
  }


  async presentAlertConfirm(){
    const modal = await this.modalController.create({
      component: LogoutModalComponent,
      cssClass: 'logoutModal',
      backdropDismiss: false,
    });
    await modal.present();
  }

  // async presentAlertConfirm() {
  //   const alert = await this.alertController.create({
  //     message: 'Are you sure you want to Logout!!!',
  //     buttons: [{
  //       text: 'NO',
  //       role: 'NO',
  //       cssClass: 'secondary',
  //       handler: (blah) => {
  //         console.log('Confirm Cancel: blah');
  //       }
  //     }, {
  //       text: 'YES',
  //       handler: () => {
  //         this.authService.logout();
  //         this.router.navigate(['login']);
  //       }
  //     }]
  //   });
  //   await alert.present();
  // }

  onClickUpdate() {
    this.userService.updateUserDetailsToCollecton(this.userDetails);
    this.userService.setUserDetails(this.userDetails);
  }

  onClickType(type: any) {
    this.userDetails.profileAccess = type.value;
    this.selectprofileAccess.forEach(el => {
      if (type?.id === el?.id) {
        el.isActive = true;
        type.isActive = true;
      } else {
        el.isActive = false;
      }
      return el;
    });
  } 
}
