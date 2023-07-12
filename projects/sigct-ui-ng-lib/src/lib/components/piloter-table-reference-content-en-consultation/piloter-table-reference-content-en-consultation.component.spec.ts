import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PiloterTableReferenceContentEnConsultationComponent } from './piloter-table-reference-content-en-consultation.component';

describe('PiloterTableReferenceEnConsultationComponent', () => {
  let component: PiloterTableReferenceContentEnConsultationComponent;
  let fixture: ComponentFixture<PiloterTableReferenceContentEnConsultationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PiloterTableReferenceContentEnConsultationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PiloterTableReferenceContentEnConsultationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
