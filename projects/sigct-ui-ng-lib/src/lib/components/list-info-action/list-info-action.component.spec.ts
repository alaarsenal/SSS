import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListInfoActionComponent } from './list-info-action.component';

describe('ListInfoActionComponent', () => {
  let component: ListInfoActionComponent;
  let fixture: ComponentFixture<ListInfoActionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListInfoActionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListInfoActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
