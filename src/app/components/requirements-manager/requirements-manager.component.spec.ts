import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequirementsManagerComponent } from './requirements-manager.component';

describe('RequirementsManagerComponent', () => {
  let component: RequirementsManagerComponent;
  let fixture: ComponentFixture<RequirementsManagerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RequirementsManagerComponent]
    });
    fixture = TestBed.createComponent(RequirementsManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
