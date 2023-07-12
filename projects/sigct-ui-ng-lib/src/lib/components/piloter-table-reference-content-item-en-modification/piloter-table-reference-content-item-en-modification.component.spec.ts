import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PiloterTableReferenceContenItemEnModificationComponent } from './piloter-table-reference-content-item-en-modification.component';

describe('PiloterTableReferenceContenItemEnModificationComponent', () => {
  let component: PiloterTableReferenceContenItemEnModificationComponent;
  let fixture: ComponentFixture<PiloterTableReferenceContenItemEnModificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PiloterTableReferenceContenItemEnModificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PiloterTableReferenceContenItemEnModificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
