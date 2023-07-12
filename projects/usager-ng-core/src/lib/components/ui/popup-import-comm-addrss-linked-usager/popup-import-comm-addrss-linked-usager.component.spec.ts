import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupImportCommAddrssLinkedUsagerComponent } from './popup-import-comm-addrss-linked-usager.component';

describe('PopupImportCommAddrssLinkedUsagerComponent', () => {
  let component: PopupImportCommAddrssLinkedUsagerComponent;
  let fixture: ComponentFixture<PopupImportCommAddrssLinkedUsagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupImportCommAddrssLinkedUsagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupImportCommAddrssLinkedUsagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
