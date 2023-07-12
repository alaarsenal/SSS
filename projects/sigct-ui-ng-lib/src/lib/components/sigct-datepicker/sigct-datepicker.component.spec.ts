import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SigctDatepickerComponent } from './sigct-datepicker.component';

describe('SigctDatepickerComponent', () => {
  let component: SigctDatepickerComponent;
  let fixture: ComponentFixture<SigctDatepickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SigctDatepickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SigctDatepickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
