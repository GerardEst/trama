import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing'
import { signal } from '@angular/core'
import { provideRouter } from '@angular/router'
import { DatabaseService } from 'src/app/core/services/database.service'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { StoryMutationService } from 'src/app/shared/services/story-mutation.service'
import { BoardComponent } from '../board/board.component'
import { DashboardComponent } from './dashboard.component'

describe('Dashboard history shortcuts', () => {
  let fixture: ComponentFixture<DashboardComponent>
  let component: DashboardComponent
  let story: ActiveStoryService
  let mutations: StoryMutationService

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [provideRouter([]), {
        provide: DatabaseService,
        useValue: { user: signal(null), saveTreeToDB: () => Promise.resolve(true) },
      }],
    })
    fixture = TestBed.createComponent(DashboardComponent)
    component = fixture.componentInstance
    story = TestBed.inject(ActiveStoryService)
    mutations = TestBed.inject(StoryMutationService)
    story.load('story-1', 'Story', { nodes: [{ id: 'node_0', type: 'content', top: 0, left: 0 }] })
    mutations.update(draft => { draft.nodes[0].left = 10 })
  })

  function shortcut(target: EventTarget = document, extra: KeyboardEventInit = {}) {
    const event = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true, cancelable: true, ...extra })
    target.dispatchEvent(event)
    return event
  }

  it('supports Ctrl+Z, Ctrl+Shift+Z, Ctrl+Y and the Cmd equivalents', fakeAsync(() => {
    expect(shortcut().defaultPrevented).toBeTrue()
    expect(story.entireTree().nodes[0].left).toBe(0)
    expect(shortcut(document, { shiftKey: true }).defaultPrevented).toBeTrue()
    expect(story.entireTree().nodes[0].left).toBe(10)
    shortcut()
    expect(shortcut(document, { key: 'y' }).defaultPrevented).toBeTrue()
    expect(story.entireTree().nodes[0].left).toBe(10)
    expect(shortcut(document, { ctrlKey: false, metaKey: true }).defaultPrevented).toBeTrue()
    expect(shortcut(document, { ctrlKey: false, metaKey: true, shiftKey: true }).defaultPrevented).toBeTrue()
    expect(story.entireTree().nodes[0].left).toBe(10)
    flushMicrotasks()
  }))

  it('leaves undo inside inputs, text editors and dialogs to their own controls', fakeAsync(() => {
    const host = fixture.nativeElement as HTMLElement
    for (const tag of ['input', 'textarea', 'select', 'div']) {
      const control = document.createElement(tag)
      if (tag === 'div') control.contentEditable = 'true'
      host.appendChild(control)
      expect(shortcut(control).defaultPrevented).toBeFalse()
      control.remove()
    }
    const dialog = document.createElement('section')
    dialog.setAttribute('role', 'dialog')
    const button = document.createElement('button')
    dialog.appendChild(button)
    host.appendChild(dialog)
    expect(shortcut(button).defaultPrevented).toBeFalse()
    expect(story.entireTree().nodes[0].left).toBe(10)
    flushMicrotasks()
  }))

  it('ignores unrelated focus, handled events, Alt and repeated keys', fakeAsync(() => {
    const outside = document.createElement('button')
    document.body.appendChild(outside)
    try {
      expect(shortcut(outside).defaultPrevented).toBeFalse()
    } finally { outside.remove() }
    shortcut(document, { key: 'a', ctrlKey: false })
    shortcut(document, { key: 'a' })
    shortcut(document, { altKey: true })
    shortcut(document, { repeat: true })
    const handled = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, cancelable: true })
    handled.preventDefault()
    component.handleHistoryShortcut(handled)
    expect(story.entireTree().nodes[0].left).toBe(10)
    flushMicrotasks()
  }))

  it('does not intercept an empty history or alter a gesture still in progress', fakeAsync(() => {
    component.board = jasmine.createSpyObj<BoardComponent>('Board', ['commitEdits', 'historyRestored'], { isInteracting: true })
    expect(shortcut().defaultPrevented).toBeFalse()
    component.board = undefined
    component.resizing.set(true)
    expect(shortcut().defaultPrevented).toBeFalse()
    component.resizing.set(false)
    shortcut()
    expect(shortcut().defaultPrevented).toBeFalse()
    flushMicrotasks()
  }))

  it('flushes pending text and reconciles board selection, group navigation and flows when restoring', fakeAsync(() => {
    const board = jasmine.createSpyObj<BoardComponent>('Board', ['commitEdits', 'historyRestored'], { isInteracting: false })
    component.board = board
    expect(component.restoreHistory('undo')).toBeTrue()
    expect(board.commitEdits).toHaveBeenCalledTimes(1)
    expect(board.historyRestored).toHaveBeenCalledTimes(1)
    flushMicrotasks()
  }))

  it('releases both history stacks and the shortcut listener when leaving the editor', fakeAsync(() => {
    const restore = spyOn(component, 'restoreHistory').and.callThrough()
    mutations.update(draft => { draft.nodes[0].left = 20 })
    shortcut()
    expect(restore).toHaveBeenCalledTimes(1)
    expect(story.canUndo()).toBeTrue()
    expect(story.canRedo()).toBeTrue()
    fixture.destroy()
    restore.calls.reset()
    expect(story.canUndo()).toBeFalse()
    expect(story.canRedo()).toBeFalse()
    expect(shortcut().defaultPrevented).toBeFalse()
    expect(restore).not.toHaveBeenCalled()
    mutations.update(draft => { draft.nodes[0].left = 30 })
    expect(story.canUndo()).toBeFalse()
    flushMicrotasks()
  }))
})
