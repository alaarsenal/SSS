import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PiloterParametresSystemeEnModificationComponent } from './piloter-parametres-systeme-en-modification.component';

describe('PiloterParametresSystemeEnModificationComponent', () => {
  let component: PiloterParametresSystemeEnModificationComponent;
  let fixture: ComponentFixture<PiloterParametresSystemeEnModificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PiloterParametresSystemeEnModificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PiloterParametresSystemeEnModificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
