import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BienvenueTopBarComponent } from './bienvenue-top-bar.component';

describe('BienvenueTopBarComponent', () => {
  let component: BienvenueTopBarComponent;
  let fixture: ComponentFixture<BienvenueTopBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BienvenueTopBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BienvenueTopBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
