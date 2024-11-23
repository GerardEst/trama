import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinsManagerComponent } from './joins-manager.component';

describe('JoinsManagerComponent', () => {
  let component: JoinsManagerComponent;
  let fixture: ComponentFixture<JoinsManagerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [JoinsManagerComponent]
    });
    fixture = TestBed.createComponent(JoinsManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
