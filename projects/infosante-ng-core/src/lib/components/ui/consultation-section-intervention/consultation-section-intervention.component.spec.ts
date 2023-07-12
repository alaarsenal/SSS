import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultationSectionInterventionComponent } from './consultation-section-intervention.component';

describe('ConsultationSectionInterventionComponent', () => {
  let component: ConsultationSectionInterventionComponent;
  let fixture: ComponentFixture<ConsultationSectionInterventionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsultationSectionInterventionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultationSectionInterventionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
