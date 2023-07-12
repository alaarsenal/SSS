import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfosocialNgCoreComponent } from './infosocial-ng-core.component';

describe('InfosocialNgCoreComponent', () => {
  let component: InfosocialNgCoreComponent;
  let fixture: ComponentFixture<InfosocialNgCoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfosocialNgCoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfosocialNgCoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
