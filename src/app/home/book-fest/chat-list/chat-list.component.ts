import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';
import { AlertController } from '@ionic/angular';
import { UserServiceService } from 'src/app/services/user-service.service';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss'],
})
export class ChatListComponent implements OnInit {
  addId: string='';
  chatId: string='';
  buyerChats: any[] = [];
  buyerDetails: any;
  constructor(private router: Router,
    private firestore: AngularFirestore,
    private activeRoute: ActivatedRoute,
    private userService: UserServiceService,
    private alertController: AlertController,
    private callNumber: CallNumber) { }

  ngOnInit() {
    this.addId = this.activeRoute.snapshot.queryParams['addId'];
    this.getBuyerList();
  }

  getBuyerDetails(buyerId:any) {
    if (buyerId) {
      this.firestore.collection("users", ref => ref.where("id", "==", buyerId)).get().subscribe(data => {
        data.forEach((res: any) => {
          this.buyerDetails = res.data();
          this.userService.setChatProfileDetails(this.buyerDetails);
        })
      });
    }
  }

  getBuyerList() {
    const query = this.firestore.collection('book_adds_chats').ref
      .where("addId", "==", this.addId);
    query.get().then((userchat: any) => {
      if (!userchat.empty) {
        this.buyerChats = [];
        userchat.forEach((chat:any) => {
          let fetchBuyer = chat.data();
          this.buyerChats.push(fetchBuyer);
        });
      }
    });
  }

  onClickChatWithBuyer(buyer:any) {
    this.getBuyerDetails(buyer.user.id);
    this.router.navigate(['home/bookFest/chat'], { queryParams: { chatId: buyer.id } });
  }

  onClickCallWithBuyer(buyer:any) {
    if (null == this.buyerDetails) {
      this.getBuyerDetails(buyer.user.id);
    }
    this.presentAlertConfirm(buyer);
  }


  async presentAlertConfirm(buyer:any) {

    const alert = await this.alertController.create({
      // header: 'Confirm!',
      message: 'Are you sure you want to make phone call!!',
      buttons: [{
        text: 'NO',
        role: 'NO',
        cssClass: 'secondary',
        handler: (blah) => {

        }
      }, {
        text: 'YES',
        handler: () => {
          this.callNumber.callNumber(this.buyerDetails.mobileNo, true)
            .then(res => console.log('Launched dialer!', res))
            .catch(err => console.log('Error launching dialer', err));
        }
      }]
    });

    await alert.present();
  }

}
