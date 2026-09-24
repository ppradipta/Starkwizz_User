import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserServiceService } from 'src/app/services/user-service.service';

@Component({
  selector: 'app-group-detail',
  templateUrl: './group-detail.component.html',
  styleUrls: ['./group-detail.component.scss'],
})
export class GroupDetailComponent implements OnInit {
  groupMembers: any;
  constructor(
    private router: Router,
    private userService: UserServiceService
  ) { }

  ngOnInit() {
    this.userService.getGroupMemberDetails().subscribe(groupData => {
        this.groupMembers = groupData;
    })
  }

  onClickDetail() {
    this.router.navigate(['home/groups/group-member']);
  }
}
