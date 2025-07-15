import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeRequirementComponent } from './node-requirement.component';

describe('NodeRequirementComponent', () => {
  let component: NodeRequirementComponent;
  let fixture: ComponentFixture<NodeRequirementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NodeRequirementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NodeRequirementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
