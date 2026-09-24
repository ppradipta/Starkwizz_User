import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { UserDetails } from 'src/app/model/user';
import { BoardService } from 'src/app/services/board.service';
import { ClassService } from 'src/app/services/class.service';
import { UserServiceService } from 'src/app/services/user-service.service';

@Component({
  selector: 'app-parents-info',
  templateUrl: './parents-info.component.html',
  styleUrls: ['./parents-info.component.scss'],
})
export class ParentsInfoComponent implements OnInit {
  userDetails: UserDetails = new UserDetails();
  relationTypes: any = [
    { id: 'FATHER', name: 'Father' },
    { id: 'MOTHER', name: 'Mother' },
    { id: 'OTHERS', name: 'Others' },
  ];
  actionSheetRelation = {
    header: 'Relation List',
  };
  constructor(
    private userService: UserServiceService,
    private router: Router,
    public boardService: BoardService,
    public classService: ClassService,
    private navCtrl: NavController,
  ) { }

  ngOnInit() {
    this.userService.getUserDetails().subscribe((userData) => {
      if (userData) {
        this.userDetails = userData;
      }
    })
  }

  onClickProceed() {
    this.userDetails.relationType = this.userDetails.relationType
    this.userService.setUserDetails(this.userDetails);
    this.userService.updateUserDetailsToCollecton(this.userDetails);
    this.userService.updateUserProfileDetailsToCollecton(this.userDetails);
    this.router.navigate(['/home/tabs/starkwizzHome']);
  }

  goBack() {
    this.navCtrl.back();
  }
}
