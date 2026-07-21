import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'

import { ShareStoryComponent } from './share-story.component'

describe('ShareStoryComponent', () => {
  let component: ShareStoryComponent
  let fixture: ComponentFixture<ShareStoryComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareStoryComponent, NoopAnimationsModule],
    }).compileComponents()

    fixture = TestBed.createComponent(ShareStoryComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
