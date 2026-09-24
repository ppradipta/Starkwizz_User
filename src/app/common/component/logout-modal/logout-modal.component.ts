import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-logout-modal',
  templateUrl: './logout-modal.component.html',
  styleUrls: ['./logout-modal.component.scss'],
})
export class LogoutModalComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router,
    public modalController: ModalController,
  ) { }

  ngOnInit() {}

  logout() {
    this.authService.logout();
    this.onClickClose();
    this.router.navigate(['login']);
  }

  onClickClose() {
    this.modalController.dismiss();
  }

}
