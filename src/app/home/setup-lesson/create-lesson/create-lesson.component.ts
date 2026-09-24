import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-lesson',
  templateUrl: './create-lesson.component.html',
  styleUrls: ['./create-lesson.component.scss'],
})
export class CreateLessonComponent implements OnInit {
  boardList = [
    {board: 'CBSE', id: '1'},
    {board: 'ICSE', id: '2'},
    {board: 'BSEODISHA', id: '3'},
  ];
  classList = [
    {class: '4', id: '1'},
    {class: '5', id: '2'},
    {class: '6', id: '3'},
    {class: '7', id: '4'},
    {class: '8', id: '5'},
  ];
  subjectList = [
    {subj: 'englishgrammar', id: '1'},
    {subj: 'Geography', id: '2'},
    {subj: 'Science', id: '3'},
  ];
  moduleList = [
    {module: 'Roman Numerals', id: '1'},
    {module: 'Health and Hygiene', id: '2'},
    {module: 'Articles, Adjectives', id: '3'},
  ];
  constructor(
    private router: Router,
  ) { }

  ngOnInit() {}

  addExam() {
    this.router.navigate(['home/setup-lesson/setupNote']);
  }

}
