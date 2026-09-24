import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { UtilServiceService } from 'src/app/services/util-service.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {
  email: string = '';
  constructor(private util: UtilServiceService, private authService: AuthService,
    public modalController: ModalController) { }

  ngOnInit() { }

  forgotPassword() {
    const emailfilter = /^[\w._-]+[+]?[\w._-]+@[\w.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailfilter.test(this.email)) {
      this.util.showToast(('Please enter valid email'), 'danger', 'bottom');
      return false;
    }
    return true;
    // this.authService.resetPassword(this.email).then((data) => {
    //   this.util.showToast(('Reset Password link is sent to your email'), 'dark', 'bottom');
    //   this.modalController.dismiss();
    // }, error => {
    //   console.log(error);
    //   this.util.showErrorAlert(('Something went wrong'));
    // }).catch(error => {
    //   console.log(error);
    //   this.util.showErrorAlert(('Something went wrong'));
    // });

  }

}
