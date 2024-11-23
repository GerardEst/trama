import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareStoryComponent } from './share-story.component';

describe('ShareStoryComponent', () => {
  let component: ShareStoryComponent;
  let fixture: ComponentFixture<ShareStoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareStoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShareStoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
