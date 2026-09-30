import { fakeAsync, flushMicrotasks, TestBed, tick } from '@angular/core/testing'
import { signal } from '@angular/core'
import { appUser, tree } from 'src/app/core/interfaces/interfaces'
import { DatabaseService } from 'src/app/core/services/database.service'
import { ActiveStoryService } from './active-story.service'
import { StoryMutationService } from './story-mutation.service'

describe('StoryMutationService', () => {
  let activeStory: ActiveStoryService
  let database: jasmine.SpyObj<DatabaseService>
  let mutations: StoryMutationService
  let listen: jasmine.Spy

  beforeEach(() => {
    database = jasmine.createSpyObj<DatabaseService>('DatabaseService', [
      'saveTreeToDB',
    ])
    database.saveTreeToDB.and.resolveTo(true)
    Object.assign(database, { user: signal<appUser | null>(null) })

    TestBed.configureTestingModule({
      providers: [
        ActiveStoryService,
        StoryMutationService,
        { provide: DatabaseService, useValue: database },
      ],
    })

    activeStory = TestBed.inject(ActiveStoryService)
    listen = spyOn(window, 'addEventListener').and.callThrough()
    mutations = TestBed.inject(StoryMutationService)
    activeStory.load('story-1', 'Story', { nodes: [] })
  })

  afterEach(() => {
    sessionStorage.removeItem('polo-pending-tree:save-test-author:story-1')
  })

  const addNode = (draft: tree) => {
    draft.nodes.push({ id: 'node_1', type: 'content', top: 0, left: 0 })
  }

  it('retains failed saves and retries automatically instead of dropping edits', fakeAsync(() => {
    database.saveTreeToDB.and.returnValues(Promise.resolve(false), Promise.resolve(true))
    mutations.update(addNode)
    flushMicrotasks()

    expect(mutations.saveState()).toBe('error')
    expect(mutations.hasUnsavedChanges()).toBeTrue()
    expect(database.saveTreeToDB).toHaveBeenCalledTimes(1)
    tick(2000)
    flushMicrotasks()
    expect(database.saveTreeToDB).toHaveBeenCalledTimes(2)
    expect(database.saveTreeToDB.calls.mostRecent().args[1].nodes).toHaveSize(1)
    expect(mutations.saveState()).toBe('saved')
    expect(mutations.hasUnsavedChanges()).toBeFalse()
  }))

  it('backs off repeated failures instead of continuously retrying', fakeAsync(() => {
    database.saveTreeToDB.and.resolveTo(false)
    mutations.update(addNode)
    flushMicrotasks()
    tick(2000)
    flushMicrotasks()
    expect(database.saveTreeToDB).toHaveBeenCalledTimes(2)
    tick(3999)
    expect(database.saveTreeToDB).toHaveBeenCalledTimes(2)
    database.saveTreeToDB.and.resolveTo(true)
    tick(1)
    flushMicrotasks()
    expect(database.saveTreeToDB).toHaveBeenCalledTimes(3)
    expect(mutations.saveState()).toBe('saved')
  }))

  it('preserves the latest deletions when an older request fails', fakeAsync(() => {
    let finish: (saved: boolean) => void = () => undefined
    database.saveTreeToDB.and.returnValues(
      new Promise<boolean>((resolve) => { finish = resolve }),
      Promise.resolve(true)
    )
    mutations.update(addNode)
    mutations.update((draft) => { draft.nodes = [] })
    finish(false)
    flushMicrotasks()
    expect(mutations.saveState()).toBe('error')

    mutations.retry()
    flushMicrotasks()
    expect(database.saveTreeToDB.calls.mostRecent().args[1].nodes).toEqual([])
    expect(mutations.saveState()).toBe('saved')
  }))

  it('also retries rejected requests', fakeAsync(() => {
    spyOn(console, 'error')
    database.saveTreeToDB.and.returnValues(Promise.reject(new Error('Offline')), Promise.resolve(true))
    mutations.update(addNode)
    flushMicrotasks()
    expect(mutations.saveState()).toBe('error')
    window.dispatchEvent(new Event('online'))
    flushMicrotasks()
    expect(mutations.saveState()).toBe('saved')
    expect(database.saveTreeToDB).toHaveBeenCalledTimes(2)
  }))

  it('does not let a failed story block another story save', fakeAsync(() => {
    database.saveTreeToDB.and.callFake((id) => Promise.resolve(id === 'story-2'))
    mutations.update(addNode)
    activeStory.load('story-2', 'Other story', { nodes: [] })
    mutations.update(addNode)
    flushMicrotasks()

    expect(database.saveTreeToDB.calls.allArgs().map(([id]) => id)).toEqual(['story-1', 'story-2'])
    expect(mutations.saveState()).toBe('error')
    database.saveTreeToDB.and.resolveTo(true)
    tick(2000)
    flushMicrotasks()
    expect(database.saveTreeToDB.calls.mostRecent().args[0]).toBe('story-1')
    expect(activeStory.storyId()).toBe('story-2')
    expect(mutations.saveState()).toBe('saved')
  }))

  it('keeps a recovery copy until the newest queued save is confirmed', fakeAsync(() => {
    database.user.set({ id: 'save-test-author' } as appUser)
    let finishFirst: (saved: boolean) => void = () => undefined
    let finishSecond: (saved: boolean) => void = () => undefined
    database.saveTreeToDB.and.returnValues(
      new Promise<boolean>((resolve) => { finishFirst = resolve }),
      new Promise<boolean>((resolve) => { finishSecond = resolve })
    )
    const key = 'polo-pending-tree:save-test-author:story-1'
    mutations.update(addNode)
    mutations.update((draft) => { draft.nodes = [] })
    expect(JSON.parse(sessionStorage.getItem(key)!).nodes).toEqual([])

    finishFirst(true)
    flushMicrotasks()
    expect(mutations.saveState()).toBe('saving')
    expect(JSON.parse(sessionStorage.getItem(key)!).nodes).toEqual([])
    finishSecond(true)
    flushMicrotasks()
    expect(sessionStorage.getItem(key)).toBeNull()
    expect(mutations.saveState()).toBe('saved')
  }))

  it('restores unsaved edits on reload without silently overwriting the server', fakeAsync(() => {
    database.user.set({ id: 'save-test-author' } as appUser)
    const draft = { nodes: [], refs: {}, categories: [] }
    sessionStorage.setItem('polo-pending-tree:save-test-author:story-1', JSON.stringify(draft))
    mutations.loadStory('story-1', 'Story', {
      nodes: [{ id: 'node_1', type: 'content', top: 0, left: 0 }],
    })
    expect(activeStory.entireTree().nodes).toEqual([])
    expect(mutations.recoveredDraft()).toBeTrue()
    expect(mutations.saveState()).toBe('error')
    window.dispatchEvent(new Event('online'))
    tick(30000)
    expect(database.saveTreeToDB).not.toHaveBeenCalled()

    mutations.retry()
    flushMicrotasks()
    expect(database.saveTreeToDB).toHaveBeenCalledOnceWith('story-1', draft)
    expect(mutations.saveState()).toBe('saved')
  }))

  it('ignores malformed browser drafts without replacing the server story', () => {
    database.user.set({ id: 'save-test-author' } as appUser)
    const key = 'polo-pending-tree:save-test-author:story-1'
    spyOn(console, 'warn')
    for (const stored of ['not json', '{"nodes":[null],"refs":{},"categories":[]}']) {
      sessionStorage.setItem(key, stored)
      mutations.loadStory('story-1', 'Story', { nodes: [{ id: 'node_0', type: 'content', top: 0, left: 0 }] })
      expect(activeStory.entireTree().nodes[0].id).toBe('node_0')
      expect(mutations.hasUnsavedChanges()).toBeFalse()
    }
  })

  it('uses pending edits when switching back to a story before saving finishes', fakeAsync(() => {
    let finish: (saved: boolean) => void = () => undefined
    database.saveTreeToDB.and.returnValue(new Promise<boolean>((resolve) => { finish = resolve }))
    mutations.update(addNode)
    mutations.loadStory('story-2', 'Other story', { nodes: [] })
    mutations.loadStory('story-1', 'Story', { nodes: [] })
    expect(activeStory.entireTree().nodes).toHaveSize(1)
    finish(true)
    flushMicrotasks()
  }))

  it('does not recover or retry another account\'s changes', fakeAsync(() => {
    database.user.set({ id: 'save-test-author' } as appUser)
    database.saveTreeToDB.and.resolveTo(false)
    mutations.update(addNode)
    flushMicrotasks()
    database.user.set({ id: 'different-author' } as appUser)
    mutations.loadStory('story-1', 'Other author story', { nodes: [] })
    expect(activeStory.entireTree().nodes).toEqual([])
    mutations.retry()
    flushMicrotasks()
    expect(database.saveTreeToDB).toHaveBeenCalledTimes(1)
    expect(sessionStorage.getItem('polo-pending-tree:save-test-author:story-1')).not.toBeNull()
  }))

  it('keeps the latest signed-out edits scoped to their author and resumes after reauthentication', fakeAsync(() => {
    database.user.set({ id: 'save-test-author' } as appUser)
    database.saveTreeToDB.and.resolveTo(false)
    mutations.loadStory('story-1', 'Story', { nodes: [] })
    mutations.update(addNode)
    flushMicrotasks()
    database.user.set(null)
    mutations.update((draft) => { draft.nodes = [] })
    flushMicrotasks()
    tick(2000)
    flushMicrotasks()

    expect(database.saveTreeToDB).toHaveBeenCalledTimes(1)
    expect(mutations.hasUnsavedChanges()).toBeTrue()
    const key = 'polo-pending-tree:save-test-author:story-1'
    expect(JSON.parse(sessionStorage.getItem(key)!).nodes).toEqual([])

    database.user.set({ id: 'different-author' } as appUser)
    mutations.retry()
    flushMicrotasks()
    expect(database.saveTreeToDB).toHaveBeenCalledTimes(1)
    expect(mutations.hasUnsavedChanges()).toBeTrue()

    database.user.set({ id: 'save-test-author' } as appUser)
    database.saveTreeToDB.and.resolveTo(true)
    TestBed.flushEffects()
    flushMicrotasks()
    expect(database.saveTreeToDB).toHaveBeenCalledTimes(2)
    expect(database.saveTreeToDB.calls.mostRecent().args[1].nodes).toEqual([])
    expect(mutations.saveState()).toBe('saved')
    expect(sessionStorage.getItem(key)).toBeNull()
  }))

  it('warns before leaving while a save is unconfirmed, but not after success', fakeAsync(() => {
    let finish: (saved: boolean) => void = () => undefined
    database.saveTreeToDB.and.returnValue(new Promise<boolean>((resolve) => { finish = resolve }))
    mutations.update(addNode)
    const warn = listen.calls.allArgs().find(([type]) => type === 'beforeunload')![1] as EventListener
    const unsaved = new Event('beforeunload', { cancelable: true })
    warn(unsaved)
    expect(unsaved.defaultPrevented).toBeTrue()
    finish(true)
    flushMicrotasks()
    const saved = new Event('beforeunload', { cancelable: true })
    warn(saved)
    expect(saved.defaultPrevented).toBeFalse()
  }))

  it('continues saving when browser draft storage is unavailable', fakeAsync(() => {
    database.user.set({ id: 'save-test-author' } as appUser)
    spyOn(Storage.prototype, 'setItem').and.throwError('Quota exceeded')
    spyOn(console, 'warn')
    mutations.update(addNode)
    flushMicrotasks()
    expect(database.saveTreeToDB).toHaveBeenCalledTimes(1)
    expect(mutations.saveState()).toBe('saved')
  }))

  it('cancels retries and unload listeners on destruction', fakeAsync(() => {
    database.saveTreeToDB.and.resolveTo(false)
    mutations.update(addNode)
    flushMicrotasks()
    const remove = spyOn(window, 'removeEventListener').and.callThrough()
    mutations.ngOnDestroy()
    tick(30000)
    expect(database.saveTreeToDB).toHaveBeenCalledTimes(1)
    expect(remove).toHaveBeenCalledWith('beforeunload', jasmine.any(Function))
    expect(remove).toHaveBeenCalledWith('online', jasmine.any(Function))
  }))

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
