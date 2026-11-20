import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter, Router } from '@angular/router'
import { OverviewComponent, RECENT_DAYS } from './overview.component'
import { DatabaseService } from 'src/app/core/services/database.service'
import { StoryOverview } from 'src/app/core/interfaces/story-overview'
import { StoryOpenerService } from 'src/app/shared/services/story-opener.service'
import { ModalService } from 'src/app/core/services/modal.service'
import { ShareStoryComponent } from 'src/app/features/dashboard/modals/share-story/share-story.component'
import { appUser } from 'src/app/core/interfaces/interfaces'
import { AlertService } from 'src/app/core/services/alert.service'
import { DeleteStoryComponent } from 'src/app/shared/components/delete-story/delete-story.component'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'

describe('OverviewComponent', () => {
  let fixture: ComponentFixture<OverviewComponent>
  let component: OverviewComponent
  let database: DatabaseService
  const stories: StoryOverview[] = [
    { id: 'story-1', name: 'The island', slug: 'the-island', tracking: true, plays: 12, recentPlays: 3, lastPlayedAt: '2026-11-10T09:00:00Z', editedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString() },
    { id: 'story-2', name: 'Draft', slug: null, tracking: false, plays: 0, recentPlays: 0, lastPlayedAt: null, editedAt: null },
  ]

  let previousStoryId: string | null
  beforeEach(() => { previousStoryId = localStorage.getItem('polo-id') })
  afterEach(() => {
    if (previousStoryId === null) localStorage.removeItem('polo-id')
    else localStorage.setItem('polo-id', previousStoryId)
  })

  async function render(overview: StoryOverview[] | null) {
    await TestBed.configureTestingModule({
      imports: [OverviewComponent],
      providers: [provideRouter([])],
    }).compileComponents()
    database = TestBed.inject(DatabaseService)
    database.user.set({ id: 'author-1', profile: { user_name: 'Author' } } as unknown as appUser)
    spyOn(database, 'getStoriesOverview').and.resolveTo(overview)
    fixture = TestBed.createComponent(OverviewComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()
  }

  const host = () => fixture.nativeElement as HTMLElement
  const cards = () => Array.from(host().querySelectorAll('.card'))

  it('asks for the plays of the author since the start of the recent window', async () => {
    const before = Date.now()
    await render(stories)
    const [userId, since] = (database.getStoriesOverview as jasmine.Spy).calls.mostRecent().args
    expect(userId).toBe('author-1')
    const windowMs = RECENT_DAYS * 24 * 60 * 60 * 1000
    expect(before - since.getTime()).toBeGreaterThanOrEqual(windowMs - 1000)
    expect(before - since.getTime()).toBeLessThanOrEqual(windowMs + 1000)
  })

  it('adds up the activity of every story and shows one card per story', async () => {
    await render(stories)
    expect(component.totals()).toEqual({ stories: 2, tracked: 1, plays: 12, recentPlays: 3 })
    // The recent plays stand alone, so their window is not read as the whole list's.
    expect(host().querySelector('.activity__number')?.textContent?.trim()).toBe('3')
    expect(host().querySelector('.activity__caption')?.textContent).toContain('last 30 days')
    const activity = Array.from(host().querySelectorAll('.activity dd')).map((dd) => dd.textContent?.trim())
    expect(activity).toEqual(['12', '2', '1 of 2'])
    expect(cards().length).toBe(2)
    expect(cards()[0].querySelector('.card__address')?.textContent).toContain('/the-island')
  })

  it('warns only on the stories that do not record plays', async () => {
    await render(stories)
    expect(cards()[0].querySelector('.tag')).toBeNull()
    expect(cards()[1].querySelector('.tag')).not.toBeNull()
  })

  it('opens each story from its card and keeps the editor, its options, sharing and statistics in the card menu', async () => {
    await render(stories)
    expect(cards()[0].querySelector('.card__link')?.getAttribute('href')).toBe('/story/story-1/board')
    const more = cards()[0].querySelector<HTMLButtonElement>('.card__more')!
    const menu = cards()[0].querySelector<HTMLElement>('.storyMenu')!
    expect(more.getAttribute('aria-label')).toBe('More actions for The island')
    expect(more.getAttribute('popovertarget')).toBe(menu.id)
    expect(Array.from(menu.querySelectorAll('a')).map((link) => link.getAttribute('href'))).toEqual(['/story/story-1/board', '/story/story-1', '/story/story-1/statistics'])
    // Sharing opens its dialog in place instead of leading to another page.
    expect(Array.from(menu.querySelectorAll('button')).map((item) => item.textContent?.trim())).toEqual(['Share', 'Delete'])
    expect(cards()[0].querySelector('.card__foot')?.textContent).toContain('Edited 2 hours ago')
  })

  it('continues with the story last opened here, or else the last one edited', async () => {
    localStorage.setItem('polo-id', 'story-2')
    await render(stories)
    expect(host().querySelector('.continue__name')?.textContent).toContain('Draft')
    expect(host().querySelector('.continue a')?.getAttribute('href')).toBe('/story/story-2/board')

    localStorage.setItem('polo-id', 'a-deleted-story')
    component.stories.set([...stories])
    fixture.detectChanges()
    expect(host().querySelector('.continue__name')?.textContent).toContain('The island')
    expect(host().querySelector('.continue__meta')?.textContent).toContain('Edited 2 hours ago')
  })

  it('deletes a story only after the author confirms it by name', async () => {
    await render(stories)
    localStorage.setItem('polo-id', 'story-1')
    const confirm = spyOn(TestBed.inject(AlertService), 'launch').and.resolveTo(false)
    const remove = spyOn(database, 'deleteStory').and.resolveTo(null)
    const deleteButton = () => cards()[0].querySelector<HTMLButtonElement>('.storyMenu__item--danger')!

    deleteButton().click()
    await fixture.whenStable()
    expect(confirm).toHaveBeenCalledOnceWith(DeleteStoryComponent, { storyName: 'The island' })
    expect(remove).not.toHaveBeenCalled()

    confirm.and.resolveTo(true)
    deleteButton().click()
    await fixture.whenStable()
    fixture.detectChanges()
    expect(remove).toHaveBeenCalledOnceWith('story-1')
    expect(cards().length).toBe(1)
    expect(component.totals().stories).toBe(1)
    expect(localStorage.getItem('polo-id')).toBeNull()
  })

  it('closes a deleted story that was open, so opening it again says it is gone', async () => {
    await render(stories)
    const activeStory = TestBed.inject(ActiveStoryService)
    activeStory.load('story-1', 'The island', { nodes: [], refs: {}, categories: [] })
    spyOn(TestBed.inject(AlertService), 'launch').and.resolveTo(true)
    spyOn(database, 'deleteStory').and.resolveTo(null)
    cards()[0].querySelector<HTMLButtonElement>('.storyMenu__item--danger')!.click()
    await fixture.whenStable()
    expect(activeStory.storyId()).toBe('')
    expect(await TestBed.inject(StoryOpenerService).open('story-1')).toBeFalse()
  })

  it('keeps a story it could not delete and says so', async () => {
    await render(stories)
    spyOn(TestBed.inject(AlertService), 'launch').and.resolveTo(true)
    spyOn(database, 'deleteStory').and.rejectWith(new Error('denied'))
    cards()[1].querySelector<HTMLButtonElement>('.storyMenu__item--danger')!.click()
    await fixture.whenStable()
    fixture.detectChanges()
    expect(cards().length).toBe(2)
    expect(host().querySelector('.deleteError')?.textContent).toContain('“Draft” could not be deleted')
  })

  it('creates a new story and opens it, or says it could not', async () => {
    await render(stories)
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true)
    const create = spyOn(database, 'createEmptyStory').and.resolveTo({ id: 'story-9', name: 'My new tree' })
    const newStory = () => host().querySelector<HTMLButtonElement>('.pageHeader .button--primary')!
    newStory().click()
    await fixture.whenStable()
    expect(create).toHaveBeenCalledOnceWith('My new tree')
    expect(navigate).toHaveBeenCalledOnceWith(['/story', 'story-9', 'board'])

    create.and.resolveTo(null)
    newStory().click()
    await fixture.whenStable()
    fixture.detectChanges()
    expect(navigate).toHaveBeenCalledTimes(1)
    expect(host().querySelector('[role="alert"]')?.textContent).toContain('could not be created')
  })

  it('invites an author without stories to the board', async () => {
    await render([])
    expect(cards().length).toBe(0)
    expect(host().querySelector('.empty a')?.getAttribute('href')).toBe('/board')
  })

  it('says it could not load the stories instead of showing none', async () => {
    await render(null)
    expect(host().querySelector('[role="alert"]')).not.toBeNull()
    expect(cards().length).toBe(0)
  })

  it('finds stories by name and orders them as the author asks', async () => {
    await render(stories)
    const names = () => cards().map((card) => card.querySelector('.card__link')?.textContent?.trim())
    expect(names()).toEqual(['The island', 'Draft'])
    const sort = host().querySelector<HTMLSelectElement>('select.sort')!
    sort.value = 'name'
    sort.dispatchEvent(new Event('change'))
    fixture.detectChanges()
    expect(names()).toEqual(['Draft', 'The island'])

    const search = host().querySelector<HTMLInputElement>('input.search')!
    search.value = 'isl'
    search.dispatchEvent(new Event('input'))
    fixture.detectChanges()
    expect(names()).toEqual(['The island'])
    search.value = 'nothing'
    search.dispatchEvent(new Event('input'))
    fixture.detectChanges()
    expect(cards().length).toBe(0)
    expect(host().querySelector('[role="status"]')?.textContent).toContain('No story is called “nothing”')
  })

  it('opens the story it was asked for, then the same sharing dialog as the editor, over the stories', async () => {
    await render(stories)
    const open = spyOn(TestBed.inject(StoryOpenerService), 'open').and.resolveTo(true)
    const launch = spyOn(TestBed.inject(ModalService), 'launch')
    const menu = cards()[0].querySelector<HTMLElement>('.storyMenu')!
    Array.from(menu.querySelectorAll<HTMLButtonElement>('button')).find((item) => item.textContent?.includes('Share'))!.click()
    await fixture.whenStable()
    expect(open).toHaveBeenCalledOnceWith('story-1')
    expect(launch).toHaveBeenCalledOnceWith(ShareStoryComponent)

    open.and.resolveTo(false)
    launch.calls.reset()
    await component.share(stories[1], menu)
    expect(launch).not.toHaveBeenCalled()
  })

  it('leads from the tracking warning to where tracking is turned on', async () => {
    await render(stories)
    expect(cards()[1].querySelector('a.tag')?.getAttribute('href')).toBe('/story/story-2')
  })
})
