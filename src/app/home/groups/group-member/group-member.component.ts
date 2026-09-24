import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserServiceService } from 'src/app/services/user-service.service';

@Component({
  selector: 'app-group-member',
  templateUrl: './group-member.component.html',
  styleUrls: ['./group-member.component.scss'],
})
export class GroupMemberComponent implements OnInit {
  groupMembers: any;
  constructor(
    private router: Router,
    private userService: UserServiceService
  ) { }

  ngOnInit() {
    this.userService.getGroupMemberDetails().subscribe(groupData => {
      if (groupData) {
        this.groupMembers = groupData;
      }
    })
  }

  onClickDetail() {
    this.router.navigate(['home/viewProfile']);
  }

  addMember() {
    this.router.navigate(['home/groups/add-member']);
  }

}
