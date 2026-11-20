import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'

import { BoardControlsComponent } from './board-controls.component'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { ViewportService } from 'src/app/core/services/viewport.service'

describe('BoardControlsComponent', () => {
  let component: BoardControlsComponent
  let fixture: ComponentFixture<BoardControlsComponent>
  const host = () => fixture.nativeElement as HTMLElement

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardControlsComponent],
      providers: [provideRouter([])],
    }).compileComponents()
    TestBed.inject(ViewportService).mobile.set(false)
    fixture = TestBed.createComponent(BoardControlsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  afterEach(() => host().remove())

  it('opens and closes the project panel it sits under, and says whether it is open', () => {
    const toggled = spyOn(component.sidebarToggled, 'emit')
    const toggle = host().querySelector<HTMLButtonElement>('.controls--start button')!
    expect(toggle.getAttribute('aria-label')).toBe('Project panel')
    expect(toggle.getAttribute('aria-controls')).toBe('story-panel')
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    fixture.componentRef.setInput('sidebarOpen', true)
    fixture.detectChanges()
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
    toggle.click()
    expect(toggled).toHaveBeenCalledTimes(1)
  })

  it('undoes and redoes, with availability derived from the in-memory history', () => {
    const story = TestBed.inject(ActiveStoryService)
    story.load('story-1', 'Story', { nodes: [] })
    story.beginHistorySession()
    fixture.detectChanges()
    const undo = host().querySelector<HTMLButtonElement>('button[aria-label="Undo"]')!
    const redo = host().querySelector<HTMLButtonElement>('button[aria-label="Redo"]')!
    expect(undo.title).toContain('Ctrl/Cmd+Z')
    expect(undo.disabled).toBeTrue()
    expect(redo.disabled).toBeTrue()
    story.updateTree(draft => { draft.nodes.push({ id: 'node_0', type: 'content', top: 0, left: 0 }) })
    fixture.detectChanges()
    const requested = spyOn(component.historyRequested, 'emit')
    undo.click()
    expect(requested).toHaveBeenCalledWith('undo')
    story.undoTree()
    fixture.detectChanges()
    expect(redo.disabled).toBeFalse()
    redo.click()
    expect(requested).toHaveBeenCalledWith('redo')
  })

  it('creates every kind of node from a button, the most used first, named as in the node header', () => {
    const created = spyOn(component.createRequested, 'emit')
    const buttons = Array.from(host().querySelectorAll<HTMLButtonElement>('.controls--create button'))
    expect(buttons.map((button) => button.textContent?.trim())).toEqual(['Choice', 'Free text', 'Distributor', 'End'])
    expect(buttons.map((button) => button.title)).toEqual(['Content node - Selection', 'Content node - Free text', 'Distributor node', 'End node'])
    buttons.forEach((button) => button.click())
    expect(created.calls.allArgs()).toEqual([['content'], ['text'], ['distributor'], ['end']])
  })

  it('shows the zoom and asks for every change of view', () => {
    fixture.componentRef.setInput('zoom', 34)
    fixture.detectChanges()
    const view = spyOn(component.viewRequested, 'emit')
    const end = host().querySelector<HTMLElement>('.controls--end')!
    expect(end.querySelector('.zoom')?.textContent?.trim()).toBe('34%')
    const buttons = Array.from(end.querySelectorAll<HTMLButtonElement>('button')).filter((button) => !button.classList.contains('help'))
    expect(buttons.map((button) => button.getAttribute('aria-label') ?? button.title))
      .toEqual(['Zoom out', 'Zoom 34%. Back to 100%', 'Zoom in', 'Fit the story on screen', 'Go to Start'])
    buttons.forEach((button) => button.click())
    expect(view.calls.allArgs()).toEqual([['zoomOut'], ['zoomReset'], ['zoomIn'], ['fit'], ['start']])
  })

  it('lists the keyboard shortcuts from its button and from the ? key', () => {
    document.body.appendChild(host())
    const panel = host().querySelector<HTMLElement>('.shortcuts')!
    host().querySelector<HTMLButtonElement>('button.help')!.click()
    expect(panel.matches(':popover-open')).toBeTrue()
    expect(panel.querySelector('h2')?.textContent).toBe('Keyboard shortcuts')
    expect(panel.textContent).toContain('Shift or Ctrl + drag on the board')
    // The rest of the help, now that the board has no account menu leading to it.
    const guide = panel.querySelector<HTMLAnchorElement>('a.shortcuts__guide')!
    expect(guide.textContent).toContain('Full guide')
    expect(guide.getAttribute('href')).toMatch(/docs\/features$/)
    expect(guide.target).toBe('_blank')
    component.toggleShortcuts()
    expect(panel.matches(':popover-open')).toBeFalse()
  })

  it('keeps one button that offers the kinds of node where the creation buttons do not fit', () => {
    TestBed.inject(ViewportService).mobile.set(true)
    fixture.detectChanges()
    document.body.appendChild(host())
    expect(host().querySelector('.controls--create')).toBeNull()
    expect(host().querySelector('.controls--end')).toBeNull()
    const requested = spyOn(component.createMenuRequested, 'emit')
    host().querySelector<HTMLButtonElement>('polo-basic-button.createMenu button')!.click()
    expect(requested).toHaveBeenCalledTimes(1)
  })
})
