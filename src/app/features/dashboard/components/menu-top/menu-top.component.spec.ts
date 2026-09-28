import { ComponentFixture, TestBed } from '@angular/core/testing'

import { MenuTopComponent } from './menu-top.component'
import { DatabaseService } from 'src/app/core/services/database.service'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'

describe('MenuTopComponent', () => {
  let component: MenuTopComponent
  let fixture: ComponentFixture<MenuTopComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuTopComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(MenuTopComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('saves the story name from the shared editor', async () => {
    const activeStory = TestBed.inject(ActiveStoryService)
    activeStory.load('story-1', 'Original story', { nodes: [] })
    const save = spyOn(TestBed.inject(DatabaseService), 'saveNewStoryName').and.resolveTo(true)
    fixture.detectChanges()
    const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('polo-editable-name input')!
    expect(input.value).toBe('Original story')
    input.value = 'New story'
    input.dispatchEvent(new Event('change'))
    await Promise.resolve()
    expect(save).toHaveBeenCalledOnceWith('story-1', 'New story')
    expect(activeStory.storyName()).toBe('New story')
  })
})
