import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RechercherUsagerPageComponent } from './rechercher-usager-page.component';

describe('RechercherUsagerPageComponent', () => {
  let component: RechercherUsagerPageComponent;
  let fixture: ComponentFixture<RechercherUsagerPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RechercherUsagerPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RechercherUsagerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
