import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { By } from '@angular/platform-browser'
import { MenuTreeLegendComponent } from './components/menu-tree-legend/menu-tree-legend.component'

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

  it('opens the linear view only from the legend action, without a duplicate top button', () => {
    const open = spyOn(component, 'openLinearView')
    const legend = fixture.debugElement.query(By.directive(MenuTreeLegendComponent)).componentInstance as MenuTreeLegendComponent
    legend.linearRequested.emit()
    expect(open).toHaveBeenCalledTimes(1)
    expect(fixture.nativeElement.querySelector('.workspaceToggle')).toBeNull()
    expect(fixture.nativeElement.querySelector('.workspace > polo-menu-top')).not.toBeNull()
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

  it('shows the grouping control before any nodes are selected', () => {
    const button: HTMLButtonElement | null = fixture.nativeElement.querySelector(
      '.groupToolbar button'
    )
    expect(button).not.toBeNull()
    expect(button?.disabled).toBeTrue()
  })
})
