import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PiloterTableReferenceContentItemEnAjoutComponent } from './piloter-table-reference-content-item-en-ajout.component';

describe('PiloterTableReferenceContentItemEnAjoutComponent', () => {
  let component: PiloterTableReferenceContentItemEnAjoutComponent;
  let fixture: ComponentFixture<PiloterTableReferenceContentItemEnAjoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PiloterTableReferenceContentItemEnAjoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PiloterTableReferenceContentItemEnAjoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
