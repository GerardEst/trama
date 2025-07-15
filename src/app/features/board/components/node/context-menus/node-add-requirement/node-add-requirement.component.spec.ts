import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeAddRequirementComponent } from './node-add-requirement.component';

describe('NodeAddRequirementComponent', () => {
  let component: NodeAddRequirementComponent;
  let fixture: ComponentFixture<NodeAddRequirementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NodeAddRequirementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NodeAddRequirementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
