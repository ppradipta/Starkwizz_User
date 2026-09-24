import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { DateUtilService } from 'src/app/common/util/date-util.service';
import { FirebaseCollection } from 'src/app/model/common/firebase-collection';
import { FriendRequests, UserDetails } from 'src/app/model/user';
import { UserServiceService } from 'src/app/services/user-service.service';
import { UtilServiceService } from 'src/app/services/util-service.service';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss'],
})
export class FriendsComponent implements OnInit {
  segmentValue: string = "myFriend";
  userDetails: UserDetails = new UserDetails();
  friends: any[] = [];
  recievedFriendRequests: FriendRequests[] = [];
  sentFriendRequests: FriendRequests[] = [];
  myFriends: FriendRequests[] = [];
  constructor(
    private navCtrl: NavController,
    private router: Router,
    private userService: UserServiceService,
    private firestore: AngularFirestore,
    public alertCtrl: AlertController,
    private util: UtilServiceService,
    private dateUtilService: DateUtilService
  ) { }

  ngOnInit() {
    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
    });
    this.myFriends = [];
    this.getAllAcceptedFriends();

  }

  segmentChanged(event: any) {
    this.segmentValue = event.detail.value;
    if (this.segmentValue == 'myFriend') {
      this.myFriends = [];
      this.getAllAcceptedFriends();
    }
    if (this.segmentValue == 'all') {
      this.getAllFriends();
    }
    else if (this.segmentValue == 'friendRequests') {
      this.getRecievedFriendRequests();
    }
    else if (this.segmentValue == 'sendRequests') {
      this.getSentFriendRequests();
    }
  }

  goBack() {
    this.navCtrl.back();
  }

  onClickDetail() {

  }

  onClickViewProfileDetails(friend: any, profileType: any) {
    this.userService.setProfileDetails(friend);
    this.router.navigate(['home/viewProfile'], { queryParams: { profileType: profileType } });
  }

  getAllFriends() {
    this.friends = [];
    const query = this.firestore.collection('users');
    query.ref.where("userType", "!=", 'PARENT').where("classId", "==", this.userDetails.classId).where("boardId", "==", this.userDetails.boardId).get().then((res: any) => {
      res.forEach((element: any) => {
        if (this.userDetails.id != element.id) {
          this.friends.push(element.data());
        }
      })
    })
  }

  requestAlert(friend: any) {
    this.sendFriendRequesAlert(friend);
  }


  async sendFriendRequesAlert(friend: any) {
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: 'Confirm!',
      message: 'Send Friend Request ?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          id: 'cancel-button',
          handler: (blah) => {
          }
        }, {
          text: 'Send',
          id: 'confirm-button',
          handler: () => {
            this.sendFriendRequestToCollection(friend);
          }
        }
      ]
    });
    await alert.present();
  }

  sendFriendRequestToCollection(friend: any) {
    let res: FriendRequests = this.userService.populateFriendRequestData(friend, this.userDetails);

    const query = this.firestore.collection(FirebaseCollection.FRIEND_REQUESTS);
    query.ref.where('recievedTo.id', '==', res.recievedTo.id)
      .where('sendBy.id', '==', res.sendBy.id)
      .get().then((req: any) => {
        let request;
        if (!req.empty) {
          req.forEach((data: any) => {
            request = data.data();
            res.id = data.id;
            this.userService.updateFriendRequests(res).then(() => {
              this.util.showToast(('Friend Request Successfully sent'), 'success', 'bottom');
            });
          })
        } else {
          this.userService.sendFriendRequestsToCollection(res).then(() => {
            this.util.showToast(('Friend Request Successfully sent'), 'success', 'bottom');
          });
        }
      })


  }

  getRecievedFriendRequests() {
    this.firestore.collection(FirebaseCollection.FRIEND_REQUESTS, ref => ref
      .where('recievedTo.id', '==', this.userDetails.id)
      .where('status', '==', 'REQUESTED'))
      .valueChanges().subscribe((requests: any[]) => {
        this.recievedFriendRequests = requests;
        this.getFriendRequestDetails(this.recievedFriendRequests)
      });
  }


  getFriendRequestDetails(recievedFriendRequests: any) {
    recievedFriendRequests.forEach((request: any) => {
      const query = this.firestore.collection('users');
      query.ref.where("id", "==", request.recievedTo.id).get().then((res: any) => {
        res.forEach((data: any) => {
          let userProfile = data.data() as any;
          request.recievedTo.className = userProfile.className;
          request.recievedTo.boardName = userProfile.boardName;
          request.recievedTo.stateName = userProfile.stateName;
          request.recievedTo.cityName = userProfile.cityName;
        })
      })
    });
  }

  getSentFriendRequests() {
    this.firestore.collection(FirebaseCollection.FRIEND_REQUESTS, ref => ref
      .where('sendBy.id', '==', this.userDetails.id)
      .where('status', '==', 'REQUESTED'))
      .valueChanges().subscribe((requests: any[]) => {
        this.sentFriendRequests = requests;
        this.getFriendRequestDetails(this.sentFriendRequests)
      });
  }

  acceptFriendRequest(user: any) {
    this.firestore.collection(FirebaseCollection.FRIEND_REQUESTS)
      .doc(user.id).update({
        status: 'ACCEPTED'
      });
  }

  getAllAcceptedFriends() {
    this.myFriends = [];
    const query = this.firestore.collection(FirebaseCollection.FRIEND_REQUESTS);
    query.ref.where('sendBy.id', '==', this.userDetails.id)
      .where('status', '==', 'ACCEPTED')
      .get().then((res: any) => {
        if (!res.empty) {
          res.forEach((data: any) => {
            let record: FriendRequests = data.data();
            this.myFriends.push(record);
          });
        }
        const query = this.firestore.collection(FirebaseCollection.FRIEND_REQUESTS);
        query.ref.where('recievedTo.id', '==', this.userDetails.id)
          .where('status', '==', 'ACCEPTED')
          .get().then((res: any) => {
            if (!res.empty) {
              res.forEach((data: any) => {
                let record: FriendRequests = data.data() as FriendRequests;
                this.myFriends.push(record);
              });
            }
          });
      });
  }

  declineFriendRequests(user: any) {
    this.firestore.collection(FirebaseCollection.FRIEND_REQUESTS)
      .doc(user.id).update({
        status: 'DECLINED'
      })
  }

  onClickChat(friend: any) {
    let profileType = friend.recievedTo.id == this.userDetails.id ? 'SENDBY' : 'RECIEVEDTO';
    this.userService.setProfileDetails(friend);
    this.createChat(friend);
    this.router.navigate(['home/friends/chat'], { queryParams: { chatId: friend.id, profileType: profileType } });
  }

  async createChat(friend: any) {
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

