import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeErrorNotifierComponent } from './tree-error-notifier.component';

describe('TreeErrorNotifierComponent', () => {
  let component: TreeErrorNotifierComponent;
  let fixture: ComponentFixture<TreeErrorNotifierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreeErrorNotifierComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TreeErrorNotifierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
