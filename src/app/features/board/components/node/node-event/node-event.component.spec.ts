import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeEventComponent } from './node-event.component';

describe('NodeEventComponent', () => {
  let component: NodeEventComponent;
  let fixture: ComponentFixture<NodeEventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NodeEventComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NodeEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
