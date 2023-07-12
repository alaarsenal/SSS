import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FichesAppelNonTermineesComponent } from './fiches-appel-non-terminees.component';

describe('FichesAppelNonTermineesComponent', () => {
  let component: FichesAppelNonTermineesComponent;
  let fixture: ComponentFixture<FichesAppelNonTermineesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FichesAppelNonTermineesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FichesAppelNonTermineesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
