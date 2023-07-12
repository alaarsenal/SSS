import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RRSSComponent } from './rrss.component';

describe('RRSSComponent', () => {
  let component: RRSSComponent;
  let fixture: ComponentFixture<RRSSComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RRSSComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RRSSComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
