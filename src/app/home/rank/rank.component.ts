import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FirebaseCollection } from 'src/app/model/common/firebase-collection';
import { UserDetails } from 'src/app/model/user';
import { UserServiceService } from 'src/app/services/user-service.service';

@Component({
  selector: 'app-rank',
  templateUrl: './rank.component.html',
  styleUrls: ['./rank.component.scss'],
})
export class RankComponent implements OnInit {
  slideOpts = {
    slidesPerView: 1.15,
    spaceBetween: 20,
    speed: 400
  };
  selectedSegment: string = 'COUNTRY';
  userDetails: UserDetails = new UserDetails();
  eventCategory = new Map<String, any[]>();
  selectedType: string='';
  constructor(
    private userService: UserServiceService,
    private firestore: AngularFirestore
  ) { }

  ngOnInit() {
    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
    });

    this.getUserEvents();
  }


  segmentTabChanged(event:any) {
    this.selectedSegment = event.detail.value;
  }

  getUserEvents() {
    const query = this.firestore.collection(FirebaseCollection.USER_EVENTS);
    query.ref.where("userId", "==", this.userDetails.id)
    .where('classId', '==', this.userDetails.classId)
    .where('boardId', '==', this.userDetails.boardId)
      .where("status", "==", 'COMPLETED')
      .get().then((event: any) => {
        let events:any[] = [];
        if (!event.empty) {
          event.forEach((data:any) => {
            events.push(data.data());
          });
          this.eventCategory = events.reduce(function (r, a) {
            r[a.category] = r[a.category] || [];
            r[a.category].push(a);
            return r;
          }, Object.create(null));
        }
      })
  }


}
