import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectOrCreateComponent } from './select-or-create.component';

describe('SelectOrCreateComponent', () => {
  let component: SelectOrCreateComponent;
  let fixture: ComponentFixture<SelectOrCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectOrCreateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SelectOrCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
