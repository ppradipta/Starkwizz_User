import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { FirebaseCollection } from 'src/app/model/common/firebase-collection';
import { FriendRequests, UserDetails } from 'src/app/model/user';
import { UserServiceService } from 'src/app/services/user-service.service';

@Component({
  selector: 'app-add-group-member',
  templateUrl: './add-group-member.component.html',
  styleUrls: ['./add-group-member.component.scss'],
})
export class AddGroupMemberComponent implements OnInit {
  friends: any[] = [];
  userDetails: UserDetails = new UserDetails();
  selectedFriends: any[] = [];
  selected: any;
  constructor(
    private router: Router,
    private firestore: AngularFirestore,
    private userService: UserServiceService
  ) { }

  ngOnInit() {
    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
    })
    this.getFriends();
  }

  onClickDetail() {
    this.router.navigate(['home/viewProfile']);
  }

  onClickCreateGroup() {
    this.userService.setGroupMemberDetails(this.selectedFriends);

    this.router.navigate(['home/groups/create-group']);
  }

  getFriends() {

    this.friends = [];
    const query = this.firestore.collection(FirebaseCollection.FRIEND_REQUESTS);
    query.ref.where('sendBy.id', '==', this.userDetails.id)
      .where('status', '==', 'ACCEPTED')
      .get().then((res: any) => {
        if (!res.empty) {
          res.forEach((data :any) => {
            let record: FriendRequests = data.data() as FriendRequests;
            this.friends.push(record);
          });
        }
        const query = this.firestore.collection(FirebaseCollection.FRIEND_REQUESTS);
        query.ref.where('recievedTo.id', '==', this.userDetails.id)
          .where('status', '==', 'ACCEPTED')
          .get().then((res: any) => {
            if (!res.empty) {
              res.forEach((data :any) => {
                let record: FriendRequests = data.data() as FriendRequests;
                this.friends.push(record);
              });
            }
          });
      });


  }

  slectMember(member:any,type:any) {
    if (member.isSelected) {
      member.isSelected = false;
      let index = this.selectedFriends.findIndex(fId => fId.id == member.id)
      if (index != -1) {
        this.selectedFriends.splice(index, 1)
      }
    }
    else {
      member.isSelected = true;
      if(type=='SENDBY'){
        let groupMember = {
          id: member.id,
          imageUrl: member.sendBy.imageUrl,
          displayName: member.sendBy.displayName,
          mobileNo: member.sendBy.mobileNo,
          stateName: member.sendBy.stateName,
          districtName: member.sendBy.districtName,
          cityName: member.sendBy.cityName,
          className: member.sendBy.className,
          boardName: member.sendBy.boardName
        }
        this.selectedFriends.push(groupMember);
      }

      if(type=='RECIEVEDTO'){
        let groupMember = {
          id: member.id,
          imageUrl: member.recievedTo.imageUrl,
          displayName: member.recievedTo.displayName,
          mobileNo: member.recievedTo.mobileNo,
          stateName: member.recievedTo.stateName,
          districtName: member.recievedTo.districtName,
          cityName: member.recievedTo.cityName,
          className: member.recievedTo.className,
          boardName: member.recievedTo.boardName
        }
        this.selectedFriends.push(groupMember);
      }
      
    }
  }
  onClickChat(friend:any){

  }

  onClickViewProfileDetails(friend:any){

  }
}
