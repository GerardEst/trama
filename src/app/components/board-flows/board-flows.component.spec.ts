import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardFlowsComponent } from './board-flows.component';

describe('BoardFlowsComponent', () => {
  let component: BoardFlowsComponent;
  let fixture: ComponentFixture<BoardFlowsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BoardFlowsComponent]
    });
    fixture = TestBed.createComponent(BoardFlowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
