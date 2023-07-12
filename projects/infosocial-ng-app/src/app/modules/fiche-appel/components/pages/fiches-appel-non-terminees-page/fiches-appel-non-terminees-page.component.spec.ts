import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FichesAppelNonTermineesPageComponent } from './fiches-appel-non-terminees-page.component';

describe('FichesAppelNonTermineesPageComponent', () => {
  let component: FichesAppelNonTermineesPageComponent;
  let fixture: ComponentFixture<FichesAppelNonTermineesPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FichesAppelNonTermineesPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FichesAppelNonTermineesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
