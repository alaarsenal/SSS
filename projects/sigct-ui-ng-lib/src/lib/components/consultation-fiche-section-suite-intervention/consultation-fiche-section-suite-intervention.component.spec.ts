import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultationFicheSectionSuiteInterventionComponent } from './consultation-fiche-section-suite-intervention.component';

describe('ConsultationFicheSectionSuiteInterventionComponent', () => {
  let component: ConsultationFicheSectionSuiteInterventionComponent;
  let fixture: ComponentFixture<ConsultationFicheSectionSuiteInterventionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsultationFicheSectionSuiteInterventionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultationFicheSectionSuiteInterventionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
