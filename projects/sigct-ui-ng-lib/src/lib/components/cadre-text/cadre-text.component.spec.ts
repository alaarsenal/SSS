import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CadreTextComponent } from './cadre-text.component';

describe('CadreTextComponent', () => {
  let component: CadreTextComponent;
  let fixture: ComponentFixture<CadreTextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CadreTextComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CadreTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
