import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeDistributorComponent } from './node-distributor.component';

describe('NodeDistributorComponent', () => {
  let component: NodeDistributorComponent;
  let fixture: ComponentFixture<NodeDistributorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NodeDistributorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NodeDistributorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
