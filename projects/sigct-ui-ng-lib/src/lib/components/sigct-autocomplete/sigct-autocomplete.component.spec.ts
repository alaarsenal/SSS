import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SigctAutocompleteComponent } from './sigct-autocomplete.component';

describe('SigctAutocompleteComponent', () => {
  let component: SigctAutocompleteComponent;
  let fixture: ComponentFixture<SigctAutocompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SigctAutocompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SigctAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
