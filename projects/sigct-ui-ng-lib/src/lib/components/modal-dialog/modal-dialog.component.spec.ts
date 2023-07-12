import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MssModalComponent } from './modal-dialog.component';

describe('ModalDialogComponent', () => {
  let component: MssModalComponent;
  let fixture: ComponentFixture<MssModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MssModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MssModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
