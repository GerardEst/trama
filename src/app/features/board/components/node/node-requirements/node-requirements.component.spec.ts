import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeRequirementsComponent } from './node-requirements.component';

describe('NodeRequirementsComponent', () => {
  let component: NodeRequirementsComponent;
  let fixture: ComponentFixture<NodeRequirementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NodeRequirementsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NodeRequirementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
