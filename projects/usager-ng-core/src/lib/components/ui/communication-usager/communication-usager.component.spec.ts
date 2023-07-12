import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunicationUsagerComponent } from './communication-usager.component';

describe('CommunicationUsagerComponent', () => {
  let component: CommunicationUsagerComponent;
  let fixture: ComponentFixture<CommunicationUsagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommunicationUsagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunicationUsagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
