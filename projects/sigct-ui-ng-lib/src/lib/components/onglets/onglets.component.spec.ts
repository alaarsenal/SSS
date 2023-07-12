import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OngletsComponent } from './onglets.component';

describe('OngletsComponent', () => {
  let component: OngletsComponent;
  let fixture: ComponentFixture<OngletsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OngletsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OngletsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
