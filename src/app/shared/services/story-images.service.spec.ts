import { TestBed } from '@angular/core/testing'
import { signal } from '@angular/core'
import { appUser } from 'src/app/core/interfaces/interfaces'
import { DatabaseService } from 'src/app/core/services/database.service'
import { StoryEditorService } from 'src/app/features/board/services/story-editor.service'
import { ActiveStoryService } from './active-story.service'
import { StoryImagesService } from './story-images.service'
import { StoryMutationService } from './story-mutation.service'

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined
  const promise = new Promise<T>(finish => { resolve = finish })
  return { promise, resolve }
}

const optimizedResponse = () => new Response(new Blob(['optimized'], { type: 'image/webp' }))
const storageSuccess = () => ({ data: { path: 'uploaded' }, error: null })

describe('StoryImagesService', () => {
  let images: StoryImagesService
  let story: ActiveStoryService
  let editor: StoryEditorService
  let mutations: StoryMutationService
  let user: ReturnType<typeof signal<appUser | null>>
  let getUser: jasmine.Spy
  let upload: jasmine.Spy
  let remove: jasmine.Spy
  let fetchImage: jasmine.Spy
  let file: File

  beforeEach(() => {
    user = signal<appUser | null>({ id: 'author' } as appUser)
    getUser = jasmine.createSpy('getUser').and.resolveTo({ data: { user: { id: 'author' } }, error: null })
    upload = jasmine.createSpy('upload').and.resolveTo(storageSuccess())
    remove = jasmine.createSpy('remove').and.resolveTo({ error: null })
    TestBed.configureTestingModule({ providers: [{
      provide: DatabaseService,
      useValue: {
        user,
        saveTreeToDB: jasmine.createSpy('saveTreeToDB').and.resolveTo(true),
        supabase: { auth: { getUser }, storage: { from: () => ({ upload, remove }) } },
      },
    }] })
    story = TestBed.inject(ActiveStoryService)
    images = TestBed.inject(StoryImagesService)
    editor = TestBed.inject(StoryEditorService)
    mutations = TestBed.inject(StoryMutationService)
    mutations.loadStory('story-1', 'Story', { nodes: [
      { id: 'node_0', type: 'content', top: 0, left: 0 },
      { id: 'node_1', type: 'content', text: 'Original', top: 0, left: 300, image: { path: 'old-image' } },
    ] })
    mutations.beginHistorySession()
    fetchImage = spyOn(window, 'fetch').and.callFake(async () => optimizedResponse())
    file = new File(['original'], 'original.png', { type: 'image/png' })
    spyOn(console, 'error')
    spyOn(console, 'warn')
  })

  afterEach(() => sessionStorage.removeItem('polo-pending-tree:author:story-1'))

  it('optimizes and uploads to a unique owner/story/node path without mutating JSON', async () => {
    const before = story.entireTree()
    const result = await images.uploadForNode('node_1', file)
    expect(result.status).toBe('uploaded')
    expect(story.entireTree()).toBe(before)
    expect(getUser).toHaveBeenCalledTimes(1)
    expect(fetchImage.calls.mostRecent().args[1].method).toBe('POST')
    expect((fetchImage.calls.mostRecent().args[1].body as FormData).get('image')).toEqual(file)
    expect(upload.calls.mostRecent().args[0]).toMatch(/^author\/story-1\/node_1-[\da-f-]+$/)
    expect(await (upload.calls.mostRecent().args[1] as Blob).text()).toBe('optimized')
    expect(upload.calls.mostRecent().args[2]).toEqual({ contentType: 'image/webp', upsert: false })
    if (result.status === 'uploaded') expect(images.claimUpload(result)).toBeTrue()
  })

  it('lets StoryEditor attach the path and preserves the previous image for undo', async () => {
    const result = await editor.uploadImageToNode('node_1', file)
    expect(result.status).toBe('uploaded')
    if (result.status !== 'uploaded') return
    expect(story.entireTree().nodes[1].image?.path).toBe(result.path)
    expect(remove).not.toHaveBeenCalled()
    mutations.undo()
    expect(story.entireTree().nodes[1].image?.path).toBe('old-image')
    mutations.redo()
    expect(story.entireTree().nodes[1].image?.path).toBe(result.path)
  })

  it('allows unrelated JSON edits during optimization instead of rejecting every tree clone', async () => {
    const optimized = deferred<Response>()
    fetchImage.and.returnValue(optimized.promise)
    const finished = editor.uploadImageToNode('node_1', file)
    await Promise.resolve()
    expect(fetchImage).toHaveBeenCalled()
    editor.updateNodeText('node_1', 'Edited during upload')
    optimized.resolve(optimizedResponse())
    const result = await finished
    expect(result.status).toBe('uploaded')
    expect(story.entireTree().nodes[1].text).toBe('Edited during upload')
    expect(story.entireTree().nodes[1].image?.path).not.toBe('old-image')
  })

  it('does not upload or attach to a deleted node, even if its ID is reused', async () => {
    const optimized = deferred<Response>()
    fetchImage.and.returnValue(optimized.promise)
    const finished = editor.uploadImageToNode('node_1', file)
    await Promise.resolve()
    editor.removeNode('node_1')
    editor.createNode({ id: 'node_1', type: 'content', text: 'Replacement', top: 0, left: 0 })
    optimized.resolve(optimizedResponse())
    expect((await finished).status).toBe('cancelled')
    expect(upload).not.toHaveBeenCalled()
    expect(story.entireTree().nodes[1].image).toBeUndefined()
  })

  it('cancels optimization when the editor session ends', async () => {
    const optimized = deferred<Response>()
    fetchImage.and.returnValue(optimized.promise)
    const finished = editor.uploadImageToNode('node_1', file)
    await Promise.resolve()
    mutations.endHistorySession()
    optimized.resolve(optimizedResponse())
    expect((await finished).status).toBe('cancelled')
    expect(upload).not.toHaveBeenCalled()
    expect(story.entireTree().nodes[1].image?.path).toBe('old-image')
  })

  it('preserves a same-story upload and history while optimization is in flight', async () => {
    editor.updateNodeText('node_0', 'An earlier edit')
    const optimized = deferred<Response>()
    fetchImage.and.returnValue(optimized.promise)
    const finished = editor.uploadImageToNode('node_1', file)
    await Promise.resolve()
    mutations.loadStory('story-1', 'Reloaded', story.entireTree())
    expect(story.canUndo()).toBeTrue()
    optimized.resolve(optimizedResponse())
    const result = await finished
    expect(result.status).toBe('uploaded')
    expect(upload).toHaveBeenCalledTimes(1)
    if (result.status === 'uploaded') expect(story.entireTree().nodes[1].image?.path).toBe(result.path)
  })

  it('cleans up a completed upload after switching stories without attaching it to the new node', async () => {
    const stored = deferred<ReturnType<typeof storageSuccess>>()
    const started = deferred<void>()
    upload.and.callFake(() => { started.resolve(); return stored.promise })
    const finished = editor.uploadImageToNode('node_1', file)
    await started.promise
    const path = upload.calls.mostRecent().args[0] as string
    mutations.loadStory('story-2', 'Other', { nodes: [{ id: 'node_1', type: 'content', top: 0, left: 0 }] })
    stored.resolve(storageSuccess())
    expect((await finished).status).toBe('cancelled')
    expect(story.entireTree().nodes[0].image).toBeUndefined()
    expect(remove).toHaveBeenCalledOnceWith([path])
  })

  it('cleans up an upload that finishes after its node was deleted and recreated', async () => {
    const stored = deferred<ReturnType<typeof storageSuccess>>()
    const started = deferred<void>()
    upload.and.callFake(() => { started.resolve(); return stored.promise })
    const finished = editor.uploadImageToNode('node_1', file)
    await started.promise
    const path = upload.calls.mostRecent().args[0] as string
    editor.removeNode('node_1')
    editor.createNode({ id: 'node_1', type: 'content', top: 0, left: 0 })
    stored.resolve(storageSuccess())
    expect((await finished).status).toBe('cancelled')
    expect(story.entireTree().nodes[1].image).toBeUndefined()
    expect(remove).toHaveBeenCalledWith([path])
  })

  it('lets the latest upload win when two requests for the same node finish out of order', async () => {
    const firstStored = deferred<ReturnType<typeof storageSuccess>>()
    const firstStarted = deferred<void>()
    upload.and.callFake(() => {
      if (upload.calls.count() === 1) { firstStarted.resolve(); return firstStored.promise }
      return Promise.resolve(storageSuccess())
    })
    const first = editor.uploadImageToNode('node_1', file)
    await firstStarted.promise
    const firstPath = upload.calls.argsFor(0)[0] as string
    const second = await editor.uploadImageToNode('node_1', file)
    expect(second.status).toBe('uploaded')
    firstStored.resolve(storageSuccess())
    expect((await first).status).toBe('cancelled')
    if (second.status === 'uploaded') {
      expect(story.entireTree().nodes[1].image?.path).toBe(second.path)
      expect(second.path).not.toBe(firstPath)
    }
    expect(remove).toHaveBeenCalledWith([firstPath])
  })

  it('rechecks the upload target between completion and attaching the path', async () => {
    const result = await images.uploadForNode('node_1', file)
    expect(result.status).toBe('uploaded')
    editor.removeNode('node_1')
    if (result.status === 'uploaded') {
      expect(images.claimUpload(result)).toBeFalse()
      expect(remove).toHaveBeenCalledWith([result.path])
    }
  })

  it('does not start work without authentication or for a group/distributor/missing node', async () => {
    user.set(null)
    expect((await editor.uploadImageToNode('node_1', file)).status).toBe('unauthenticated')
    expect(getUser).not.toHaveBeenCalled()
    user.set({ id: 'author' } as appUser)
    editor.createNode({ id: 'node_2', type: 'group', top: 0, left: 0 })
    editor.createNode({ id: 'node_3', type: 'distributor', top: 0, left: 0 })
    for (const id of ['missing', 'node_2', 'node_3']) {
      expect((await editor.uploadImageToNode(id, file)).status).toBe('cancelled')
    }
    expect(fetchImage).not.toHaveBeenCalled()
    expect(upload).not.toHaveBeenCalled()
  })

  it('does not optimize when server authentication belongs to another account', async () => {
    getUser.and.resolveTo({ data: { user: { id: 'other-author' } }, error: null })
    expect((await editor.uploadImageToNode('node_1', file)).status).toBe('unauthenticated')
    expect(fetchImage).not.toHaveBeenCalled()
    expect(upload).not.toHaveBeenCalled()
  })

  it('cancels on account changes and does not delete orphaned uploads under another account', async () => {
    const stored = deferred<ReturnType<typeof storageSuccess>>()
    const started = deferred<void>()
    upload.and.callFake(() => { started.resolve(); return stored.promise })
    const finished = editor.uploadImageToNode('node_1', file)
    await started.promise
    const path = upload.calls.mostRecent().args[0] as string
    user.set({ id: 'other-author' } as appUser)
    stored.resolve(storageSuccess())
    expect((await finished).status).toBe('cancelled')
    expect(remove).not.toHaveBeenCalled()
    expect(story.entireTree().nodes[1].image?.path).toBe('old-image')
    user.set({ id: 'author' } as appUser)
    images.cleanup()
    expect(remove).toHaveBeenCalledWith([path])
  })

  it('reports optimization errors without uploading or changing JSON', async () => {
    const before = story.entireTree()
    fetchImage.and.resolveTo(new Response(null, { status: 413 }))
    expect((await editor.uploadImageToNode('node_1', file)).status).toBe('optimization-failed')
    fetchImage.and.rejectWith(new Error('Offline'))
    expect((await editor.uploadImageToNode('node_1', file)).status).toBe('optimization-failed')
    expect(upload).not.toHaveBeenCalled()
    expect(story.entireTree()).toBe(before)
  })

  it('reports upload errors without changing JSON', async () => {
    const before = story.entireTree()
    upload.and.resolveTo({ error: { message: 'Storage rejected the upload' } })
    expect((await editor.uploadImageToNode('node_1', file)).status).toBe('upload-failed')
    expect(story.entireTree()).toBe(before)
  })

  it('removes a newly uploaded image only after undo loses the redo branch and its save is confirmed', async () => {
    const result = await editor.uploadImageToNode('node_1', file)
    expect(result.status).toBe('uploaded')
    if (result.status !== 'uploaded') return
    mutations.undo()
    await Promise.resolve()
    expect(remove).not.toHaveBeenCalled()
    editor.updateNodeText('node_1', 'New branch')
    await Promise.resolve()
    await Promise.resolve()
    images.cleanup()
    expect(story.canRedo()).toBeFalse()
    expect(remove).toHaveBeenCalledOnceWith([result.path])
    expect(story.entireTree().nodes[1].image?.path).toBe('old-image')
  })

  it('adopts a newly known owner for earlier retired images but waits for save confirmation', () => {
    user.set(null)
    images.storyLoaded('story-1', story.entireTree(), undefined, false)
    images.retireImage('old-image')
    story.updateTree(draft => { delete draft.nodes[1].image })
    story.endHistorySession()
    user.set({ id: 'author' } as appUser)
    images.saveQueued('story-1', story.entireTree(), 'author')
    images.retireImage('another-unused-image')
    images.cleanup()
    expect(remove).not.toHaveBeenCalled()
    images.saveFinished('story-1', false)
    expect(remove).toHaveBeenCalledWith(['old-image'])
    expect(remove).toHaveBeenCalledWith(['another-unused-image'])
  })

  it('never reassigns already owned retired images to another account', () => {
    images.retireImage('old-image')
    story.updateTree(draft => { delete draft.nodes[1].image })
    story.endHistorySession()
    user.set({ id: 'other-author' } as appUser)
    images.storyLoaded('story-1', story.entireTree(), 'other-author', false)
    expect(remove).not.toHaveBeenCalled()
    user.set({ id: 'author' } as appUser)
    images.cleanup()
    expect(remove).toHaveBeenCalledWith(['old-image'])
  })

  it('keeps a deleted image recoverable through many consecutive autosaves of the same text field', async () => {
    editor.removeImageFromNode('node_1')
    for (let edit = 1; edit <= 30; edit++) {
      editor.updateNodeText('node_0', `Typing ${edit}`)
      await Promise.resolve()
    }
    expect(remove).not.toHaveBeenCalled()
    mutations.undo()
    expect(story.entireTree().nodes[0].text).toBeUndefined()
    mutations.undo()
    expect(story.entireTree().nodes[1].image?.path).toBe('old-image')
    expect(remove).not.toHaveBeenCalled()
  })

  it('retries failed cleanup without deleting images retained by history', async () => {
    const result = await editor.uploadImageToNode('node_1', file)
    expect(result.status).toBe('uploaded')
    if (result.status !== 'uploaded') return
    await Promise.resolve()
    expect(remove).not.toHaveBeenCalled()
    remove.and.returnValues(Promise.resolve({ error: { message: 'Offline' } }), Promise.resolve({ error: null }))
    mutations.endHistorySession()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
    images.cleanup()
    expect(remove).toHaveBeenCalledTimes(2)
    expect(remove.calls.mostRecent().args).toEqual([['old-image']])
    expect(story.entireTree().nodes[1].image?.path).toBe(result.path)
  })
})
