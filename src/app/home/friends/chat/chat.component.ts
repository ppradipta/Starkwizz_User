import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { arrayRemove, arrayUnion } from "firebase/firestore";
import { DateUtilService } from 'src/app/common/util/date-util.service';
import { UserDetails } from 'src/app/model/user';
import { UserServiceService } from 'src/app/services/user-service.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
  chatId: string='';
  userDetails: UserDetails= {} as UserDetails;
  friend: any;
  chats: any;
  newMsg: any;
  profileType: string='';
  chatAreaRow: number = 1;
  constructor(private firestore: AngularFirestore,
    private userService: UserServiceService,
    private activeRoute: ActivatedRoute,
    private alertController: AlertController,
    private dateUtilService: DateUtilService) { }

  ngOnInit() {
    this.profileType = this.activeRoute.snapshot.queryParams['profileType'];
    this.chatId = this.activeRoute.snapshot.queryParams['chatId'];
    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
    });
    this.userService.getProfileDetails().subscribe(userprofile => {
      this.friend = userprofile;
    });
    this.chats = this.getChat(this.chatId);
  }


  getChat(chatId:any) {
    return this.firestore
      .collection<any>('chats')
      .doc(chatId).valueChanges().subscribe((chatDetails: any) => {
        this.chats = chatDetails;
      })
  }

  deleteMessage(data:any) {
    this.firestore.collection('chats').doc(this.chatId).update({
      messages: arrayRemove(data)
    }).then(res => {
      this.newMsg = null;
    })
  }

  deleteAllYourChat() {
    //later need to add if group we will clear all chat else only his chat 
    this.firestore.collection('chats').doc(this.chatId).update({
      messages: []
    }).then(res => {
      this.newMsg = null;
    })

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
    this.firestore.collection('chats').doc(this.chatId).update({
      messages: arrayUnion(data)
    }).then(res => {
      this.newMsg = null;
    })

  }
}
