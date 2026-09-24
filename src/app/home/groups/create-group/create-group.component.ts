import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { UserDetails } from 'src/app/model/user';
import { UserServiceService } from 'src/app/services/user-service.service';
import { UtilServiceService } from 'src/app/services/util-service.service';

@Component({
  selector: 'app-create-group',
  templateUrl: './create-group.component.html',
  styleUrls: ['./create-group.component.scss'],
})
export class CreateGroupComponent implements OnInit {
  achieve = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  groupName: string='';
  userDetails: UserDetails = new UserDetails();
  groupData: any;
  groupImage: string='';
  groupMembers: any[] = [];
  constructor(
    private router: Router,
    private userService: UserServiceService,
    private util: UtilServiceService,
    public firestore: AngularFirestore
  ) { }

  ngOnInit() {
    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
    });
    this.userService.getGroupDetails().subscribe(groupVal => {
      this.groupData = groupVal;
    });

    this.userService.getGroupImage().subscribe(img => {
      this.groupImage = img;
    });

    this.userService.getGroupMemberDetails().subscribe(members => {
      this.groupMembers = members;
    });
  }

  viewProfileDetails(member:any) {
    this.userService.setProfileDetails(member);
    this.router.navigate(['home/viewProfile'], { queryParams: { profileType: 'GROUP' } });
  }

  confirmGroup() {
    if (!this.groupName) {
      this.util.showToast("Enter Group Name", "danger", "bottom");
    }
    else {
      let userGroupDetails = this.userService.populateGroupDetails(this.groupMembers, this.userDetails, this.groupImage, this.groupName);
      this.userService.setGroupDetailsToCollection(userGroupDetails);
      this.router.navigate(['home/groups']);
    }


  }
  uploadGroupImage(event:any) {
    let items = {
      imageUrl: event,
      imageType: 'GROUP-IMAGE'
    }
    this.userService.setImagesDataForUpload(items);
    this.router.navigate(['imageUpload']);
  }
  onClickDetail(){

  }
 

}
