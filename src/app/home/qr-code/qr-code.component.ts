import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { UserServiceService } from 'src/app/services/user-service.service';

@Component({
  selector: 'app-qr-code',
  templateUrl: './qr-code.component.html',
  styleUrls: ['./qr-code.component.scss'],
})
export class QrCodeComponent implements OnInit {
  userDetails: any = {};

  constructor(
    private navCtrl: NavController,
    private userService: UserServiceService,
  ) {}

  ngOnInit() {
    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
    });
  }

  goBack() {
    this.navCtrl.back();
  }
}

