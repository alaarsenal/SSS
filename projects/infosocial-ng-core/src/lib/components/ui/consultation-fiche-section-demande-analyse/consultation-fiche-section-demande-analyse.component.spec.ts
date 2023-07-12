import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultationFicheSectionDemandeAnalyseComponent } from './consultation-fiche-section-demande-analyse.component';

describe('ConsultationFicheSectionDemandeAnalyseComponent', () => {
  let component: ConsultationFicheSectionDemandeAnalyseComponent;
  let fixture: ComponentFixture<ConsultationFicheSectionDemandeAnalyseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsultationFicheSectionDemandeAnalyseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultationFicheSectionDemandeAnalyseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
