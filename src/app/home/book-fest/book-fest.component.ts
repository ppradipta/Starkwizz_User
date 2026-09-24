import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { BookAdds } from 'src/app/model/bookAdds';
import { UserDetails } from 'src/app/model/user';
import { UserServiceService } from 'src/app/services/user-service.service';
import { register } from 'swiper/element/bundle';

register();
@Component({
  selector: 'app-book-fest',
  templateUrl: './book-fest.component.html',
  styleUrls: ['./book-fest.component.scss'],
})
export class BookFestComponent implements OnInit {
  category = [
    { img: '/assets/images/book-icon.png', name: 'Book', isActive: true },
    { img: '/assets/images/music-icon.png', name: 'Music', isActive: false },
    { img: '/assets/images/sport-icon.png', name: 'Sport', isActive: false },
    { img: '/assets/images/stationery-icon.png', name: 'Stationery', isActive: false }
  ]

  recomndedBooksList: BookAdds[] = [];
  userDetails: UserDetails = new UserDetails();
  searchValue: string='';
  constructor(
    private router: Router,
    private firestore: AngularFirestore,
    private userService: UserServiceService
  ) { }

  ngOnInit() {
    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
    });
    this.getRecommndedBooksList();
  }

  onClickDeatil(book:any) {
    this.userService.setBookDetails(book);
    this.router.navigate(['home/bookFest/bookDetail']);
  }

  onClickAds() {
    this.router.navigate(['home/bookFest/bookAds']);
  }


  getRecommndedBooksList() {
    this.recomndedBooksList = [];
    this.firestore.collection("myadds", ref => ref
      .where("boardId", "==", this.userDetails.boardId)
      .where("userid", "!=", this.userDetails.id))
      .get().subscribe(data => {
        this.recomndedBooksList = [];
        data.forEach((res: any) => {
          if (res.exists) {
            this.recomndedBooksList.push(res.data());
          }
        });
      });
  }

  searchBookAds(event:any) {
    let text = event.target.value;
    if (null != text && text.length > 2) {
      this.firestore.collection("myadds", ref => ref.where("keywords", "array-contains", text.toLowerCase())
        .where("boardId", "==", this.userDetails.boardId)
        .where("userid", "!=", this.userDetails.id).limit(10)).get().subscribe(data => {
          data.forEach((res: any) => {
            this.recomndedBooksList = [];
            if (res.exists) {
              this.recomndedBooksList.push(res.data());
            }
          });
        });
    } 

  }

  cancelSearch() {
    this.getRecommndedBooksList();
  }
}
