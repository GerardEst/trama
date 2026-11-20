import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter, Router } from '@angular/router'
import { StoryGeneralComponent } from './general.component'
import { DatabaseService } from 'src/app/core/services/database.service'
import { AlertService } from 'src/app/core/services/alert.service'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { StoryExportService } from 'src/app/shared/services/story-export.service'
import { DeleteStoryComponent } from 'src/app/shared/components/delete-story/delete-story.component'

describe('StoryGeneralComponent', () => {
  let fixture: ComponentFixture<StoryGeneralComponent>
  let database: DatabaseService
  let activeStory: ActiveStoryService
  const host = () => fixture.nativeElement as HTMLElement

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoryGeneralComponent],
      providers: [provideRouter([])],
    }).compileComponents()
    database = TestBed.inject(DatabaseService)
    activeStory = TestBed.inject(ActiveStoryService)
    activeStory.load('story-1', 'The island', { nodes: [] })
    fixture = TestBed.createComponent(StoryGeneralComponent)
    fixture.detectChanges()
  })

  it('renames the story and says it was saved', async () => {
    const save = spyOn(database, 'saveNewStoryName').and.resolveTo(true)
    const input = host().querySelector<HTMLInputElement>('.nameInput')!
    expect(input.value).toBe('The island')
    input.value = '  The far island '
    host().querySelector('form')!.dispatchEvent(new Event('submit'))
    await fixture.whenStable()
    fixture.detectChanges()
    expect(save).toHaveBeenCalledOnceWith('story-1', 'The far island')
    expect(activeStory.storyName()).toBe('The far island')
    expect(host().querySelector('.feedback')?.textContent).toContain('Name saved.')
  })

  it('says when the name could not be saved and keeps the old one', async () => {
    spyOn(database, 'saveNewStoryName').and.resolveTo(false)
    host().querySelector<HTMLInputElement>('.nameInput')!.value = 'Another name'
    host().querySelector('form')!.dispatchEvent(new Event('submit'))
    await fixture.whenStable()
    fixture.detectChanges()
    expect(activeStory.storyName()).toBe('The island')
    expect(host().querySelector('.feedback--error')?.textContent).toContain('could not be saved')
  })

  it('publishes every story under the creator profile until brands exist', () => {
    database.user.set({ id: 'author-1', profile: { user_name: 'marta' } } as never)
    fixture.detectChanges()
    const select = host().querySelector<HTMLSelectElement>('.identitySelect')!
    expect(select.disabled).toBeTrue()
    expect(select.textContent).toContain('marta (creator profile)')
  })

  it('shows the same options as the editor and exports the story', () => {
    expect(host().querySelector('polo-story-options')).toBeTruthy()
    const download = spyOn(TestBed.inject(StoryExportService), 'downloadJson')
    Array.from(host().querySelectorAll<HTMLButtonElement>('.button')).find((button) => button.textContent?.includes('Export JSON'))!.click()
    expect(download).toHaveBeenCalledTimes(1)
  })

  it('holds the sharing settings too, the same as the sharing dialog', () => {
    const section = host().querySelector('[aria-labelledby="story-sharing-title"]')!
    expect(section.querySelector('h2')?.textContent).toContain('Sharing')
    expect(section.querySelector('polo-share-story')).not.toBeNull()
  })

  it('deletes the story after confirming it by name and goes back to the dashboard', async () => {
    const confirm = spyOn(TestBed.inject(AlertService), 'launch').and.resolveTo(true)
    const remove = spyOn(database, 'deleteStory').and.resolveTo(null)
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true)
    host().querySelector<HTMLButtonElement>('.button--danger')!.click()
    await fixture.whenStable()
    expect(confirm).toHaveBeenCalledOnceWith(DeleteStoryComponent, { storyName: 'The island' })
    expect(remove).toHaveBeenCalledOnceWith('story-1')
    expect(activeStory.storyId()).toBe('')
    expect(navigate).toHaveBeenCalledOnceWith(['/dashboard'])
  })

  it('stays on the story when it could not be deleted', async () => {
    spyOn(TestBed.inject(AlertService), 'launch').and.resolveTo(true)
    spyOn(database, 'deleteStory').and.rejectWith(new Error('denied'))
    const navigate = spyOn(TestBed.inject(Router), 'navigate')
    host().querySelector<HTMLButtonElement>('.button--danger')!.click()
    await fixture.whenStable()
    fixture.detectChanges()
    expect(navigate).not.toHaveBeenCalled()
    expect(activeStory.storyId()).toBe('story-1')
    expect(host().querySelector('[role="alert"]')?.textContent).toContain('could not be deleted')
  })
})
