import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed, tick } from '@angular/core/testing'
import { signal } from '@angular/core'
import { provideRouter } from '@angular/router'
import { appUser, tree } from 'src/app/core/interfaces/interfaces'
import { DatabaseService } from 'src/app/core/services/database.service'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { StoryMutationService } from 'src/app/shared/services/story-mutation.service'
import { DashboardComponent } from './dashboard.component'

interface StoryRecord {
  id: string
  name: string
  tree: tree
}

const story = (id: string): StoryRecord => ({
  id, name: id,
  tree: {
    nodes: [
      { id: 'node_0', type: 'content', top: 0, left: 0 },
      { id: 'node_1', type: 'end', top: 100, left: 100 },
    ],
    refs: {}, categories: [],
  },
})

describe('Dashboard save/load races', () => {
  let fixture: ComponentFixture<DashboardComponent>
  let component: DashboardComponent
  let activeStory: ActiveStoryService
  let mutations: StoryMutationService
  let database: jasmine.SpyObj<DatabaseService>
  let previousStoryId: string | null

  beforeEach(() => {
    previousStoryId = localStorage.getItem('polo-id')
    database = jasmine.createSpyObj<DatabaseService>('DatabaseService', ['getStoryWithID', 'getConfigurationOf', 'saveTreeToDB'])
    Object.assign(database, { user: signal<appUser | null>(null) })
    database.getConfigurationOf.and.resolveTo(undefined)
    database.saveTreeToDB.and.resolveTo(true)
    TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [provideRouter([]), { provide: DatabaseService, useValue: database }],
    })
    // No lifecycle rendering is needed to test the async loading boundary.
    fixture = TestBed.createComponent(DashboardComponent)
    component = fixture.componentInstance
    spyOn(component, 'setInitialBoardPositionFor')
    activeStory = TestBed.inject(ActiveStoryService)
    mutations = TestBed.inject(StoryMutationService)
  })

  afterEach(() => {
    if (previousStoryId === null) localStorage.removeItem('polo-id')
    else localStorage.setItem('polo-id', previousStoryId)
  })

  it('ignores a delayed response for a story the author has already switched away from', fakeAsync(() => {
    let finishFirst: (value: StoryRecord) => void = () => undefined
    let finishSecond: (value: StoryRecord) => void = () => undefined
    database.getStoryWithID.and.returnValues(
      new Promise<StoryRecord>((resolve) => { finishFirst = resolve }),
      new Promise<StoryRecord>((resolve) => { finishSecond = resolve })
    )
    void component.initBoard('first')
    void component.initBoard('second')
    finishSecond(story('second'))
    flushMicrotasks()
    finishFirst(story('first'))
    flushMicrotasks()
    tick()
    expect(activeStory.storyId()).toBe('second')
    expect(localStorage.getItem('polo-id')).toBe('second')
  }))

  it('does not resurrect deleted nodes when a pre-deletion read completes after the save', fakeAsync(() => {
    const oldStory = story('story-1')
    activeStory.load(oldStory.id, oldStory.name, oldStory.tree)
    let finishRead: (value: StoryRecord) => void = () => undefined
    database.getStoryWithID.and.returnValue(new Promise<StoryRecord>((resolve) => { finishRead = resolve }))
    void component.initBoard('story-1')
    mutations.update((draft) => { draft.nodes = draft.nodes.filter((node) => node.id !== 'node_1') })
    flushMicrotasks()
    expect(mutations.saveState()).toBe('saved')

    finishRead(oldStory)
    flushMicrotasks()
    tick()
    expect(activeStory.entireTree().nodes.map((node) => node.id)).toEqual(['node_0'])
  }))

  it('preserves edits that were pending when a same-story reload began', fakeAsync(() => {
    const oldStory = story('story-1')
    activeStory.load(oldStory.id, oldStory.name, oldStory.tree)
    let finishSave: (saved: boolean) => void = () => undefined
    let finishRead: (value: StoryRecord) => void = () => undefined
    database.saveTreeToDB.and.returnValue(new Promise<boolean>((resolve) => { finishSave = resolve }))
    mutations.update((draft) => { draft.nodes.pop() })
    database.getStoryWithID.and.returnValue(new Promise<StoryRecord>((resolve) => { finishRead = resolve }))
    void component.initBoard('story-1')
    finishSave(true)
    flushMicrotasks()
    finishRead(oldStory)
    flushMicrotasks()
    tick()
    expect(activeStory.entireTree().nodes).toHaveSize(1)
  }))

  it('treats clicking the loaded current story as a no-op that preserves undo and redo', fakeAsync(() => {
    component.loadStory(story('story-1'))
    mutations.update(draft => { draft.nodes[0].left = 10 })
    mutations.update(draft => { draft.nodes[0].left = 20 })
    mutations.undo()
    const before = activeStory.entireTree()
    void component.initBoard('story-1')
    flushMicrotasks()
    tick()
    expect(database.getStoryWithID).not.toHaveBeenCalled()
    expect(activeStory.entireTree()).toBe(before)
    expect(activeStory.canUndo()).toBeTrue()
    expect(activeStory.canRedo()).toBeTrue()
  }))

  it('a current-story click invalidates an older in-flight switch to another story', fakeAsync(() => {
    component.loadStory(story('story-1'))
    let finishRead: (value: StoryRecord) => void = () => undefined
    database.getStoryWithID.and.returnValue(new Promise<StoryRecord>(resolve => { finishRead = resolve }))
    void component.initBoard('other-story')
    void component.initBoard('story-1')
    finishRead(story('other-story'))
    flushMicrotasks()
    tick()
    expect(activeStory.storyId()).toBe('story-1')
  }))

  it('does not apply delayed configuration from another story', fakeAsync(() => {
    const configuration = (sharing: boolean) => ({
      custom_id: null, tracking: false, sharing, tapLink: false, cumulativeMode: false, footer: {},
    })
    let finishConfig: (config: ReturnType<typeof configuration>) => void = () => undefined
    database.getConfigurationOf.and.callFake((id) => id === 'first'
      ? new Promise((resolve) => { finishConfig = resolve })
      : Promise.resolve(configuration(true)))
    component.loadStory(story('first'))
    component.loadStory(story('second'))
    flushMicrotasks()
    finishConfig(configuration(false))
    flushMicrotasks()
    tick()
    expect(activeStory.storyId()).toBe('second')
    expect(activeStory.storyConfiguration().sharing).toBeTrue()
  }))
})
