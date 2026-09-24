import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { FirebaseCollection } from 'src/app/model/common/firebase-collection';
import { HubOffers } from 'src/app/model/hub/hub';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.scss'],
})
export class OffersComponent implements OnInit {

  offers: HubOffers[] = [];

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private firestore: AngularFirestore
  ) { }

  ngOnInit() {

    let navigation: any = this.router.getCurrentNavigation() as any;
    let state: any = navigation.extras.state as any;
    if (state.hubid) {
      this.offers = [];
      this.getOffersForHub(state.hubid);
    }

  }

  getOffersForHub(hubId: string) {
    const query = this.firestore.collection(FirebaseCollection.HUB_OFFERS);
    query.ref.where('hubId', '==', hubId)
      .get().then((hub: any) => {
        if (!hub.empty) {
          hub.forEach((data: any) => {
            this.offers.push(data.data());
          });
        }
      });

  }

  goBack() {
    this.navCtrl.back();
  }
}
