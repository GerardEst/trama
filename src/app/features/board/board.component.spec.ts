import { CdkDrag, CdkDragEnd, DragRef } from '@angular/cdk/drag-drop'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { node } from 'src/app/core/interfaces/interfaces'
import { StoryEditorService } from './services/story-editor.service'
import { BoardComponent } from './board.component'
import { BoardAnchorRegistryService } from './services/board-anchor-registry.service'

describe('BoardComponent', () => {
  let component: BoardComponent
  let fixture: ComponentFixture<BoardComponent>
  let storyEditor: StoryEditorService

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BoardComponent],
    })
    fixture = TestBed.createComponent(BoardComponent)
    component = fixture.componentInstance
    storyEditor = fixture.debugElement.injector.get(StoryEditorService)
  })

  afterEach(() => fixture.destroy())

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('provides isolated panzoom state to every board', () => {
    const secondFixture = TestBed.createComponent(BoardComponent)

    expect(secondFixture.componentInstance.panzoom).not.toBe(component.panzoom)

    secondFixture.destroy()
  })

  it('always clears join state when released away from a valid node', () => {
    fixture.detectChanges()
    const board = component.boardElement!.nativeElement
    const origin = document.createElement('div')
    origin.dataset['boardOrigin'] = 'node_0'
    board.appendChild(origin)
    const setPointerCapture = spyOn(board, 'setPointerCapture')
    spyOn(component.panzoom, 'resumeDrag')
    component.checkDragStart({
      button: 0,
      target: origin,
      pointerId: 7,
      clientX: 10,
      clientY: 20,
    } as unknown as PointerEvent)
    spyOn(document, 'elementFromPoint').and.returnValue(null)

    component.checkDragStop({
      button: 0,
      pointerId: 7,
      x: 30,
      y: 40,
    } as PointerEvent)

    expect(setPointerCapture).toHaveBeenCalledWith(7)
    expect(component.isDrawingJoin).toBeFalse()
    expect(component.joinStroke).toBeUndefined()
    expect(component.panzoom.resumeDrag).toHaveBeenCalled()
  })

  it('commits the CDK drag position without parsing CSS transforms', () => {
    const storyNode: node = {
      id: 'node_0',
      left: 12.5,
      top: 20.25,
      type: 'content',
    }
    const reset = jasmine.createSpy('reset')
    const source = {
      getFreeDragPosition: () => ({ x: 7.25, y: -5.5 }),
      reset,
    } as unknown as CdkDrag
    spyOn(storyEditor, 'updateNodePosition')

    component.nodeDragEnded({ source } as CdkDragEnd, storyNode)

    expect(reset).toHaveBeenCalled()
    expect(storyEditor.updateNodePosition).toHaveBeenCalledWith(
      'node_0',
      19.75,
      14.75
    )
  })

  it('captures a join pointer and resolves semantic target metadata', () => {
    fixture.detectChanges()
    const board = component.boardElement!.nativeElement
    const anchors = fixture.debugElement.injector.get(
      BoardAnchorRegistryService
    )
    const origin = document.createElement('div')
    origin.dataset['boardOrigin'] = 'answer_0_0'
    const targetArea = document.createElement('div')
    targetArea.dataset['boardJoinNode'] = 'node_1'
    targetArea.dataset['boardJoinAnchor'] = 'node_1_joiner--answers'
    targetArea.dataset['boardJoinToAnswers'] = 'true'
    const targetAnchor = document.createElement('div')
    spyOn(targetAnchor, 'getBoundingClientRect').and.returnValue(
      new DOMRect(100, 200, 20, 10)
    )
    board.append(origin, targetArea)
    anchors.register('node_1_joiner--answers', targetAnchor)
    spyOn(board, 'setPointerCapture')
    spyOn(document, 'elementFromPoint').and.returnValue(targetArea)
    spyOn(storyEditor, 'updateJoinOfOption')

    component.checkDragStart({
      button: 0,
      target: origin,
      pointerId: 3,
      clientX: 10,
      clientY: 20,
    } as unknown as PointerEvent)
    component.checkDrag({
      pointerId: 3,
      x: 50,
      y: 60,
      clientX: 50,
      clientY: 60,
    } as PointerEvent)

    expect(component.joinStroke).toEqual({
      originId: 'answer_0_0',
      from: origin,
      to: { x: 110, y: 205 },
    })

    component.checkDragStop({
      button: 0,
      pointerId: 3,
      x: 50,
      y: 60,
    } as PointerEvent)

    expect(storyEditor.updateJoinOfOption).toHaveBeenCalledWith(
      'answer_0_0',
      'node_1',
      true
    )
  })

  it('compensates node dragging for the board zoom', () => {
    spyOn(component.panzoom, 'getScale').and.returnValue(0.5)
    const dimensions = new DOMRect(100, 100, 200, 100)

    const position = component.constrainNodePosition(
      { x: 150, y: 130 },
      {} as DragRef,
      dimensions,
      { x: 10, y: 10 }
    )

    expect(position).toEqual({ x: 180, y: 140 })
  })

  it('disposes panzoom with the board', () => {
    spyOn(component.panzoom, 'destroy')

    component.ngOnDestroy()

    expect(component.panzoom.destroy).toHaveBeenCalled()
  })
})
