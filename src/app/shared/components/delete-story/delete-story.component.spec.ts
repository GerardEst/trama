import { ComponentFixture, TestBed } from '@angular/core/testing'

import { DeleteStoryComponent } from './delete-story.component'

describe('DeleteStoryComponent', () => {
  let component: DeleteStoryComponent
  let fixture: ComponentFixture<DeleteStoryComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteStoryComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(DeleteStoryComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('names the story it is about to delete', () => {
    const text = () => (fixture.nativeElement as HTMLElement).textContent
    expect(text()).toContain('Are you sure you want to delete this story?')
    fixture.componentRef.setInput('storyName', 'The island')
    fixture.detectChanges()
    expect(text()).toContain('Are you sure you want to delete “The island”?')
  })
})
