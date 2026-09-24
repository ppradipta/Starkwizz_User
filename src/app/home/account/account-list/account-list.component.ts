import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-account-list',
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.scss'],
})
export class AccountListComponent implements OnInit {

  constructor(
    private navCtrl: NavController,
  ) { }

  ngOnInit() {}

  goBack() {
    this.navCtrl.back();
  }
}