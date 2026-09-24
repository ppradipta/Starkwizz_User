import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { FirebaseCollection } from 'src/app/model/common/firebase-collection';
import { UserServiceService } from 'src/app/services/user-service.service';

@Component({
  selector: 'app-syllabus-list',
  templateUrl: './syllabus-list.component.html',
  styleUrls: ['./syllabus-list.component.scss'],
})
export class SyllabusListComponent  implements OnInit {
  userDetails: any = {};
  subjForSubscription: any[] = [];
  subsImages = [
    { id: 0, img: '/assets/images/dynamo/Biology.png', label: 'Biology' },
    { id: 1, img: '/assets/images/dynamo/Chemistry.png', label: 'Chemistry' },
    { id: 2, img: '/assets/images/dynamo/Computer.png', label: 'Computer' },
    { id: 6, img: '/assets/images/dynamo/EVS.png', label: 'EVS' },
    { id: 7, img: '/assets/images/dynamo/English Grammar.png', label: 'English Grammar' },
    { id: 8, img: '/assets/images/dynamo/English Literature.png', label: 'English Literature' },
    { id: 9, img: '/assets/images/dynamo/General Knowledge.png', label: 'General Knowledge' },
    { id: 10, img: '/assets/images/dynamo/geography.png', label: 'Geography' },
    { id: 11, img: '/assets/images/dynamo/Hindi Grammar.png', label: 'Hindi Grammar' },
    { id: 12, img: '/assets/images/dynamo/Hindi Literature.png', label: 'Hindi Literature' },
    { id: 13, img: '/assets/images/dynamo/History and Civics.png', label: 'History and Civics' },
    { id: 14, img: '/assets/images/dynamo/Mathematics.png', label: 'Mathematics' },
    { id: 15, img: '/assets/images/dynamo/Odia Grammar.png', label: 'Odia Grammar' },
    { id: 16, img: '/assets/images/dynamo/Odia Literature.png', label: 'Odia Literature' },
    { id: 17, img: '/assets/images/dynamo/physics.png', label: 'Physics' },
    { id: 18, img: '/assets/images/dynamo/Science.png', label: 'Science' },
    { id: 19, img: '/assets/images/dynamo/SST.png', label: 'Social Science' },
    { id: 20, img: '/assets/images/dynamo/SST.png', label: 'SST' },
    { id: 21, img: '/assets/images/dynamo/SST.png', label: 'Social Studies' },
  ]
  constructor(
    private router: Router,
    private navCtrl: NavController,
    private firestore: AngularFirestore,
    private userService: UserServiceService,

  ) { }

  ngOnInit() {
    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
    });

    this.getsubjectsForSubscription();
  }

  detailSyllabus(record) {
    this.userService.setSubjectDetails(record);
    this.router.navigate(['home/detail-syllabus'])
  }

  goBack() {
    this.navCtrl.back();
  }

  getsubjectsForSubscription() {
    const query = this.firestore.collection(FirebaseCollection.SUBJECTS);
    query.ref
      .where('classId', '==', this.userDetails.classId)
      .where('category', 'in', ['Scholastic'])
      .get().then((subjects: any) => {
        this.subjForSubscription = [];
        if (!subjects.empty) {
          subjects.forEach((data: any) => {
            let subject = data.data();
            this.subjForSubscription.push(subject);
          });
        }
      });
  }

  

  mySyllabus() {
    this.router.navigate(['home/syllabus']);
  }

  addSyllabus() {
    this.router.navigate(['home/add-syllabus']);
  }

}
