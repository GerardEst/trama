import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameNodeComponent } from './game-node.component';

describe('GameNodeComponent', () => {
  let component: GameNodeComponent;
  let fixture: ComponentFixture<GameNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameNodeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GameNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
