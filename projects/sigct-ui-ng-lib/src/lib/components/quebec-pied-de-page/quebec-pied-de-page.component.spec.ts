import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuebecPiedDePageComponent } from './quebec-pied-de-page.component';

describe('QuebecPiedDePageComponent', () => {
  let component: QuebecPiedDePageComponent;
  let fixture: ComponentFixture<QuebecPiedDePageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuebecPiedDePageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuebecPiedDePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
