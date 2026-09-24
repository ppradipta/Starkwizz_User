import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment-timezone';
import { DateUtilService } from 'src/app/common/util/date-util.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { GenerateKeyService } from 'src/app/model/common/common.generatekey';
import { UserDetails } from 'src/app/model/user';
import { BoardService } from 'src/app/services/board.service';
import { ClassService } from 'src/app/services/class.service';
import { UserServiceService } from 'src/app/services/user-service.service';
import { UtilServiceService } from 'src/app/services/util-service.service';

@Component({
  selector: 'app-add-account',
  templateUrl: './add-account.component.html',
  styleUrls: ['./add-account.component.scss'],
})
export class AddAccountComponent implements OnInit {
  subscribeUserDetails: any;
  boardOfEducation: any[] = [];
  classOfEducations: any[] = [];
  userDetails: any = {};
  userProfile: any = {};
  selectedBoard: any = {};
  selectdClass: any = {};
  classes: any[] = [];
  className: any;
  dateOfBirth: string = '';
  maxDate: string = moment().subtract(5, 'years').format('YYYY-MM-DD');
  genderType = [
    { id: 1, name: 'Male', value: 'MALE', isActive: false },
    { id: 2, name: 'Female', value: 'FEMALE', isActive: false }
  ]
  constructor(public classService: ClassService, public boardService: BoardService,
    private userService: UserServiceService, private utilityService: UtilServiceService,
    private location: Location, private router: Router, private generateKeyService: GenerateKeyService, private dateUtil: DateUtilService,
    private firestore: AngularFirestore) { }

  ngOnInit() {
    this.subscribeUserDetails = this.userService.getUserDetails().subscribe((userData) => {
      if (userData && userData.userType == 'PARENT') {
        this.userDetails = userData;
        this.userProfile.mobileNo = userData.mobileNo;
        this.userProfile.parentId = userData.id;
      }
    })
    this.getClass();
    this.getBoard();
  }


  getClass() {
    this.classService.classEducations$.subscribe(clas => {
      this.classes = clas;
    })
  }

  getBoard() {
    this.boardService.boardEducations$.subscribe((board) => {
      this.boardOfEducation = board;
      this.boardOfEducation.forEach(el => {
        el.isActive = false;
      })
    })
  }

  onClickProceed() {
    if (!this.userDetails || !this.userDetails.id) {
      this.utilityService.showToast('Parent details missing', 'danger', 'bottom');
      return;
    }

    // Check how many child accounts already exist for this parent
    this.firestore.collection('users', ref => ref.where('parentId', '==', this.userDetails.id)).get().subscribe((res: any) => {
      const existingCount = res.size || (res.docs ? res.docs.length : 0);
      if (existingCount >= 3) {
        this.utilityService.showToast('Maximum 3 accounts allowed per parent', 'danger', 'bottom');
        return;
      }

      // proceed to create child
      let child: UserDetails = new UserDetails();
      child.id = this.utilityService.generateAlphaNumericId();
      child.firstName = this.userProfile.firstName;
      child.lastName = this.userProfile.lastName;
      child.displayName = this.userProfile.firstName + " " + this.userProfile.lastName;
      child.boardName = this.selectedBoard.name;
      child.boardId = this.selectedBoard.id;
      child.classId = this.selectdClass.id;
      child.className = this.selectdClass.name;
      child.gender = this.userProfile.gender;
      child.dateOfBirth = this.dateOfBirth;
      child.applicationId = 'SZ' + this.generateKeyService.generateApplicationId();
      child.parentId = this.userDetails.id;
      child.creationdate = this.dateUtil.getCurrentDateWithYYYYMMDD();
      child.creationUnixDate = this.dateUtil.getCurrentEpochTime();
      child.mobileNo = this.userDetails.mobileNo;
      child.userType = 'STUDENT';
      child.createdBy = 'PARENT';
      child.isEmailVerified = false;
      child.referralCode = this.generateKeyService.generateApplicationId();
      this.userService.setUserDetailsToCollecton(child);
      this.location.back();
    });

  }

  // changeBoard(event: any) {
  //   if (event.detail.value) {
  //     let board = this.boardOfEducation.find(bd => bd.id == event.detail.value);
  //     if (board) {
  //       this.selectedBoard = board;
  //     }
  //     let cls = this.classes.filter(clas => clas.boardId == event.detail.value);
  //     this.classOfEducations = cls.sort((a, b) => (a.name - b.name));

  //   }
  // }

  // changeClass(event: any) {
  //   if (event.detail.value) {
  //     let cls = this.classes.find(clas => clas.id == event.detail.value);
  //     if (cls) {
  //       this.selectdClass = cls;
  //     }
  //   }
  // }
  
  submitDate() {
    this.dateOfBirth = this.dateUtil.getFormatDate(this.userProfile.dateOfBirth);
  }

  onClickSelect(type: any) {
    this.userProfile.gender = type.value;
    this.genderType.forEach(el => {
      if (type?.id === el?.id) {
        el.isActive = true;
        type.isActive = true;
      } else {
        el.isActive = false;
      }
      return el;
    });
  }

  onSelectBoard(board: any) {
    this.selectedBoard = board;
    this.boardOfEducation.forEach(el => {
      if (board?.id === el?.id) {
        el.isActive = true;
        board.isActive = true;
      } else {
        el.isActive = false;
      }
      return el;
    });

    let cls = this.classes.filter(clas => clas.boardId == this.selectedBoard.id);

    this.classOfEducations = cls.sort((a, b) => (a.name - b.name));
    this.classOfEducations.forEach(el => {
      el.isActive = false;
    })
  }

  onSelectClass(clas: any) {
    this.selectdClass = clas;
    this.classOfEducations.forEach(el => {
      if (clas?.id === el?.id) {
        el.isActive = true;
        clas.isActive = true;
      } else {
        el.isActive = false;
      }
      return el;
    });
  }

}
