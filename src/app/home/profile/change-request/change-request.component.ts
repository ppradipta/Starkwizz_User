import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NavController } from '@ionic/angular';
import { DateUtilService } from 'src/app/common/util/date-util.service';
import { BoardService } from 'src/app/services/board.service';
import { ClassService } from 'src/app/services/class.service';
import { UserServiceService } from 'src/app/services/user-service.service';
import { UtilServiceService } from 'src/app/services/util-service.service';

@Component({
  selector: 'app-change-request',
  templateUrl: './change-request.component.html',
  styleUrls: ['./change-request.component.scss'],
})
export class ChangeRequestComponent implements OnInit {
  boardOfEducation: any[]=[];
  classOfEducations: any[]=[];
  classes: any[] = [];
  boardId: string='';
  classId: string='';
  reasone: string='';
  profileData: any={} as any
  userApproval: any = {};
  constructor(
    public boardService: BoardService,
    public classService: ClassService,
    private userService: UserServiceService,
    private util: UtilServiceService,
    private dateUtilService: DateUtilService,
    private firestore: AngularFirestore,
    private utilityService: UtilServiceService,
    private navCtrl: NavController
  ) {
    this.userService.getUserDetails().subscribe((userData) => {
      if (userData) {
        this.profileData = userData;
      }
    });
  }

  ngOnInit() {
    this.boardService.boardEducations$.subscribe((board) => {
      if (board) {
        this.boardOfEducation = board;
      }
    });
    this.classService.classEducations$.subscribe(clas => {
      if (clas) {
        this.classes = clas;
      }
    });

    this.firestore.collection("user_approval", ref => ref.where("status", "==", 'REQUESTED').where('userId', '==', this.profileData.id)).get().subscribe(data => {
      if (!data.empty) {
        data.forEach((res: any) => {
          this.userApproval = res.data();
          this.classId = this.userApproval.changeDetails.classId;
          this.boardId = this.userApproval.changeDetails.boardId;
          this.reasone = this.userApproval.reasone;
        })
      }
      if (null == this.userApproval.id) {
        this.userApproval.id = this.utilityService.generateAlphaNumericId();
      }
    });
  }

  changeBoard() {
    this.classOfEducations = [];
    this.classId = '';
  }

  changeClass() {
    let cls = this.classes.filter(clas => clas.boardId == this.boardId);
    this.classOfEducations = cls.sort((a, b) => (a.name - b.name));
  }

  profileChangeRequest() {
    if (null != this.profileData && this.profileData.boardId === this.boardId && this.profileData.classId === this.classId) {
      this.util.showInfoAlert('Your requested change information is same as previous information.');
    } else if (null != this.profileData && (this.profileData.boardId != this.boardId || this.profileData.classId != this.classId)) {
      let board = this.boardOfEducation.find(bord => bord.id === this.boardId);
      let findclass = this.classes.find(clas => clas.boardId == this.boardId && clas.id == this.classId);
      this.userApproval = {
        boardName: this.profileData.boardName,
        classId: this.profileData.classId,
        boardId: this.profileData.boardId,
        className: this.profileData.className,
        displayName: this.profileData.displayName,
        mobileNo: this.profileData.mobileNo,
        userId: this.profileData.id,
        token:this.profileData.token,
        changeDetails: {
          classId: this.classId,
          boardId: this.boardId,
          boardName: board.name,
          className: findclass.name
        },
        reasone: this.reasone,
        requestDate: this.dateUtilService.getCurrentDateWithTime(),
        status: 'REQUESTED'
      }
      this.userService.setUserApprovalDetailsToCollecton(this.userApproval);
      this.userService.processProfileUpdateNotification(this.profileData, 'USER_PROFILE_CHANGE_REQUEST', this.userApproval.changeDetails);
      this.userService.processProfileUpdateSMS(this.profileData, 'USER_PROFILE_CHANGE_REQUEST', this.profileData.mobileNo, this.userApproval.changeDetails);
      this.util.showToast(('Request for changes sucessfully submitted'), 'success', 'bottom');
      this.navCtrl.back();
    }
  }

}
