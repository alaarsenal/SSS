import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutputMultiselectTextComponent } from './output-multiselect-text.component';

describe('OutputMultiselectTextComponent', () => {
  let component: OutputMultiselectTextComponent;
  let fixture: ComponentFixture<OutputMultiselectTextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutputMultiselectTextComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutputMultiselectTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
