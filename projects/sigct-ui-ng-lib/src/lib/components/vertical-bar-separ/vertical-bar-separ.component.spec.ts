import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerticalBarSeparComponent } from './vertical-bar-separ.component';

describe('VerticalBarSeparComponent', () => {
  let component: VerticalBarSeparComponent;
  let fixture: ComponentFixture<VerticalBarSeparComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerticalBarSeparComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerticalBarSeparComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
