import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuTreeLegendComponent } from './menu-tree-legend.component';

describe('MenuTreeLegendComponent', () => {
  let component: MenuTreeLegendComponent;
  let fixture: ComponentFixture<MenuTreeLegendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuTreeLegendComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MenuTreeLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
