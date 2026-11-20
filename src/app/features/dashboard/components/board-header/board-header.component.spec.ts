import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { BoardHeaderComponent } from './board-header.component'
import { DatabaseService } from 'src/app/core/services/database.service'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { appUser } from 'src/app/core/interfaces/interfaces'
import { StoryMutationService } from 'src/app/shared/services/story-mutation.service'
import { StoryExportService } from 'src/app/shared/services/story-export.service'

describe('BoardHeaderComponent', () => {
  let fixture: ComponentFixture<BoardHeaderComponent>
  let component: BoardHeaderComponent
  let activeStory: ActiveStoryService
  let database: DatabaseService
  const host = () => fixture.nativeElement as HTMLElement
  const switcher = () => host().querySelector<HTMLElement>('.switcherMenu')!

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardHeaderComponent],
      providers: [provideRouter([])],
    }).compileComponents()
    database = TestBed.inject(DatabaseService)
    database.user.set({ id: 'author-1', email: 'marta@example.com', profile: { user_name: 'marta' } } as unknown as appUser)
    spyOn(database, 'getAllTreesForUser').and.resolveTo([
      { id: 'story-1', name: 'The island' },
      { id: 'story-2', name: 'The lighthouse' },
    ])
    activeStory = TestBed.inject(ActiveStoryService)
    activeStory.load('story-1', 'The island', { nodes: [] })
    fixture = TestBed.createComponent(BoardHeaderComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()
    document.body.appendChild(host())
  })

  afterEach(() => host().remove())

  it('leads Home with a labelled button, not a logo, and names the story being edited', () => {
    const home = host().querySelector<HTMLAnchorElement>('a.home')!
    expect(home.getAttribute('href')).toBe('/dashboard')
    expect(home.textContent?.trim()).toBe('Home')
    expect(host().querySelector('polo-wordmark')).toBeNull()
    expect(host().querySelector<HTMLInputElement>('polo-editable-name input')!.value).toBe('The island')
    // No avatar: the account is in the menu at the other corner.
    expect(host().querySelector('polo-user-menu')).toBeNull()
  })

  it('switches between projects, for now one per story, by their address and marks the open one', () => {
    const trigger = host().querySelector<HTMLButtonElement>('.switcher')!
    expect(trigger.getAttribute('aria-label')).toBe('Switch project')
    expect(trigger.getAttribute('popovertarget')).toBe(switcher().id)
    trigger.click()
    expect(switcher().matches(':popover-open')).toBeTrue()

    const stories = Array.from(switcher().querySelectorAll<HTMLAnchorElement>('a.story'))
    expect(stories.map((link) => link.getAttribute('href'))).toEqual(['/story/story-1/board', '/story/story-2/board'])
    expect(stories.map((link) => link.getAttribute('aria-current'))).toEqual(['page', null])
    expect(switcher().querySelector('.switcherMenu__title')?.textContent).toContain('Your projects')
  })

  it('only switches projects, now that Home has its own button', () => {
    const links = Array.from(switcher().querySelectorAll<HTMLAnchorElement>('a')).map((link) => link.getAttribute('href'))
    expect(links).toEqual(['/story/story-1/board', '/story/story-2/board'])
  })

  it('says beside the name whether the story is saved, briefly', fakeAsync(() => {
    const save = spyOn(database, 'saveTreeToDB').and.returnValue(new Promise(() => undefined))
    TestBed.inject(StoryMutationService).update((draft) => { draft.nodes.push({ id: 'node_0', type: 'content', top: 0, left: 0 }) })
    flushMicrotasks()
    fixture.detectChanges()
    expect(save).toHaveBeenCalled()
    expect(host().querySelector('.header [role="status"]')?.textContent?.trim()).toBe('Saving…')
    expect(host().querySelector('.saveAlert')).toBeNull()
  }))

  it('explains a failed save under the header and lets the author retry', fakeAsync(() => {
    const save = spyOn(database, 'saveTreeToDB').and.resolveTo(false)
    const mutations = TestBed.inject(StoryMutationService)
    mutations.update((draft) => { draft.nodes.push({ id: 'node_0', type: 'content', top: 0, left: 0 }) })
    flushMicrotasks()
    fixture.detectChanges()

    expect(host().querySelector('.header .saveState--error')?.textContent).toContain('Not saved')
    // Only one status is announced: the explanation, not the short label too.
    expect(host().querySelectorAll('[role="status"]').length).toBe(1)
    expect(host().querySelector('.saveAlert [role="status"]')?.textContent).toContain('Board changes not saved')
    const retry = Array.from(host().querySelectorAll<HTMLButtonElement>('.saveAlert button')).find((button) => button.textContent?.includes('Retry save'))!
    save.and.resolveTo(true)
    retry.click()
    flushMicrotasks()
    fixture.detectChanges()
    expect(host().querySelector('.saveAlert')).toBeNull()
    expect(host().querySelector('.header [role="status"]')?.textContent).toContain('Saved')
    expect(save).toHaveBeenCalledTimes(2)
  }))

  it('offers reauthentication and export when the session ends, keeping the story', () => {
    database.authenticationRequired.set(true)
    fixture.detectChanges()
    const alert = host().querySelector('.saveAlert [role="alert"]')!
    expect(alert.textContent).toContain('Your session has ended')
    expect(alert.textContent).toContain('Sign in again')
    const download = spyOn(TestBed.inject(StoryExportService), 'downloadJson')
    Array.from(alert.querySelectorAll<HTMLButtonElement>('button')).find((button) => button.textContent?.includes('Export JSON'))!.click()
    expect(download).toHaveBeenCalledTimes(1)
    expect(activeStory.storyId()).toBe('story-1')
    database.authenticationRequired.set(false)
  })

  it('opens as wide as the header it hangs from', () => {
    host().querySelector<HTMLButtonElement>('.switcher')!.click()
    expect(switcher().getBoundingClientRect().width).toBeCloseTo(host().querySelector('.header')!.getBoundingClientRect().width, 0)
  })

  it('asks for a new project and closes the switcher', () => {
    const created = spyOn(component.newStory, 'emit')
    host().querySelector<HTMLButtonElement>('.switcher')!.click()
    switcher().querySelector<HTMLButtonElement>('button.switcherMenu__item')!.click()
    expect(created).toHaveBeenCalledTimes(1)
    expect(switcher().matches(':popover-open')).toBeFalse()
  })

  it('saves a new name and shows it in the switcher too', async () => {
    const save = spyOn(database, 'saveNewStoryName').and.resolveTo(true)
    spyOn(database, 'saveTreeToDB').and.resolveTo(true)
    const input = host().querySelector<HTMLInputElement>('polo-editable-name input')!
    input.value = 'The far island'
    input.dispatchEvent(new Event('change'))
    await fixture.whenStable()
    fixture.detectChanges()
    expect(save).toHaveBeenCalledOnceWith('story-1', 'The far island')
    expect(activeStory.storyName()).toBe('The far island')
    expect(switcher().querySelector('a.story')?.textContent).toContain('The far island')
  })
})
