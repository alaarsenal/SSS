import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SigctGroupeAgeComponent } from './sigct-groupe-age.component';

describe('SigctGroupeAgeComponent', () => {
  let component: SigctGroupeAgeComponent;
  let fixture: ComponentFixture<SigctGroupeAgeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SigctGroupeAgeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SigctGroupeAgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
