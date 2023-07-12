import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAddressFromLinkedUsagerComponent } from './add-address-from-linked-usager.component';

describe('AddAddressFromLinkedUsagerComponent', () => {
  let component: AddAddressFromLinkedUsagerComponent;
  let fixture: ComponentFixture<AddAddressFromLinkedUsagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddAddressFromLinkedUsagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAddressFromLinkedUsagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
