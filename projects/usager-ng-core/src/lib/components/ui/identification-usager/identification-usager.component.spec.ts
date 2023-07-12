import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentificationUsagerComponent } from './identification-usager.component';

describe('IdentificationUsagerComponent', () => {
  let component: IdentificationUsagerComponent;
  let fixture: ComponentFixture<IdentificationUsagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IdentificationUsagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IdentificationUsagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
