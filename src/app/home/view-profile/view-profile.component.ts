import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { DateUtilService } from 'src/app/common/util/date-util.service';
import { UserServiceService } from 'src/app/services/user-service.service';

@Component({
  selector: 'app-view-profile',
  templateUrl: './view-profile.component.html',
  styleUrls: ['./view-profile.component.scss'],
})
export class ViewProfileComponent implements OnInit {

  profile: any;
  profileType: string='';
  constructor(
    private navCtrl: NavController,
    private router: Router,
    private userService: UserServiceService,
    private activeRoute: ActivatedRoute,
    private firestore: AngularFirestore,
    private dateUtilService: DateUtilService
  ) { }

  ngOnInit() {
    this.profileType = this.activeRoute.snapshot.queryParams['profileType'];
    this.userService.getProfileDetails().subscribe(userprofile => {
      this.profile = userprofile;
    });

  }

  goBack() {
    this.navCtrl.back();
  }

  onClickChat(friend:any, type:any) {
    if ('RECIEVEDTO' == type || 'SENDBY' == type) {
      this.userService.setProfileDetails(friend);
      this.createChat(friend);
      this.router.navigate(['home/friends/chat'], { queryParams: { chatId: friend.id, profileType: this.profileType } });
    }
    if('GROUP'==type){
      //Need to validate is an friend or not if not than need to hv msg 
      this.userService.setProfileDetails(friend);
      this.createChat(friend);
      this.router.navigate(['home/friends/chat'], { queryParams: { chatId: friend.id, profileType: this.profileType } });
    }

  }

  async createChat(friend:any) {
    this.firestore.collection('chats').doc(friend.id).get().subscribe(chatroom => {
      if (!chatroom.exists) {
        const data = {
          id: friend.id,
          createdAt: this.dateUtilService.getCurrentDateWithTime(),
          count: 0,
          messages: []
        };
        this.firestore.collection('chats').doc(friend.id)
          .set(JSON.parse(JSON.stringify(data)), { merge: true });
      }
    });
  }

}
