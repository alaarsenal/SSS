import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditerFichiersAttachesComponent } from './editer-fichiers-attaches.component';

describe('EditerFichiersAttachesComponent', () => {
  let component: EditerFichiersAttachesComponent;
  let fixture: ComponentFixture<EditerFichiersAttachesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditerFichiersAttachesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditerFichiersAttachesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
