import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InformationsSuppUsagerComponent } from './informations-supp-usager.component';

describe('InformationsSuppUsagerComponent', () => {
  let component: InformationsSuppUsagerComponent;
  let fixture: ComponentFixture<InformationsSuppUsagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InformationsSuppUsagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InformationsSuppUsagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
