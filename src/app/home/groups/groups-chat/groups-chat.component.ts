import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { arrayRemove, arrayUnion } from "firebase/firestore";
import { DateUtilService } from 'src/app/common/util/date-util.service';
import { UserDetails } from 'src/app/model/user';
import { UserServiceService } from 'src/app/services/user-service.service';
import { UtilServiceService } from 'src/app/services/util-service.service';

@Component({
  selector: 'app-groups-chat',
  templateUrl: './groups-chat.component.html',
  styleUrls: ['./groups-chat.component.scss'],
})
export class GroupsChatComponent implements OnInit {

  chatId: string='';
  userDetails: UserDetails= {} as UserDetails;
  group: any;
  chats: any;
  newMsg: any;
  chatAreaRow: number = 1;
  constructor(
    private router: Router,
    private firestore: AngularFirestore,
    private userService: UserServiceService,
    private activeRoute: ActivatedRoute,
    private dateUtilService: DateUtilService,
    private alertController: AlertController,
    private util: UtilServiceService
  ) { }

  ngOnInit() {
    this.chatId = this.activeRoute.snapshot.queryParams['chatId'];
    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
    });
    this.userService.getGroupDetails().subscribe(groupDetails => {
      this.group = groupDetails;
    });
    this.chats = this.getChat(this.chatId);
  }


  getChat(chatId:any) {
    return this.firestore
      .collection<any>('group_chats')
      .doc(chatId).valueChanges().subscribe((chatDetails: any) => {
        this.chats = chatDetails;
      });
  }

  resize() {
    if (this.chatAreaRow < 6)
      this.chatAreaRow = this.chatAreaRow + 1;
  }


  async sendMessage() {
    const data = {
      id: this.userDetails.id,
      displayName: this.userDetails.displayName,
      content: this.newMsg,
      createdAt: this.dateUtilService.getCurrentDateWithTime(),
    };
    this.firestore.collection('group_chats').doc(this.chatId).update({
      messages: arrayUnion(data)
    }).then(res => {
      this.newMsg = null;
    })

  }

  onClickDetail(group:any) {
    this.userService.setGroupMemberDetails(group);
    this.router.navigate(['home/groups/group-member']);
  }


  deleteMessage(data:any) {
    this.firestore.collection('group_chats').doc(this.chatId).update({
      messages: arrayRemove(data)
    }).then(res => {
      this.newMsg = null;
    })
  }

  deleteAllYourChat() {
    //later need to add if group we will clear all chat else only his chat 
    this.firestore.collection('group_chats').doc(this.chatId).update({
      messages: []
    }).then(res => {
      this.newMsg = null;
    })

  }

  leaveGroup() {
   //if created by == login user can delete the group also

    let index = this.group.groupUsers.findIndex((gu:any) => gu.id === this.userDetails.id);
    if (index != -1) {
      this.firestore.collection('groups').doc(this.chatId).update({
        groupUsersId: arrayRemove(this.userDetails.id),
        groupUsers: arrayRemove(this.group.groupUsers[index])
      }).then(res => {
        this.newMsg = null;
        this.router.navigate(['home/groups']);
      });
        
    } else {
      this.util.showToast('User not exist in group', 'red', 'bottom');
    }

  }


  async deleteAllChat() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Are you Sure!',
      message: 'You want to clear all your chat!',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          id: 'cancel-button',
          handler: (blah) => {
          }
        }, {
          text: 'Delete',
          id: 'confirm-button',
          handler: () => {
            this.deleteAllYourChat();
          }
        }
      ]
    });
    await alert.present();

  }

}
