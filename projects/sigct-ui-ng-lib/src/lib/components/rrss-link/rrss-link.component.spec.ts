import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RrssLinkComponent } from './rrss-link.component';

describe('RrssLinkComponent', () => {
  let component: RrssLinkComponent;
  let fixture: ComponentFixture<RrssLinkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RrssLinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RrssLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
