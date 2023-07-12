import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PiloterTablesReferencesSectionCriteresRechercheComponent } from './piloter-tables-references-section-criteres-recherche.component';

describe('PiloterTablesReferencesSectionCriteresRecherccheComponent', () => {
  let component: PiloterTablesReferencesSectionCriteresRechercheComponent;
  let fixture: ComponentFixture<PiloterTablesReferencesSectionCriteresRechercheComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PiloterTablesReferencesSectionCriteresRechercheComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PiloterTablesReferencesSectionCriteresRechercheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
