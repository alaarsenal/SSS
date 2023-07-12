import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormTopBarComponent } from './form-top-bar.component';

describe('FormTopBarComponent', () => {
  let component: FormTopBarComponent;
  let fixture: ComponentFixture<FormTopBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormTopBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormTopBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
