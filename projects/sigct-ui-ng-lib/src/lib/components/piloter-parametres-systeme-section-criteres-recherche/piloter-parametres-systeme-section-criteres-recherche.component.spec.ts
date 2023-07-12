import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PiloterParametresSystemeSectionCriteresRechercheComponent } from './piloter-parametres-systeme-section-criteres-recherche.component';

describe('PiloterParametresSystemeSectionCriteresRechercheComponent', () => {
  let component: PiloterParametresSystemeSectionCriteresRechercheComponent;
  let fixture: ComponentFixture<PiloterParametresSystemeSectionCriteresRechercheComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PiloterParametresSystemeSectionCriteresRechercheComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PiloterParametresSystemeSectionCriteresRechercheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
