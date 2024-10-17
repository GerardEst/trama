import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoryNotFoundComponent } from './story-not-found.component';

describe('StoryNotFoundComponent', () => {
  let component: StoryNotFoundComponent;
  let fixture: ComponentFixture<StoryNotFoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoryNotFoundComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StoryNotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
