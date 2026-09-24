import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { FirebaseCollection } from 'src/app/model/common/firebase-collection';
import { UserServiceService } from 'src/app/services/user-service.service';

@Component({
  selector: 'app-syllabus-detail',
  templateUrl: './syllabus-detail.component.html',
  styleUrls: ['./syllabus-detail.component.scss'],
})
export class SyllabusDetailComponent implements OnInit {
  userDetails: any = {};
  subjForChapter: any = [];
  operationType: string = '';
  subsDetails: any = {};
  constructor(
    private navCtrl: NavController,
    private router: Router,
    private firestore: AngularFirestore,
    private userService: UserServiceService,
    private activeRoute: ActivatedRoute,
  ) {
    this.operationType = this.activeRoute.snapshot.queryParams['OPERATION'];
  }

  ngOnInit() {
    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
    });

    this.userService.getSubjectDetails().subscribe((data) => {
      this.subsDetails = data;
    });

    this.getsubjectsForChapter();
  }

  goBack() {
    this.navCtrl.back();
  }

  getsubjectsForChapter() {
      const query = this.firestore.collection(FirebaseCollection.MODULES);
      query.ref
        .where('classId', '==', this.userDetails.classId)
        .where('subjectId', '==', this.subsDetails.id)
        .get().then((subjects: any) => {
          this.subjForChapter = [];
          if (!subjects.empty) {
            subjects.forEach((data: any) => {
              let subject = data.data();
              this.subjForChapter.push(subject);
            });
          }
        });
    }

}
