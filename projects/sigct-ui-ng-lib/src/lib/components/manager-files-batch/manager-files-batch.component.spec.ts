import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerFilesBatchComponent } from './manager-files-batch.component';

describe('ManagerFilesBatchComponent', () => {
  let component: ManagerFilesBatchComponent;
  let fixture: ComponentFixture<ManagerFilesBatchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManagerFilesBatchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagerFilesBatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
