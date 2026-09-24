import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { UserDetails } from 'src/app/model/user';
import { UserServiceService } from 'src/app/services/user-service.service';

@Component({
  selector: 'app-my-class',
  templateUrl: './my-class.component.html',
  styleUrls: ['./my-class.component.scss'],
})
export class MyClassComponent implements OnInit {
  segmentValue: string = "videoClass";
  userDetails: UserDetails = new UserDetails();
  subjects: any[] = [];
  modules: any[] = [];
  filterBoardId: string = '';
  filterClassId: string = '';
  filterSubjectId: string = '';
  filterModuleId: string = '';
  constructor(
    private router: Router,
    private userService: UserServiceService,
    private firestore: AngularFirestore
  ) { }

  ngOnInit() {
    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
    });
    if (this.userDetails) {
      this.filterBoardId = this.userDetails.boardName;
      this.filterClassId = this.userDetails.className;
      this.getSubjects(this.userDetails.classId);
    }
  }

  segmentChanged(event: any) {
    this.segmentValue = event.detail.value;
  }

  onClickProceed() {
    this.router.navigate(['home/eclass/videoClass'], { queryParams: { boardId: this.filterBoardId, classId: this.filterClassId, subjectId: this.filterSubjectId, moduleId: this.filterModuleId } });
  }

  getSubjects(classId: any) {
    this.subjects = [];
    this.firestore.collection("subjects", ref => ref.where("classId", "==", classId)).get().subscribe(data => {
      data.forEach(res => {
        let subject: any = res.data();
        if (subject.category != "Quiz Whizz") {
          this.subjects.push(subject);
        }
      });
    });
  }

  selectSubjects(event: any) {
    this.modules = [];
    this.filterSubjectId = event.detail.value;
    this.firestore.collection("modules", ref => ref.where("subjectId", "==", event.detail.value)).get().subscribe(data => {
      data.forEach(res => {
        this.modules.push(res.data());
      });
    });
  }

  selectModul(event: any) {
    this.filterModuleId = event.detail.value;
  }

}
