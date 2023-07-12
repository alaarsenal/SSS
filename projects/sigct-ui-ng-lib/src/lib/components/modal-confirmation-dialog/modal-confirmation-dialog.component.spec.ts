import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalConfirmationDialogComponent } from './modal-confirmation-dialog.component';

describe('ModalConfirmationDialogComponent', () => {
  let component: ModalConfirmationDialogComponent;
  let fixture: ComponentFixture<ModalConfirmationDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalConfirmationDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
