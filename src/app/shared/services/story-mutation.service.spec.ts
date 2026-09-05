import { fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing'
import { DatabaseService } from 'src/app/core/services/database.service'
import { ActiveStoryService } from './active-story.service'
import { StoryMutationService } from './story-mutation.service'

describe('StoryMutationService', () => {
  let activeStory: ActiveStoryService
  let database: jasmine.SpyObj<DatabaseService>
  let mutations: StoryMutationService

  beforeEach(() => {
    database = jasmine.createSpyObj<DatabaseService>('DatabaseService', [
      'saveTreeToDB',
    ])
    database.saveTreeToDB.and.resolveTo(true)

    TestBed.configureTestingModule({
      providers: [
        ActiveStoryService,
        StoryMutationService,
        { provide: DatabaseService, useValue: database },
      ],
    })

    activeStory = TestBed.inject(ActiveStoryService)
    mutations = TestBed.inject(StoryMutationService)
    activeStory.load('story-1', 'Story', { nodes: [] })
  })

  it('does nothing when a mutation reports no change', fakeAsync(() => {
    const currentTree = activeStory.entireTree()

    const changed = mutations.update(() => false)
    flushMicrotasks()

    expect(changed).toBeFalse()
    expect(activeStory.entireTree()).toBe(currentTree)
    expect(database.saveTreeToDB).not.toHaveBeenCalled()
  }))

  it('updates local state but skips persistence without a story id', fakeAsync(() => {
    activeStory.load('', 'Example', { nodes: [] })

    const changed = mutations.update((tree) => {
      tree.nodes.push({
        id: 'node_0',
        top: 0,
        left: 0,
        type: 'content',
      })
    })
    flushMicrotasks()

    expect(changed).toBeTrue()
    expect(activeStory.entireTree().nodes.length).toBe(1)
    expect(database.saveTreeToDB).not.toHaveBeenCalled()
  }))

  it('persists the active save and coalesces queued mutations to the latest snapshot', fakeAsync(() => {
    let saveNumber = 0
    let resolveFirstSave: (saved: boolean) => void = () => undefined

    database.saveTreeToDB.and.callFake(() => {
      saveNumber++
      if (saveNumber === 1) {
        return new Promise<boolean>((resolve) => {
          resolveFirstSave = resolve
        })
      }
      return Promise.resolve(true)
    })

    mutations.update((tree) => {
      tree.nodes.push({
        id: 'node_0',
        top: 0,
        left: 0,
        type: 'content',
      })
    })
    mutations.update((tree) => {
      tree.nodes.push({
        id: 'node_1',
        top: 100,
        left: 100,
        type: 'end',
      })
    })
    mutations.update((tree) => {
      tree.nodes.push({
        id: 'node_2',
        top: 200,
        left: 200,
        type: 'end',
      })
    })

    flushMicrotasks()
    expect(database.saveTreeToDB).toHaveBeenCalledTimes(1)
    expect(database.saveTreeToDB.calls.argsFor(0)[1].nodes.length).toBe(1)

    resolveFirstSave(true)
    flushMicrotasks()
    expect(database.saveTreeToDB).toHaveBeenCalledTimes(2)
    expect(database.saveTreeToDB.calls.argsFor(1)[1].nodes.length).toBe(3)
  }))
})
