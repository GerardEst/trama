import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { By } from '@angular/platform-browser'
import { MenuTreeLegendComponent } from './components/menu-tree-legend/menu-tree-legend.component'

import { DashboardComponent } from './dashboard.component'

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
