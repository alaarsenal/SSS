import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PiloterTablesReferencesComponent } from './piloter-tables-references.component';

describe('PiloterTablesReferencesComponent', () => {
  let component: PiloterTablesReferencesComponent;
  let fixture: ComponentFixture<PiloterTablesReferencesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PiloterTablesReferencesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PiloterTablesReferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
