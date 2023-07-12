import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCommunicationFromLinkedUsagerComponent } from './add-communication-from-linked-usager.component';

describe('AddCommunicationFromLinkedUsagerComponent', () => {
  let component: AddCommunicationFromLinkedUsagerComponent;
  let fixture: ComponentFixture<AddCommunicationFromLinkedUsagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddCommunicationFromLinkedUsagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCommunicationFromLinkedUsagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
