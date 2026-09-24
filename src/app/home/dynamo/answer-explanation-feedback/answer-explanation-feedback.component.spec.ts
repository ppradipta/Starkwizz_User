import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IonicModule, NavController } from '@ionic/angular';

import { AnswerExplanationFeedbackComponent } from './answer-explanation-feedback.component';

describe('AnswerExplanationFeedbackComponent', () => {
  let component: AnswerExplanationFeedbackComponent;
  let fixture: ComponentFixture<AnswerExplanationFeedbackComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AnswerExplanationFeedbackComponent],
      imports: [IonicModule.forRoot(), FormsModule],
      providers: [NavController, { provide: ActivatedRoute, useValue: { snapshot: { params: {} } } }],
    }).compileComponents();

    fixture = TestBed.createComponent(AnswerExplanationFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});