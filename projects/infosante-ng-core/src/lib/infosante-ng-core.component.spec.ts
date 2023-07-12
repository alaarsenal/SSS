import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfosanteNgCoreComponent } from './infosante-ng-core.component';

describe('InfosanteNgCoreComponent', () => {
  let component: InfosanteNgCoreComponent;
  let fixture: ComponentFixture<InfosanteNgCoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfosanteNgCoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfosanteNgCoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
