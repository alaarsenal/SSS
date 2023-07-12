import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MsssUiComponent } from './msss-ui.component';


describe('MsssUiComponent', () => {
  let component: MsssUiComponent;
  let fixture: ComponentFixture<MsssUiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MsssUiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MsssUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
