import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditerUsagerPageComponent } from './editer-usager-page.component';

describe('EditerUsagerPageComponent', () => {
  let component: EditerUsagerPageComponent;
  let fixture: ComponentFixture<EditerUsagerPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditerUsagerPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditerUsagerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
