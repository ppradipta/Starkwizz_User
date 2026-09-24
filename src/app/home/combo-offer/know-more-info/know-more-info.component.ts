import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-know-more-info',
  templateUrl: './know-more-info.component.html',
  styleUrls: ['./know-more-info.component.scss'],
})
export class KnowMoreInfoComponent implements OnInit {
  offerType: string = 'DYNAMO';
  type: string = '';

  constructor(
    private navCtrl: NavController,
    private route: ActivatedRoute,
  ) {
    this.offerType = this.route.snapshot.queryParams['OFFERTYPE'];
    this.type = this.route.snapshot.queryParams['TYPES'];
  }

  ngOnInit() {
    if(this.type == 'SUBSCRIPTION') {
      this.offerType = 'DYNAMO';
    }
  }

  goBack() {
    this.navCtrl.back();
  }

  segmentChanged(event: any) {
    this.offerType = event.detail.value;
  }
}
