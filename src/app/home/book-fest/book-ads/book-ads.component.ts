import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { DateUtilService } from 'src/app/common/util/date-util.service';
import { BoardOfEducation } from 'src/app/model/board';
import { BookAdds, BooksCategory } from 'src/app/model/bookAdds';
import { ClassOfEducation } from 'src/app/model/class';
import { GenerateKeyService } from 'src/app/model/common/common.generatekey';
import { FirebaseCollection } from 'src/app/model/common/firebase-collection';
import { UserDetails } from 'src/app/model/user';
import { UserServiceService } from 'src/app/services/user-service.service';
import { UtilServiceService } from 'src/app/services/util-service.service';
import { SwiperOptions } from 'swiper/types';
//import SwiperCore, { Autoplay, Keyboard, Pagination, Scrollbar, SwiperOptions, Zoom } from 'swiper';
//SwiperCore.use([Autoplay, Keyboard, Pagination, Scrollbar, Zoom]);

@Component({
  selector: 'app-book-ads',
  templateUrl: './book-ads.component.html',
  styleUrls: ['./book-ads.component.scss'],
})
export class BookAdsComponent implements OnInit {
  segmentValue: string = "sell";
  category: string = '';
  boardList: BoardOfEducation[] = [];
  classes: ClassOfEducation[] = [];
  bookCategory: BooksCategory = new BooksCategory();
  bookAdds: BookAdds = new BookAdds();
  myAdds: BookAdds[] = [];
  userDetails: UserDetails = new UserDetails();
  bookAdsSwiperConfig: SwiperOptions = {
    slidesPerView: 1,
    autoplay: true
  } as SwiperOptions;
  selectedType = [
    { id: 1, name: 'Good', value: 'good', isActive: false },
    { id: 2, name: 'Manageable', value: 'manageable', isActive: false }
  ]
  constructor(
    private firestore: AngularFirestore,
    private userService: UserServiceService,
    private util: UtilServiceService,
    private router: Router,
    private generateKeyService: GenerateKeyService,
    private dateUtilService: DateUtilService,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.getBooksCategory();
    this.getBoard();
    this.getProfileImage();
    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
    })
  }

  segmentChanged(event: any) {
    this.segmentValue = event.detail.value;
    if (this.segmentValue === 'myads') {
      this.getBookAdds();
    } else {
      this.bookAdds = new BookAdds();
    }
  }

  getBooksCategory() {
    this.firestore.collection("books_category", ref => ref)
      .get().subscribe((data: any) => {
        data.forEach((res: any) => {
          this.bookCategory = res.data();
        })
      });
  }

  getBoard() {
    this.firestore.collection('board_of_education').get().subscribe((staes: any) => {
      if (!staes.empty) {
        staes.forEach((board: any) => {
          this.boardList.push(board.data());
        });
      }
    });
  }

  selectBoard(event: any) {
    this.classes = [];
    let board = this.boardList.find(st => st.id == event.detail.value);
    if (board) {
      this.bookAdds.boardId = board.id;
      this.bookAdds.boardName = board.displayName;
    }
    this.firestore.collection("classes", ref => ref.where("boardId", "==", event.detail.value)).get().subscribe(data => {
      data.forEach((res: any) => {
        this.classes.push(res.data());
      })
    });
  }

  selectclass(event: any) {
    let classResult = this.classes.find(cls => cls.id == event.detail.value);
    if (classResult) {
      this.bookAdds.classId = classResult.id;
      this.bookAdds.className = classResult.displayName;
    }
  }

  fileChangeEvent(event: any) {
    let items = {
      imageType: 'MY_ADD',
      imageUrl: event,
    }
    this.userService.setImagesDataForUpload(items);
    this.router.navigate(['imageUpload']);
  }

  postAdd() {
    this.bookAdds.status = 'POSTED';
    this.bookAdds.postedDate = this.dateUtilService.getCurrentDateWithYYYYMMDD();
    this.bookAdds.id = this.generateKeyService.generateUniqueFirestoreId();
    this.bookAdds.userid = this.userDetails.id;
    this.bookAdds.keywords = this.generateKeyService.generateKeywordsForBookAds(this.bookAdds.bookName, this.bookAdds.publicationName);
    this.calculateDiscount(this.bookAdds);
    this.userService.setBookDetailsToCollection(this.bookAdds).then(() => {
      this.segmentValue = 'myads';
      this.util.showToast(('Add Posted Successfully !!!'), 'success', 'bottom');
    });
    this.userService.setImageForUpload(null);
  }

  getBookAdds() {
    this.firestore.collection(FirebaseCollection.MY_ADDS, ref => ref.where('userid', '==', this.userDetails.id)).valueChanges().subscribe((records: any[]) => {
      this.myAdds = records;
      if (null != records) {
        this.myAdds.forEach(record => {
          record['isToggleOn'] = record.status == 'POSTED' ? false : true;
        });
      }
    });
  }

  getProfileImage() {
    this.userService.getImageForUpload().subscribe(img => {
      if (img) {
        this.bookAdds.photos.push(img);
      }
    })
  }

  calculateDiscount(myAdd: any) {
    myAdd.discountPercentage = parseFloat((((myAdd.bookPrice - myAdd.discount) / myAdd.bookPrice) * 100).toFixed(2));
  }

  chatRelatedToAdds(myadd: any) {
    this.router.navigate(['home/bookFest/buyerlist'], { queryParams: { addId: myadd.id } });
  }

  changePostingStatus(add: any, index: any) {
    this.firestore.collection(FirebaseCollection.MY_ADDS).doc(add.id).update({
      status: add.status == 'POSTED' ? 'DISABLE' : 'POSTED'
    }).then(result => {
      this.util.showToast('Ads updated sucessfully!!', 'success', 'bottom');
    })
  }

  async deleteAdd(add: any) {
    const alert = await this.alertController.create({
      // header: 'Confirm!',
      message: 'Are you sure you want to delete?',
      buttons: [{
        text: 'NO',
        role: 'NO',
        cssClass: 'secondary',
        handler: (blah) => {

        }
      }, {
        text: 'YES',
        handler: () => {
          this.firestore.collection(FirebaseCollection.MY_ADDS).doc(add.id).delete().then(result => {
            this.util.showToast('Ads deleted sucessfully!!', 'success', 'bottom');
          });
        }
      }]
    });

    await alert.present();




  }

  onClickDeleteImage(index: any) {
    this.bookAdds.photos.splice(index, 1);
  }

  onClickType(type: any) {
    this.bookAdds.condition = type.value;
    this.selectedType.forEach(el => {
      if (type?.id === el?.id) {
        el.isActive = true;
        type.isActive = true;
      } else {
        el.isActive = false;
      }
      return el;
    });
  }

}
