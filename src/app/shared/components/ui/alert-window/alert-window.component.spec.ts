import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertWindowComponent } from './alert-window.component';

describe('AlertWindowComponent', () => {
  let component: AlertWindowComponent;
  let fixture: ComponentFixture<AlertWindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertWindowComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AlertWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
