import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayVerticalListByTitleComponent } from './display-vertical-list-by-title.component';

describe('DisplayVerticalListByTitleComponent', () => {
  let component: DisplayVerticalListByTitleComponent;
  let fixture: ComponentFixture<DisplayVerticalListByTitleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisplayVerticalListByTitleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayVerticalListByTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
