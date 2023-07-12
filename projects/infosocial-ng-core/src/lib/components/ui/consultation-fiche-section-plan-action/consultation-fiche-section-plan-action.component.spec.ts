import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultationFicheSectionPlanActionComponent } from './consultation-fiche-section-plan-action.component';

describe('ConsultationFicheSectionPlanActionComponent', () => {
  let component: ConsultationFicheSectionPlanActionComponent;
  let fixture: ComponentFixture<ConsultationFicheSectionPlanActionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsultationFicheSectionPlanActionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultationFicheSectionPlanActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
