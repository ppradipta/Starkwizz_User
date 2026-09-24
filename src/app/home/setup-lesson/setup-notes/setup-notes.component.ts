import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-setup-notes',
  templateUrl: './setup-notes.component.html',
  styleUrls: ['./setup-notes.component.scss'],
})
export class SetupNotesComponent implements OnInit {
  addNote: boolean = false;
  setupDoute: boolean = false;
  constructor(
    private router: Router,
  ) { }

  ngOnInit() {}

  addNotes() {
    if(this.addNote == false) {
      this.addNote = true;
    } else {
      this.addNote = false;
    }
  }

  setupDoutes() {
    if(this.setupDoute == false) {
      this.setupDoute = true;
    } else {
      this.setupDoute = false;
    }
  }

  submit() {
    this.router.navigate(['home/setup-lesson/create']);
  }

}
