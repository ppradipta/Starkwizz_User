import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-setup-lesson',
  templateUrl: './setup-lesson.page.html',
  styleUrls: ['./setup-lesson.page.scss'],
})
export class SetupLessonPage implements OnInit {
  segmentValue: string = "ongoing";
  completedlesson:any[]=[];
  pendinglesson:any[]=[];
  ongoinglesson:any[]=[];
  constructor(
    private router: Router,
  ) { }

  ngOnInit() {
  }

  segmentChanged(event:any) {
    this.segmentValue = event.detail.value;
  }


  checkLessonActivity(){


  }
  
  createLesson() {
    this.router.navigate(['home/setup-lesson/create']);
  }
}
