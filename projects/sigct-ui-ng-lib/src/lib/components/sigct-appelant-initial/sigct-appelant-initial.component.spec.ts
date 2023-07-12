import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SigctAppelantInitialComponent } from './sigct-appelant-initial.component';

describe('SigctAppelantInitialComponent', () => {
  let component: SigctAppelantInitialComponent;
  let fixture: ComponentFixture<SigctAppelantInitialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SigctAppelantInitialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SigctAppelantInitialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
