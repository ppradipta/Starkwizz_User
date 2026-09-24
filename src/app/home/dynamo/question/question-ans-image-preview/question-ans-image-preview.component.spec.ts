import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { QuestionAnsImagePreviewComponent } from './question-ans-image-preview.component';

describe('QuestionAnsImagePreviewComponent', () => {
  let component: QuestionAnsImagePreviewComponent;
  let fixture: ComponentFixture<QuestionAnsImagePreviewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestionAnsImagePreviewComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionAnsImagePreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
