import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';
import { DateUtilService } from 'src/app/common/util/date-util.service';
import { BookAdds } from 'src/app/model/bookAdds';
import { UserDetails } from 'src/app/model/user';
import { UserServiceService } from 'src/app/services/user-service.service';
import { UtilServiceService } from 'src/app/services/util-service.service';
import { SwiperOptions } from 'swiper/types';
//import SwiperCore, { Autoplay, Keyboard, Pagination, Scrollbar, SwiperOptions, Zoom } from 'swiper';
//SwiperCore.use([Autoplay, Keyboard, Pagination, Scrollbar, Zoom]);

@Component({
  selector: 'app-book-detail',
  templateUrl: './book-detail.component.html',
  styleUrls: ['./book-detail.component.scss'],
})
export class BookDetailComponent implements OnInit {
  bookDetailsSwiperConfig: SwiperOptions = {
    slidesPerView: 1,
    autoplay:true} as SwiperOptions;
  recomndedBooksList:any[] = []
  bookDetails: BookAdds = new BookAdds();
  sellerDetails: UserDetails = new UserDetails();
  userDetails: UserDetails= new UserDetails();
  constructor(
    private router: Router,
    private userService: UserServiceService,
    private firestore: AngularFirestore,
    private util: UtilServiceService,
    private dateUtilService: DateUtilService,
    private call: CallNumber
  ) { }

  ngOnInit() {
    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
    });
    this.userService.getBookDetails().subscribe((data) => {
      this.bookDetails = data;
      this.getSellerDetails(this.bookDetails.userid);
    });
    this.getRecommndedBooksListForThatSeller();

  }



  getRecommndedBooksListForThatSeller() {
    this.recomndedBooksList = [];
    this.firestore.collection("myadds", ref => ref
      .where("status", "==", 'POSTED')
      .where("userid", "==", this.userDetails.id))
      .get().subscribe(data => {
        data.forEach((res: any) => {
          if (res.exists) {
            this.recomndedBooksList.push(res.data());
          }
        });
      });
  }


  onClickChat() {
    this.createChat();
    this.userService.setChatProfileDetails(this.sellerDetails);
  }

  async createChat() {
    const query = this.firestore.collection('book_adds_chats').ref
      .where("addId", "==", this.bookDetails.id)
      .where("userid", "==", this.userDetails.id);
    query.get().then((userchat: any) => {
      if (userchat.empty) {
        const chatId = this.util.generateAlphaNumericId();
        const data = {
          id: chatId,
          addId: this.bookDetails.id,
          bookName: this.bookDetails.bookName,
          userid: this.userDetails.id,
          createdAt: this.dateUtilService.getCurrentDateWithTime(),
          user: {
            id: this.userDetails.id,
            imageUrl: this.userDetails.imageUrl,
            displayName: this.userDetails.displayName,
            mobileNo: this.userDetails.mobileNo,
            stateName: this.userDetails.stateName,
            districtName: this.userDetails.districtName,
            cityName: this.userDetails.cityName,
            className: this.userDetails.className,
            boardName: this.userDetails.boardName
          },
          count: 0,
          messages: []
        };
        this.firestore.collection('book_adds_chats').doc(chatId)
          .set(JSON.parse(JSON.stringify(data)), { merge: true });
        this.router.navigate(['home/bookFest/chat'], { queryParams: { chatId: chatId } });
      } else {
        userchat.forEach((chat:any) => {
          let fetchchat = chat.data();
          this.router.navigate(['home/bookFest/chat'], { queryParams: { chatId: fetchchat.id } });
        });

      }
    });
  }

  getSellerDetails(sellerId:any) {
    if (sellerId) {
      this.firestore.collection("users", ref => ref.where("id", "==", sellerId)).get().subscribe(data => {
        data.forEach((res: any) => {
          this.sellerDetails = res.data();
        })
      });
    }
  }

  onClickCall() {
    this.call.callNumber(this.sellerDetails.mobileNo, true).then(res => {
      console.log(res);

    }, err => {
      console.log(err);

    })

  }
}