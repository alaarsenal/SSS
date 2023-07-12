import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditerUsagerContainerComponent } from './editer-usager-container.component';

describe('EditerUsagerComponent', () => {
  let component: EditerUsagerContainerComponent;
  let fixture: ComponentFixture<EditerUsagerContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditerUsagerContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditerUsagerContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
