import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StadisticsViewComponent } from './stadistics-view.component';

describe('StadisticsViewComponent', () => {
  let component: StadisticsViewComponent;
  let fixture: ComponentFixture<StadisticsViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StadisticsViewComponent]
    });
    fixture = TestBed.createComponent(StadisticsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
