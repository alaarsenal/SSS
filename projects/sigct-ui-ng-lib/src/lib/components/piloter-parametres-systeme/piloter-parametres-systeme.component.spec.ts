import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PiloterParametresSystemeComponent } from './piloter-parametres-systeme.component';

describe('PiloterParametresSystemeComponent', () => {
  let component: PiloterParametresSystemeComponent;
  let fixture: ComponentFixture<PiloterParametresSystemeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PiloterParametresSystemeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PiloterParametresSystemeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
