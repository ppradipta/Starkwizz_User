import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { UserServiceService } from 'src/app/services/user-service.service';
import { FirebaseCollection } from 'src/app/model/common/firebase-collection';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { UserHelperService } from 'src/app/services/helper/user-helper.service';

@Component({
  selector: 'app-my-syllabus',
  templateUrl: './my-syllabus.component.html',
  styleUrls: ['./my-syllabus.component.scss'],
})
export class MySyllabusComponent implements OnInit {
  userDetails: any = {};
  convertNameList: any = [
    { id: 2, displayName: 'Two' },
    { id: 3, displayName: 'Three' },
    { id: 4, displayName: 'Four' },
    { id: 5, displayName: 'Five' },
    { id: 6, displayName: 'Six' },
    { id: 7, displayName: 'Seven' },
    { id: 8, displayName: 'Eight' },
    { id: 9, displayName: 'Nine' },
    { id: 10, displayName: 'Ten' },
  ]

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private userService: UserServiceService,
  ) { }

  ngOnInit() {
    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
      this.userDetails.classNameWord = this.convertNameList.filter(clas => clas.id == this.userDetails.className)[0]?.displayName;
    });
  }

  confirmSyllabus() {
    this.router.navigate(['home/syllabus-list']);
  }

  modifySyllabus() {
    this.router.navigate(['home/add-subject']);
  }

  goBack() {
    this.navCtrl.back();
  }



}
