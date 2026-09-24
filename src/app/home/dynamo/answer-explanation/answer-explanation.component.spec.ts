import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IonRouterOutlet, IonicModule, NavController } from '@ionic/angular';

import { AnswerExplanationComponent } from './answer-explanation.component';

describe('AnswerExplanationComponent', () => {
  let component: AnswerExplanationComponent;
  let fixture: ComponentFixture<AnswerExplanationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AnswerExplanationComponent],
      imports: [IonicModule.forRoot(), FormsModule],
      providers: [
        NavController,
        { provide: IonRouterOutlet, useValue: { canGoBack: () => true } },
        { provide: ActivatedRoute, useValue: { snapshot: { params: {} } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AnswerExplanationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});