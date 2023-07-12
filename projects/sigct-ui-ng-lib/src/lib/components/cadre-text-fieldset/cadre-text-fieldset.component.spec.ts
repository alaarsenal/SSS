import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CadreTextFieldsetComponent } from './cadre-text-fieldset.component';

describe('CadreTextFieldsetComponent', () => {
  let component: CadreTextFieldsetComponent;
  let fixture: ComponentFixture<CadreTextFieldsetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CadreTextFieldsetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CadreTextFieldsetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
