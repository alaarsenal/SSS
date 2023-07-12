import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsulterUiComponent } from './consulter-ui-component.component';

describe('ConsulterUiComponentComponent', () => {
  let component: ConsulterUiComponent;
  let fixture: ComponentFixture<ConsulterUiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsulterUiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsulterUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
