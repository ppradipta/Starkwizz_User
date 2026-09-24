import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-add-subject-detail',
  templateUrl: './add-subject-detail.component.html',
  styleUrls: ['./add-subject-detail.component.scss'],
})
export class AddSubjectDetailComponent  implements OnInit {

   constructor(
      private navCtrl: NavController,
    ) { }
  
    ngOnInit() { }
  
    goBack() {
      this.navCtrl.back();
    }

}
