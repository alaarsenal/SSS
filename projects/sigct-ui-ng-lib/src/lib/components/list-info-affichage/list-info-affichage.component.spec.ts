import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListInfoAffichageComponent } from './list-info-affichage.component';

describe('ListInfoAffichageComponent', () => {
  let component: ListInfoAffichageComponent;
  let fixture: ComponentFixture<ListInfoAffichageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListInfoAffichageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListInfoAffichageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
