import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeAddEventComponent } from './node-add-event.component';

describe('NodeAddEventComponent', () => {
  let component: NodeAddEventComponent;
  let fixture: ComponentFixture<NodeAddEventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NodeAddEventComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NodeAddEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
