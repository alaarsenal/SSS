import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsulterUsagerPageComponent } from './consulter-usager-page.component';

describe('ConsulterUsagerPageComponent', () => {
  let component: ConsulterUsagerPageComponent;
  let fixture: ComponentFixture<ConsulterUsagerPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsulterUsagerPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsulterUsagerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
