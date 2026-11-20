import { TestBed } from '@angular/core/testing'
import { ActivatedRoute, convertToParamMap, ParamMap, provideRouter } from '@angular/router'
import { BehaviorSubject } from 'rxjs'
import { StoryShellComponent } from './story-shell.component'
import { DatabaseService } from 'src/app/core/services/database.service'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { appUser } from 'src/app/core/interfaces/interfaces'

describe('StoryShellComponent', () => {
  let params: BehaviorSubject<ParamMap>
  let database: DatabaseService
  let activeStory: ActiveStoryService
  const storedStory = {
    id: 'story-1', name: 'The island', custom_id: 'the-island', tracking: true, sharing: false, tapLink: true,
    footer: { text: 'By Marta' }, cumulativeMode: false, tree: { nodes: [{ id: 'node_0', type: 'content', top: 0, left: 0 }] },
  }

  async function render(storyId: string) {
    params = new BehaviorSubject(convertToParamMap({ storyId }))
    await TestBed.configureTestingModule({
      imports: [StoryShellComponent],
      providers: [provideRouter([]), { provide: ActivatedRoute, useValue: { paramMap: params } }],
    }).compileComponents()
    database = TestBed.inject(DatabaseService)
    database.user.set({ id: 'author-1', email: 'marta@example.com', profile: { user_name: 'marta' } } as unknown as appUser)
    activeStory = TestBed.inject(ActiveStoryService)
  }

  async function create() {
    const fixture = TestBed.createComponent(StoryShellComponent)
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()
    return fixture
  }

  it('opens a story the way the editor does, with its configuration', async () => {
    await render('story-1')
    const load = spyOn(database, 'getStoryWithID').and.resolveTo(storedStory)
    const fixture = await create()
    expect(load).toHaveBeenCalledOnceWith('story-1')
    expect(fixture.componentInstance.state()).toBe('ready')
    expect(activeStory.storyId()).toBe('story-1')
    expect(activeStory.storyName()).toBe('The island')
    expect(activeStory.storyConfiguration().customId).toBe('the-island')
    expect(activeStory.storyConfiguration().footer.text).toBe('By Marta')

    const host = fixture.nativeElement as HTMLElement
    expect(host.querySelector('#story-title')?.textContent).toContain('The island')
    const links = Array.from(host.querySelectorAll('nav a')).map((link) => link.getAttribute('href'))
    // Sharing is a dialog, and its settings are in General with the rest.
    expect(links).toEqual(['/story/story-1', '/story/story-1/statistics'])
    // The way back into the editor comes first, beside the story's name, not among its sections.
    expect(host.querySelector('.sidebar__story .editorLink')?.getAttribute('href')).toBe('/story/story-1/board')
    expect(host.querySelector('.back')?.getAttribute('href')).toBe('/dashboard')
    // Named Home, as in the board and in the dashboard's own menu.
    expect(host.querySelector('.back')?.textContent?.trim()).toBe('Home')
  })

  it('keeps the story the editor already has open, with any changes still being saved', async () => {
    await render('story-1')
    activeStory.load('story-1', 'The island, edited', { nodes: [] })
    const load = spyOn(database, 'getStoryWithID')
    const fixture = await create()
    expect(load).not.toHaveBeenCalled()
    expect(fixture.componentInstance.state()).toBe('ready')
    expect(activeStory.storyName()).toBe('The island, edited')
  })

  it('says when a story cannot be opened', async () => {
    await render('someone-elses')
    spyOn(database, 'getStoryWithID').and.resolveTo(false)
    const fixture = await create()
    const host = fixture.nativeElement as HTMLElement
    expect(fixture.componentInstance.state()).toBe('missing')
    expect(host.querySelector('[role="alert"]')?.textContent).toContain('does not exist or is not yours')
    expect(host.querySelector('router-outlet')).toBeNull()
  })
})
