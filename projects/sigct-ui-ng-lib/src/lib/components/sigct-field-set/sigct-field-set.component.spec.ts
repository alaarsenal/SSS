import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SigctFieldSetComponent } from './sigct-field-set.component';

describe('SigctFieldSetComponent', () => {
  let component: SigctFieldSetComponent;
  let fixture: ComponentFixture<SigctFieldSetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SigctFieldSetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SigctFieldSetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
