import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StadisticsLayerComponent } from './stadistics-layer.component';

describe('StadisticsLayerComponent', () => {
  let component: StadisticsLayerComponent;
  let fixture: ComponentFixture<StadisticsLayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StadisticsLayerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StadisticsLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
