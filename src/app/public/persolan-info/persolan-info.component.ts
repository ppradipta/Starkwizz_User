import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import * as moment from 'moment-timezone';
import { DateUtilService } from 'src/app/common/util/date-util.service';
import { GenerateKeyService } from 'src/app/model/common/common.generatekey';
import { UserDetails } from 'src/app/model/user';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import { BoardService } from 'src/app/services/board.service';
import { ClassService } from 'src/app/services/class.service';
import { UserHelperService } from 'src/app/services/helper/user-helper.service';
import { UserServiceService } from 'src/app/services/user-service.service';
import { UtilServiceService } from 'src/app/services/util-service.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-persolan-info',
  templateUrl: './persolan-info.component.html',
  styleUrls: ['./persolan-info.component.scss'],
})
export class PersolanInfoComponent implements OnInit {
  subscribeUserDetails: any;
  userDetails: UserDetails = new UserDetails();
  boardOfEducation: any[] = [];
  classOfEducations: any[] = [];
  classes: any[] = [];
  selectedBoard: any = {};
  selectdClass: any = {};
  dateOfBirth: string = '';
  maxDate: string = moment().subtract(5, 'years').format('YYYY-MM-DD');
  // countryCode: any = '+91';
  genderType = [
    { id: 1, name: 'Male', value: 'MALE', isActive: false },
    { id: 2, name: 'Female', value: 'FEMALE', isActive: false }
  ]
  constructor(
    private userService: UserServiceService,
    private router: Router,
    public boardService: BoardService,
    public classService: ClassService,
    private dateUtil: DateUtilService,
    private utilityService: UtilServiceService,
    private generateKeyService: GenerateKeyService,
    private userHelperService: UserHelperService,
    private authGuardService: AuthGuardService,
    private firestore: AngularFirestore,
    private navCtrl: NavController,
  ) { }

  ngOnInit() {
    let emailId = JSON.parse(JSON.stringify(localStorage.getItem('email')));
    let phoneNumber = JSON.parse(JSON.stringify(localStorage.getItem('phoneNo')));

    this.userService.getUserDetails().subscribe((userData) => {
      if (userData) {
        this.userDetails = userData;
        if (null == this.userDetails.referralCode) {
          this.userDetails.referralCode = this.generateKeyService.generateApplicationId();
        }

        if (null == this.userDetails.mobileNo) {
          this.userDetails.mobileNo = phoneNumber;
          this.userDetails.emailId = emailId;
        }
      }
    })

    this.getClass();
    this.getBoard();
  }

