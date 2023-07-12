import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultationListeReferentielsComponent } from './consultation-liste-referentiels.component';

describe('ConsultationListeReferentielsComponent', () => {
  let component: ConsultationListeReferentielsComponent;
  let fixture: ComponentFixture<ConsultationListeReferentielsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsultationListeReferentielsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultationListeReferentielsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
