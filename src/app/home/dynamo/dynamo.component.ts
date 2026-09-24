import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { register } from 'swiper/element/bundle';
register();
@Component({
  selector: 'app-dynamo',
  templateUrl: './dynamo.component.html',
  styleUrls: ['./dynamo.component.scss'],
})
export class DynamoComponent implements OnInit {

  subjectList = [
    {
      name: 'Scholastic',
      subject: [
        {name:'English Grammer', background2: true},
        {name:'Science'},
        {name:'Mathematics', background2: true},
        {name:'Social Studies'},
        {name:'Physics', background2: true},
        {name:'Chemistry'},
        {name:'History & Civics', background2: true},
        {name:'Geography'},
        {name:'Biology', background2: true},
        {name:'General knowledge'},
        {name:'EVS', background2: true},
        {name:'Computer'},
      ]
    },
    {
      name: 'Co-Scholastic',
      subject: [
        {name:'Dance', background2: true},
        {name:'Singing'},
        {name:'Elocution', background2: true},
      ]
    },
    {
      name: 'Quiz Whizz',
      subject: [
        {name:'Quiz Whizz', background2: true},
      ]
    },
    {
      name: 'Test',
      subject: [
        {name:'Diagnostic Test', background2: true},
        {name:'Progressive Test'},
        {name:'Proficiency Test', background2: true},
        {name:'1st Benchmark Test'},
        {name:'2st Benchmark Test', background2: true},
        {name:'Final Benchmark Test'},
      ]
    },
    {
      name: 'Events',
      subject: [
        {name:'Scholarship Test', background2: true},
        {name:'Award Event Test'},
        {name:'Sponsred Event Test', background2: true},
      ]
    },
  ];
  
  segmentValue: string = "subjects";
  constructor(
    private navCtrl: NavController,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {

  }

  goBack() {
    this.navCtrl.back();
  }

  onClicksubscription() {
    this.router.navigate(['home/dynamo/subscription']);
  }

  segmentChanged(event:any) {
    this.segmentValue = event.detail.value;
  }

}
