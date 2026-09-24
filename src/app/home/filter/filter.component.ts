import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NavController } from '@ionic/angular';
import { FirebaseCollection } from 'src/app/model/common/firebase-collection';
import { UserServiceService } from 'src/app/services/user-service.service';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
})
export class FilterComponent implements OnInit {
  segmentValue: string = "type";
  selectedType: string='';
  parameterTypes: any[] = [];
  parameters: any[] = [];
  constructor(
    private navCtrl: NavController,
    private userService: UserServiceService,
    private firestore: AngularFirestore
  ) {


  }

  ngOnInit() {
    this.getParamterTypes();
  }

  goBack() {
    this.navCtrl.back();
  }

  onSegmentValueChanged(event:any) {
    this.segmentValue = event.detail.value;
    this.segmentChanged();
  }

  segmentChanged() {
    this.parameters = [];
    this.firestore.collection(FirebaseCollection.PARAMETER, ref => ref.where("filterfor", "==", 'SHOWCASE').where("id", "==", this.segmentValue))
      .get().subscribe(data => {
        data.forEach(res => {
          this.parameters.push(...res.data() as any ['values']);
        })
        this.parameters = this.parameters.sort((a, b) => {
          if (a.displayName.toLowerCase() > b.displayName.toLowerCase())
            return 1;
          if (a.displayName.toLowerCase() < b.displayName.toLowerCase())
            return -1;
          return 0;
        });
      });
  }

  getParamterTypes() {
    this.parameterTypes = [];
    this.firestore.collection(FirebaseCollection.PARAMETER_TYPES, ref => ref.where("type", "==", 'SHOWCASE')).get().subscribe(data => {
      data.forEach(res => {
        this.parameterTypes.push(...res.data() as any['values']);
      })
      this.parameterTypes = this.parameterTypes.sort((a, b) => {
        if (a.displayName.toLowerCase() > b.displayName.toLowerCase())
          return 1;
        if (a.displayName.toLowerCase() < b.displayName.toLowerCase())
          return -1;
        return 0;
      });
      if (this.parameterTypes.length > 0) {
        this.segmentValue = this.parameterTypes[0].id;
      }
    });


  }

  applyFilter() {
    this.userService.setFilterContentType({ 'type': this.segmentValue, 'typevalue': this.selectedType });
    this.navCtrl.back();
  }

  checkForTypeValues(event:any, data:any) {
    this.selectedType = data.id;
  }

}
