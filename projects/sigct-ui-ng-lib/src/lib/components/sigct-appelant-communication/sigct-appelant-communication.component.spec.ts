import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SigctAppelantCommunicationComponent } from './sigct-appelant-communication.component';

describe('SigctAppelantInitialCommunicationComponent', () => {
  let component: SigctAppelantCommunicationComponent;
  let fixture: ComponentFixture<SigctAppelantCommunicationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SigctAppelantCommunicationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SigctAppelantCommunicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
