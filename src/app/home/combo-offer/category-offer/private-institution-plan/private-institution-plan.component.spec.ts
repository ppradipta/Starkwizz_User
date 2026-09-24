import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PrivateInstitutionPlanComponent } from './private-institution-plan.component';

describe('PrivateInstitutionPlanComponent', () => {
  let component: PrivateInstitutionPlanComponent;
  let fixture: ComponentFixture<PrivateInstitutionPlanComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PrivateInstitutionPlanComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PrivateInstitutionPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
