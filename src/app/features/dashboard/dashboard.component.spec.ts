import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { By } from '@angular/platform-browser'
import { BoardActionsComponent } from './components/board-actions/board-actions.component'
import { BoardControlsComponent } from './components/board-controls/board-controls.component'

import { DashboardComponent } from './dashboard.component'
import { DatabaseService } from 'src/app/core/services/database.service'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { StoryMutationService } from 'src/app/shared/services/story-mutation.service'
import { appUser } from 'src/app/core/interfaces/interfaces'

describe('DashboardComponent', () => {
  let component: DashboardComponent
  let fixture: ComponentFixture<DashboardComponent>

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [provideRouter([])],
    })
    fixture = TestBed.createComponent(DashboardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('shows authors without stories an example that is not stored until they change it', async () => {
    const db = TestBed.inject(DatabaseService)
    db.user.set({ id: 'new-author' } as appUser)
    spyOn(db, 'getNewestStory').and.resolveTo(false)
    const create = spyOn(db, 'createStoryWithID').and.resolveTo(true)
    await component.initBoard(null)
    const activeStory = TestBed.inject(ActiveStoryService)
    const mutations = TestBed.inject(StoryMutationService)
    expect(activeStory.storyName()).toBe('The Last Threshold')
    expect(activeStory.initialNode()?.id).toBe('node_0')
    expect(mutations.isDraft()).toBeTrue()
    expect(localStorage.getItem('polo-id')).not.toBe(activeStory.storyId())
    expect(create).not.toHaveBeenCalled()
  })

  it('starts at 70/30, resets to that split and bounds keyboard resizing', () => {
    expect(component.boardWidth()).toBe(70)
    component.resizeWithKeyboard(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    expect(component.boardWidth()).toBe(75)
    component.resizeWithKeyboard(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    expect(component.boardWidth()).toBe(75)
    component.resizeWithKeyboard(new KeyboardEvent('keydown', { key: 'Home' }))
    expect(component.boardWidth()).toBe(70)
    for (let index = 0; index < 8; index++) {
      component.resizeWithKeyboard(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    }
    expect(component.boardWidth()).toBe(35)
  })

  it('resizes from the divider without reacting to every document pointer move', () => {
    component.openLinearView()
    fixture.detectChanges()
    const divider = fixture.nativeElement.querySelector('.workspaceDivider') as HTMLElement
    spyOn(divider, 'setPointerCapture')
    const resize = spyOn(component, 'resizeWorkspace').and.callThrough()

    document.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerId: 5 }))
    expect(resize).not.toHaveBeenCalled()

    divider.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerId: 5 }))
    divider.dispatchEvent(new PointerEvent('pointermove', {
      bubbles: true, pointerId: 5, clientX: window.innerWidth / 2,
    }))
    expect(component.boardWidth()).toBe(50)
    divider.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 5 }))
    expect(component.resizing()).toBeFalse()
  })

  it('opens the preview from the story actions and keeps the panels inside the board pane', () => {
    const open = spyOn(component, 'openLinearView')
    const actions = fixture.debugElement.query(By.directive(BoardActionsComponent)).componentInstance as BoardActionsComponent
    actions.previewRequested.emit()
    expect(open).toHaveBeenCalledTimes(1)
    expect(fixture.nativeElement.querySelector('.workspaceToggle')).toBeNull()
    for (const panel of ['polo-board-header', 'polo-board-actions', 'polo-story-panel', 'polo-board-controls']) {
      expect(fixture.nativeElement.querySelector(`.boardPane > .chrome > ${panel}`)).withContext(panel).not.toBeNull()
    }
  })

  it('opens and closes the project panel and remembers it', () => {
    const previous = localStorage.getItem('polo-board-panel')
    try {
      const controls = fixture.debugElement.query(By.directive(BoardControlsComponent)).componentInstance as BoardControlsComponent
      component.setSidebar(false)
      controls.sidebarToggled.emit()
      fixture.detectChanges()
      expect(component.sidebarOpen()).toBeTrue()
      expect(localStorage.getItem('polo-board-panel')).toBe('open')
      expect(fixture.nativeElement.querySelector('#story-panel').inert).toBeFalse()
      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: '.', ctrlKey: true, bubbles: true, cancelable: true }))
      expect(component.sidebarOpen()).toBeFalse()
      expect(localStorage.getItem('polo-board-panel')).toBe('closed')
    } finally {
      if (previous === null) localStorage.removeItem('polo-board-panel')
      else localStorage.setItem('polo-board-panel', previous)
    }
  })

  it('sends the view controls to the board, fitting the story clear of the open panel', () => {
    const board = component.board!
    const zoomBy = spyOn(board, 'zoomBy')
    const zoomTo = spyOn(board, 'zoomTo')
    const fit = spyOn(board, 'fitToView')
    const start = spyOn(board, 'centerToEntryPoint')
    component.changeView('zoomIn')
    component.changeView('zoomOut')
    component.changeView('zoomReset')
    component.setSidebar(true)
    component.changeView('fit')
    component.changeView('start')
    expect(zoomBy.calls.allArgs()).toEqual([[1.25], [0.8]])
    expect(zoomTo).toHaveBeenCalledOnceWith(1)
    expect(fit.calls.mostRecent().args[0].left).toBeGreaterThan(300)
    expect(start).toHaveBeenCalledTimes(1)
    localStorage.removeItem('polo-board-panel')
  })

  it('keeps explicit location independent of highlighting and cancels following when cleared', () => {
    const reveal = spyOn(component.board!, 'revealNode')
    const cancel = spyOn(component.board!, 'cancelNodeReveal')
    component.highlightPlayingNode('node_0')
    component.revealPlayingNode('node_1')
    expect(reveal).toHaveBeenCalledOnceWith('node_1')
    expect(component.playingNodeId()).toBe('node_0')
    component.highlightPlayingNode(undefined)
    expect(component.playingNodeId()).toBeUndefined()
    expect(cancel).toHaveBeenCalledTimes(1)
  })

  it('keeps the grouping control out of the way until several nodes are selected', () => {
    expect(fixture.nativeElement.querySelector('.groupToolbar')).toBeNull()
  })
})
