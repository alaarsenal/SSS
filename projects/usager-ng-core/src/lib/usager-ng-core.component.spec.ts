import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsagerNgCoreComponent } from './usager-ng-core.component';

describe('UsagerNgCoreComponent', () => {
  let component: UsagerNgCoreComponent;
  let fixture: ComponentFixture<UsagerNgCoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsagerNgCoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsagerNgCoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
