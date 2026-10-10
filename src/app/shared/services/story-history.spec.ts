import { TestBed } from '@angular/core/testing'
import { tree } from 'src/app/core/interfaces/interfaces'
import { ActiveStoryService } from './active-story.service'

const initialTree = (): tree => ({
  entryPoint: { left: -180, top: -100, targetNodeId: 'node_0' },
  nodes: [
    { id: 'node_0', type: 'content', top: 0, left: 0, text: 'Before', answers: [{ id: 'answer_0_0', join: [{ node: 'node_1' }] }] },
    { id: 'node_1', type: 'content', top: 100, left: 100, groupId: 'node_2', image: { path: 'image.webp' } },
    { id: 'node_2', type: 'group', top: 0, left: 0 },
  ],
  refs: { stat_1: { name: 'Gold', type: 'stat' } },
  categories: [{ id: 'category_1', name: 'Inventory' }],
  frames: [{ id: 'frame_1', name: 'A frame', nodeIds: ['node_1'], groupId: 'node_2', colorId: 'color_1' }],
  frameColors: [{ id: 'color_1', name: 'Blue', value: '#123456' }],
})

describe('Story Memento history', () => {
  let story: ActiveStoryService

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ActiveStoryService] })
    story = TestBed.inject(ActiveStoryService)
    story.load('story-1', 'Story', initialTree())
    story.beginHistorySession()
  })

  const move = (story: ActiveStoryService, left: number) =>
    story.updateTree(draft => { draft.nodes[0].left = left })

  it('restores the exact frozen versions without cloning for history, undo or redo', () => {
    const before = story.entireTree()
    const clone = spyOn(window, 'structuredClone').and.callThrough()
    move(story, 50)
    const after = story.entireTree()
    expect(clone).toHaveBeenCalledTimes(1)
    expect(before.nodes[0].left).toBe(0)
    expect(story.canUndo()).toBeTrue()
    expect(story.canRedo()).toBeFalse()
    expect(story.undoTree()).toBe(before)
    expect(story.entireTree()).toBe(before)
    expect(story.canUndo()).toBeFalse()
    expect(story.canRedo()).toBeTrue()
    expect(story.redoTree()).toBe(after)
    expect(clone).toHaveBeenCalledTimes(1)
    expect(Object.isFrozen(story.entireTree().nodes[0])).toBeTrue()
  })

  it('restores the whole document, including the entry point, subnodes, answers, references, frames and colors', () => {
    const before = story.entireTree()
    story.updateTree(draft => {
      draft.nodes = draft.nodes.filter(node => node.id !== 'node_1')
      delete draft.nodes[0].answers
      draft.refs = {}
      draft.categories = []
      draft.frames = []
      draft.frameColors = []
      draft.entryPoint = { left: 20, top: 30 }
    })
    const after = story.entireTree()
    expect(story.undoTree()).toBe(before)
    expect(story.entireTree()).toEqual(initialTree())
    expect(story.redoTree()).toBe(after)
  })

  it('restores the initial node when undoing and redoing an entry-point change', () => {
    expect(story.initialNode()?.id).toBe('node_0')
    story.updateTree(draft => {
      draft.entryPoint = { left: 20, top: 30, targetNodeId: 'node_1' }
    })
    expect(story.initialNode()?.id).toBe('node_1')
    story.undoTree()
    expect(story.initialNode()?.id).toBe('node_0')
    expect(story.entireTree().entryPoint).toEqual(initialTree().entryPoint)
    story.redoTree()
    expect(story.initialNode()?.id).toBe('node_1')
    expect(story.entireTree().entryPoint).toEqual({ left: 20, top: 30, targetNodeId: 'node_1' })
  })

  it('retains only 15 previous states and shares that budget with redo', () => {
    for (let left = 1; left <= 25; left++) move(story, left)
    for (let left = 24; left >= 10; left--) {
      expect(story.undoTree()?.nodes[0].left).toBe(left)
    }
    expect(story.undoTree()).toBeUndefined()
    expect(story.canUndo()).toBeFalse()
    for (let left = 11; left <= 25; left++) {
      expect(story.redoTree()?.nodes[0].left).toBe(left)
    }
    expect(story.redoTree()).toBeUndefined()
    for (let step = 0; step < 15; step++) expect(story.undoTree()).toBeDefined()
    expect(story.undoTree()).toBeUndefined()
  })

  it('drops redo after a new edit but preserves it after a rejected mutation', () => {
    move(story, 1)
    move(story, 2)
    story.undoTree()
    expect(story.updateTree(() => false)).toBeUndefined()
    expect(story.canRedo()).toBeTrue()
    move(story, 3)
    expect(story.canRedo()).toBeFalse()
    expect(story.redoTree()).toBeUndefined()
    expect(story.undoTree()?.nodes[0].left).toBe(1)
    expect(story.undoTree()?.nodes[0].left).toBe(0)
  })

  it('does not add failed or throwing edits to history', () => {
    expect(story.updateTree(() => false)).toBeUndefined()
    expect(() => story.updateTree(draft => {
      draft.nodes[0].left = 99
      throw new Error('Invalid change')
    })).toThrowError('Invalid change')
    expect(story.entireTree().nodes[0].left).toBe(0)
    expect(story.canUndo()).toBeFalse()
  })

  it('groups nested mutations into one undo step', () => {
    const before = story.entireTree()
    story.groupTreeChanges(() => {
      move(story, 50)
      story.groupTreeChanges(() => story.updateTree(draft => { draft.nodes[0].text = 'After' }))
    })
    const after = story.entireTree()
    expect(story.undoTree()).toBe(before)
    expect(story.undoTree()).toBeUndefined()
    expect(story.redoTree()).toBe(after)
  })

  it('does not record an empty group and can undo a partially completed throwing group', () => {
    story.groupTreeChanges(() => story.updateTree(() => false))
    expect(story.canUndo()).toBeFalse()
    expect(() => story.groupTreeChanges(() => {
      move(story, 10)
      throw new Error('Interrupted')
    })).toThrowError('Interrupted')
    expect(story.undoTree()?.nodes[0].left).toBe(0)
  })

  it('preserves both stacks on a same-story load and clears them only for another story', () => {
    move(story, 1)
    const first = story.entireTree()
    move(story, 2)
    const second = story.entireTree()
    story.undoTree()
    story.load('story-1', 'Story again', first)
    const reloaded = story.entireTree()
    expect(reloaded).toEqual(first)
    expect(story.canUndo()).toBeTrue()
    expect(story.canRedo()).toBeTrue()
    expect(story.redoTree()).toBe(second)
    expect(story.undoTree()).toBe(reloaded)
    expect(story.undoTree()?.nodes[0].left).toBe(0)
    story.load('story-2', 'Other story', initialTree())
    expect(story.undoTree()).toBeUndefined()
    expect(story.redoTree()).toBeUndefined()
  })

  it('releases history on exit and does not record edits outside an editor session', () => {
    move(story, 1)
    story.endHistorySession()
    move(story, 2)
    expect(story.undoTree()).toBeUndefined()
    expect(story.redoTree()).toBeUndefined()
    story.beginHistorySession()
    move(story, 3)
    expect(story.undoTree()?.nodes[0].left).toBe(2)
    expect(story.undoTree()).toBeUndefined()
    story.reset()
    expect(story.canRedo()).toBeFalse()
    expect(story.entireTree().nodes).toEqual([])
  })

  it('coalesces consecutive text saves without evicting an older image deletion', () => {
    const original = story.entireTree()
    story.updateTree(draft => { delete draft.nodes[1].image })
    const deleted = story.entireTree()
    for (let edit = 1; edit <= 30; edit++) {
      story.updateTree(draft => { draft.nodes[0].text = `Edit ${edit}` }, 'node-text:node_0')
      expect(story.retainsImage('image.webp')).toBeTrue()
    }
    const typed = story.entireTree()
    expect(story.undoTree()).toBe(deleted)
    expect(story.undoTree()).toBe(original)
    expect(story.undoTree()).toBeUndefined()
    story.redoTree()
    expect(story.redoTree()).toBe(typed)
  })

  it('starts a new text step after blur, a different field, a non-text action and undo/redo', () => {
    const edit = (text: string, key = 'node-text:node_0') =>
      story.updateTree(draft => { draft.nodes[0].text = text }, key)
    edit('A')
    edit('B')
    story.endHistoryCoalescing()
    edit('C')
    edit('D', 'answer-text:answer_0_0')
    move(story, 5)
    edit('E')
    edit('F')
    expect(story.undoTree()?.nodes[0].text).toBe('D')
    expect(story.redoTree()?.nodes[0].text).toBe('F')
    edit('G')
    expect(story.undoTree()?.nodes[0].text).toBe('F')
    edit('New branch')
    expect(story.canRedo()).toBeFalse()
    expect(story.undoTree()?.nodes[0].text).toBe('F')
    expect(story.undoTree()?.nodes[0].text).toBe('D')
    expect(story.undoTree()?.nodes[0].left).toBe(0)
    expect(story.undoTree()?.nodes[0].text).toBe('C')
    expect(story.undoTree()?.nodes[0].text).toBe('B')
    expect(story.undoTree()?.nodes[0].text).toBe('Before')
  })

  it('invalidates the retained-image index when full stacks replace versions or redo is discarded', () => {
    story.updateTree(draft => { delete draft.nodes[1].image })
    expect(story.retainsImage('image.webp')).toBeTrue()
    for (let left = 1; left <= 14; left++) move(story, left)
    expect(story.retainsImage('image.webp')).toBeTrue()
    move(story, 15)
    expect(story.retainsImage('image.webp')).toBeFalse()
    story.updateTree(draft => { draft.nodes[1].image = { path: 'new.webp' } })
    story.undoTree()
    expect(story.retainsImage('new.webp')).toBeTrue()
    move(story, 16)
    expect(story.retainsImage('new.webp')).toBeFalse()
  })

  it('keeps images reachable in past and future versions until their history is gone', () => {
    story.updateTree(draft => { delete draft.nodes[1].image })
    expect(story.retainsImage('image.webp')).toBeTrue()
    story.undoTree()
    expect(story.retainsImage('image.webp')).toBeTrue()
    story.redoTree()
    story.endHistorySession()
    expect(story.retainsImage('image.webp')).toBeFalse()
  })
})
