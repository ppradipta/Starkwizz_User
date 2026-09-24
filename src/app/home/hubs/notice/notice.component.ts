import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { FirebaseCollection } from 'src/app/model/common/firebase-collection';
import { HubNotices } from 'src/app/model/hub/hub';

@Component({
  selector: 'app-notice',
  templateUrl: './notice.component.html',
  styleUrls: ['./notice.component.scss'],
})
export class NoticeComponent implements OnInit {


  notices: HubNotices[] = [];

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private firestore: AngularFirestore
  ) { }

  ngOnInit() {
   let navigation:any= this.router.getCurrentNavigation() as any;
   let state:any = navigation.extras.state as any ;
    if (state.hubid) {
      this.notices = [];
      this.getNoticesForHub(state.hubid);
    }


  }

  getNoticesForHub(hubId: string) {
    const query = this.firestore.collection(FirebaseCollection.HUB_NOTICES);
    query.ref.where('hubId', '==', hubId)
      .get().then((hub: any) => {
        if (!hub.empty) {
          hub.forEach((data:any) => {
            this.notices.push(data.data());
          });
        }
      });

  }



  goBack() {
    this.navCtrl.back();
  }
}
