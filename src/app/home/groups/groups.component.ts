import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { DateUtilService } from 'src/app/common/util/date-util.service';
import { UserDetails } from 'src/app/model/user';
import { UserServiceService } from 'src/app/services/user-service.service';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss'],
})
export class GroupsComponent implements OnInit {

  userDetails: UserDetails = new UserDetails();
  groupList: any[] = [];

  constructor(
    private router: Router,
    private firestore: AngularFirestore,
    private userService: UserServiceService,
    private dateUtilService: DateUtilService
  ) { }

  ngOnInit() {
    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
    })
    this.getGroups();
    //Query  memebrs belongs to group 

  }

  onClickDetail(group:any) {
    this.userService.setGroupMemberDetails(group);
    this.router.navigate(['home/groups/group-detail']);
  }

  onClickCreate() {
    this.router.navigate(['home/groups/add-member']);
  }

  getGroups() {
    this.groupList = [];
    const query = this.firestore.collection("groups");
    query.ref.where("groupUsersId", "array-contains", this.userDetails.id)
      .get().then((res: any) => {
        if (!res.empty) {
          res.forEach((data:any) => {
            let record = data.data();
            this.groupList.push(record);
          });
        }
      });
  }

  onClickGroupChat(group:any) {
    this.userService.setGroupDetails(group);
    this.createChat(group);
    this.router.navigate(['home/groups/group-chat'], { queryParams: { chatId: group.id } });
  }


  async createChat(group:any) {
    this.firestore.collection('group_chats').doc(group.id).get().subscribe(chatroom => {
      if (!chatroom.exists) {
        const data = {
          id: group.id,
          createdAt: this.dateUtilService.getCurrentDateWithTime(),
          count: 0,
          messages: []
        };
        this.firestore.collection('group_chats').doc(group.id)
          .set(JSON.parse(JSON.stringify(data)), { merge: true });
      }
    });
  }
}
