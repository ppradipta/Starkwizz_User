import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-description-modal',
  templateUrl: './description-modal.component.html',
  styleUrls: ['./description-modal.component.scss'],
})
export class DescriptionModalComponent implements OnInit {
  filterCategory: any;
  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public category: any,
    public modalController: ModalController,
    private firestore: AngularFirestore
  ) {
    const query = this.firestore.collection('parameter');
    query.ref
      .where("id", "==", 'scholastic')
      .get().then((eventTypes: any) => {
        if (!eventTypes.empty) {
          eventTypes.forEach((data:any) => {
            let record = data.data();
            if (record && null != record.values && category.filter.key) {
              this.filterCategory = record.values.find((rec:any) => rec.id == category.filter.key);
            }
          });

        }
      })
  }

  ngOnInit() { }

  onClickClose() {
    this.modalController.dismiss();
  }
}