  onClickProceed() {
    if (this.userDetails.userType == 'PARENT') {
      let parent = {
        id: this.userDetails.id,
        displayName: this.userDetails.parentName,
        mobileNo: this.userDetails.mobileNo,
        emailId: this.userDetails.emailId,
        // mobileNo: this.countryCode + this.userDetails.mobileNo,
        applicationId: 'SZ' + this.generateKeyService.generateApplicationId(),
        creationdate: this.dateUtil.getCurrentDateWithYYYYMMDD(),
        creationUnixDate: this.dateUtil.getCurrentEpochTime(),
        userType: this.userDetails.userType,
        referralCode: this.generateKeyService.generateApplicationId(),
        isEmailVerified: false,
        status: 'CREATED',

      }
      this.userService.setUserDetailsToCollecton(parent);
      this.updateFCMToken(this.userDetails);
      // this.userService.setUserProfileDetailsToCollecton(child);
      this.userService.setUserDetails(this.userDetails);
      let child: UserDetails = new UserDetails();
      child.id = this.utilityService.generateAlphaNumericId();
      child.firstName = this.userDetails.firstName;
      child.lastName = this.userDetails.lastName;
      child.displayName = this.userDetails.firstName + " " + this.userDetails.lastName;
      child.mobileNo = this.userDetails.mobileNo;
      child.emailId = this.userDetails.emailId;
      // child.mobileNo = this.countryCode + this.userDetails.mobileNo;
      child.boardName = this.selectedBoard.name;
      child.boardId = this.selectedBoard.id;
      child.classId = this.selectdClass.id;
      child.className = this.selectdClass.name;
      child.gender = this.userDetails.gender;
      child.dateOfBirth = this.dateOfBirth;
      child.applicationId = 'SZ' + this.generateKeyService.generateApplicationId();
      child.parentId = this.userDetails.id;
      child.creationdate = this.dateUtil.getCurrentDateWithYYYYMMDD();
      child.creationUnixDate = this.dateUtil.getCurrentEpochTime();
      // child.mobileNo = this.userDetails.mobileNo;
      child.userType = 'STUDENT';
      child.createdBy = 'PARENT';
      child.isEmailVerified = false;
      child.referralCode = this.generateKeyService.generateApplicationId();
      this.userService.setUserDetailsToCollecton(child);
      this.updateFCMToken(child);
      this.router.navigate(['school-location-Info']);

      // this.router.navigate(['/home/user-listing']);
    }
    else {
      this.userDetails.id = this.userDetails.id;
      this.userDetails.displayName = this.userDetails.firstName + ' ' + this.userDetails.lastName;
      this.userDetails.mobileNo = this.userDetails.mobileNo;
      this.userDetails.emailId = this.userDetails.emailId;
      // this.userDetails.mobileNo = this.countryCode + this.userDetails.mobileNo;
      this.userDetails.boardName = this.selectedBoard.name;
      this.userDetails.boardId = this.selectedBoard.id;
      this.userDetails.className = this.selectdClass.name;
      this.userDetails.classId = this.selectdClass.id;
      this.userDetails.dateOfBirth = this.dateOfBirth;
      this.userDetails.isEmailVerified = false;
      this.userDetails.status = 'CREATED';
      this.userDetails.applicationId = 'SZ' + this.generateKeyService.generateApplicationId();
      this.userDetails.creationdate = this.dateUtil.getCurrentDateWithYYYYMMDD();
      this.userDetails.creationUnixDate = this.dateUtil.getCurrentEpochTime();
      this.userDetails.createdBy = 'USER';
      this.userService.setUserDetailsToCollecton(this.userDetails);
      this.userDetails.userId = this.userDetails.id;
      this.userService.setUserDetails(this.userDetails);
      this.updateFCMToken(this.userDetails);
      this.router.navigate(['school-location-Info']);
      if (environment.push.includes('USER_PROFILE_KYC_PENDING')) {
        this.userService.processProfileUpdateNotification(this.userDetails, 'USER_PROFILE_KYC_PENDING', null);
      }
      if (environment.sms.includes('USER_PROFILE_KYC_PENDING')) {
        // this.userService.processProfileUpdateSMS(this.userDetails, this.userDetails.mobileNo, 'USER_PROFILE_KYC_PENDING', null).then(result => {
        //   console.log('Process for event notification!!!')
        // })
      }


    }
    if (environment.push.includes('USER_REGISTRATION')) {
      this.userService.processProfileUpdateNotification(this.userDetails, 'USER_REGISTRATION', null);
    }
    if (environment.sms.includes('USER_REGISTRATION')) {
      // this.userService.processProfileUpdateSMS(this.userDetails, this.userDetails.mobileNo, 'USER_REGISTRATION', null).then(result => {
      //   console.log('Process for event notification!!!')
      // })
    }
    let userNoti = this.userHelperService.populateUserNotiForNewUser(this.userDetails);
    this.userService.setUserNotificationData(userNoti);

  }

  getClass() {
    this.classService.classEducations$.subscribe(clas => {
      if (clas) {
        this.classes = clas;
      }

    })
  }

  getBoard() {
    this.boardService.boardEducations$.subscribe((board) => {
      if (board) {
        this.boardOfEducation = board;
        this.boardOfEducation.forEach(el => {
          el.isActive = false;
        })
      }
    })
  }

  // changeBoard(event: any) {
  //   if (event.detail.value) {
  //     let board = this.boardOfEducation.find(bd => bd.id == event.detail.value);
  //     if (board) {
  //       this.selectedBoard = board;
  //     }
  //     let cls = this.classes.filter(clas => clas.boardId == event.detail.value);
  //     this.classOfEducations = cls.sort((a, b) => (a.name - b.name));
  //     this.classOfEducations.forEach(el => {
  //       el.isActive = false;
  //   })
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
    this.dateOfBirth = this.dateUtil.getFormatDate(this.userDetails.dateOfBirth);
  }
  updateFCMToken(user: any) {
    this.authGuardService.getFCMToken().subscribe(token => {
      if (null != user && token) {
        this.firestore.collection("users").doc(user.id).update({
          token: token
        }).then(result => {
          console.log('token update');
        });
      }
    });
  }

  onSelectedClasse(inputcls: any) {
    let clsIndex = this.userDetails.applicableClasses.findIndex(fcls => fcls.id == inputcls.id);
    if (clsIndex == -1) {
      this.userDetails.applicableClasses.push(clsIndex);
    }
  }

  goBack() {
    this.navCtrl.back();
  }

  onClickSelect(type: any) {
    this.userDetails.gender = type.value;
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
