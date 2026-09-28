import {
  CdkDrag,
  CdkDragEnd,
  CdkDragMove,
  CdkDragStart,
  DragRef,
} from '@angular/cdk/drag-drop'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { By } from '@angular/platform-browser'
import { node } from 'src/app/core/interfaces/interfaces'
import { DatabaseService } from 'src/app/core/services/database.service'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
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

  afterEach(() => {
    fixture.nativeElement.remove()
    fixture.destroy()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('removes a node event from the rendered board, tree and queued save', () => {
    const activeStory = TestBed.inject(ActiveStoryService)
    const database = TestBed.inject(DatabaseService)
    const save = spyOn(database, 'saveTreeToDB').and.resolveTo(true)
    activeStory.load('story-1', 'Story', {
      nodes: [
        {
          id: 'node_0',
          type: 'content',
          left: 0,
          top: 0,
          events: [
            {
              id: 'event_1',
              target: 'condition_1',
              type: 'condition',
              amount: '1',
              action: 'alterCondition',
            },
          ],
        },
      ],
      refs: { condition_1: { name: 'key', type: 'condition' } },
    })
    fixture.detectChanges()
    const host: HTMLElement = fixture.nativeElement
    host.querySelector<HTMLButtonElement>('.node__event')!.click()
    fixture.detectChanges()
    host.querySelector<HTMLButtonElement>('.addEvent__button--delete')!.click()
    fixture.detectChanges()
    host
      .querySelector<HTMLButtonElement>('.addEvent__button--confirmDelete')!
      .click()
    fixture.detectChanges()

    expect(activeStory.entireTree().nodes[0].events).toEqual([])
    expect(host.querySelector('.node__event')).toBeNull()
    expect(save.calls.mostRecent().args[0]).toBe('story-1')
    expect(save.calls.mostRecent().args[1].nodes[0].events).toEqual([])
  })

  it('keeps anchored editors open across repeated board pans after interacting inside', async () => {
    const activeStory = TestBed.inject(ActiveStoryService)
    activeStory.load('story-pan', 'Story', {
      nodes: [
        {
          id: 'node_0',
          type: 'content',
          left: 0,
          top: 0,
          answers: [{
            id: 'answer_0_0',
            text: 'Continue',
            requirements: [{
              target: 'condition_1',
              type: 'condition',
              amount: 1,
            }],
          }],
          events: [
            {
              id: 'event_1',
              target: 'condition_1',
              type: 'condition',
              amount: '1',
              action: 'alterCondition',
            },
          ],
        },
      ],
      refs: { condition_1: { name: 'key', type: 'condition' } },
    })
    fixture.detectChanges()
    const host: HTMLElement = fixture.nativeElement
    document.body.appendChild(host)
    const board = component.boardElement!.nativeElement
    for (const trigger of [
      '.node > .node__events .node__event',
      'polo-answer .node__addEventButton',
      'polo-answer .node__addRequirementButton',
      'polo-answer .node__requirement',
    ]) {
      host.querySelector<HTMLButtonElement>(trigger)!.click()
      fixture.detectChanges()
      await new Promise<void>((resolve) => setTimeout(resolve, 0))

      const panel = host.querySelector<HTMLElement>('.anchoredPopover__panel')!
      // The inherited PopupBase listener skips its first click. Exercise it before panning.
      panel.querySelector<HTMLElement>('header')!.click()
      fixture.detectChanges()

      for (let pan = 0; pan < 2; pan++) {
        board.dispatchEvent(new MouseEvent('mousedown', {
          bubbles: true, button: 0, clientX: 20, clientY: 20,
        }))
        document.dispatchEvent(new MouseEvent('mousemove', {
          bubbles: true, clientX: 80, clientY: 50,
        }))
        document.dispatchEvent(new MouseEvent('mouseup', {
          bubbles: true, button: 0, clientX: 80, clientY: 50,
        }))
        board.dispatchEvent(new MouseEvent('click', {
          bubbles: true, clientX: 80, clientY: 50,
        }))
        fixture.detectChanges()

        expect(host.querySelector('.anchoredPopover__panel'))
          .withContext(`${trigger}, pan ${pan + 1}`).toBe(panel)
      }

      board.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      fixture.detectChanges()
      expect(host.querySelector('.anchoredPopover__panel')).withContext(trigger).toBeNull()
    }
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

  it('selects intersecting nodes with a Ctrl-marquee at half zoom without panning', () => {
    const activeStory = TestBed.inject(ActiveStoryService)
    activeStory.load('selection', 'Story', {
      nodes: [
        { id: 'node_0', type: 'content', left: 0, top: 0 },
        { id: 'node_1', type: 'content', left: 200, top: 0 },
        { id: 'node_2', type: 'content', left: 400, top: 0 },
      ],
    })
    fixture.detectChanges()
    const board = component.boardElement!.nativeElement
    const nodes = Array.from(board.querySelectorAll<HTMLElement>('polo-node'))
    spyOn(board, 'getBoundingClientRect').and.returnValue(
      new DOMRect(100, 200, board.offsetWidth / 2, 5000)
    )
    spyOn(board, 'setPointerCapture')
    spyOn(board, 'hasPointerCapture').and.returnValue(false)
    spyOn(component.panzoom, 'pauseDrag')
    spyOn(component.panzoom, 'resumeDrag')
    spyOn(nodes[0], 'getBoundingClientRect').and.returnValue(
      new DOMRect(145, 245, 30, 30)
    )
    spyOn(nodes[1], 'getBoundingClientRect').and.returnValue(
      new DOMRect(225, 275, 30, 30)
    )
    spyOn(nodes[2], 'getBoundingClientRect').and.returnValue(
      new DOMRect(400, 400, 30, 30)
    )

    board.dispatchEvent(new PointerEvent('pointerdown', {
      bubbles: true, button: 0, ctrlKey: true, pointerId: 3,
      clientX: 150, clientY: 250,
    }))
    board.dispatchEvent(new PointerEvent('pointermove', {
      bubbles: true, pointerId: 3, clientX: 240, clientY: 290,
    }))
    fixture.detectChanges()

    expect(component.selectionBox).toEqual({
      left: 100, top: 100, width: 180, height: 80,
    })
    expect(board.querySelector('.selectionBox')).not.toBeNull()
    expect(nodes[0].classList.contains('node--selected')).toBeTrue()
    expect(nodes[1].classList.contains('node--selected')).toBeTrue()
    expect(nodes[2].classList.contains('node--selected')).toBeFalse()
    expect(component.panzoom.pauseDrag).toHaveBeenCalled()

    board.dispatchEvent(new PointerEvent('pointerup', {
      bubbles: true, button: 0, pointerId: 3, clientX: 240, clientY: 290,
    }))
    fixture.detectChanges()
    expect(board.querySelector('.selectionBox')).toBeNull()
    expect(component.selectedNodeIds.size).toBe(2)
    expect(component.panzoom.resumeDrag).toHaveBeenCalled()
  })

  it('shows a disabled group button on dashboard boards until selection is valid', () => {
    component.groupControls = true
    fixture.detectChanges()
    const host: HTMLElement = fixture.nativeElement
    const button = host.querySelector<HTMLButtonElement>(
      '.groupToolbar button'
    )!
    expect(button).not.toBeNull()
    expect(button.disabled).toBeTrue()
    expect(fixture.nativeElement.textContent).toContain('Ctrl + drag')
  })

  it('groups selected nodes and navigates between board levels', () => {
    component.groupControls = true
    spyOn(TestBed.inject(DatabaseService), 'saveTreeToDB').and.resolveTo(true)
    const activeStory = TestBed.inject(ActiveStoryService)
    activeStory.load('grouping', 'Story', {
      nodes: [
        { id: 'node_0', type: 'content', left: 0, top: 0, join: [{ node: 'node_1' }] },
        { id: 'node_1', type: 'content', left: 200, top: 0 },
        { id: 'node_2', type: 'content', left: 400, top: 0, join: [{ node: 'node_0' }] },
      ],
    })
    fixture.detectChanges()
    component.selectedNodeIds = new Set(['node_0', 'node_1'])
    component.boardElement!.nativeElement.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    fixture.detectChanges()
    const disabledButton = (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('.groupToolbar button')!
    expect(disabledButton.disabled).toBeTrue()
    expect(fixture.nativeElement.textContent).toContain('start node cannot be grouped')
    component.selectedNodeIds = new Set(['node_1', 'node_2'])
    component.boardElement!.nativeElement.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    fixture.detectChanges()
    const host: HTMLElement = fixture.nativeElement
    const groupButton = host.querySelector<HTMLButtonElement>('.groupToolbar button')!
    expect(groupButton.disabled).toBeFalse()
    groupButton.click()
    fixture.detectChanges()

    expect(host.querySelectorAll('polo-node').length).toBe(1)
    expect(host.querySelectorAll('.groupNode').length).toBe(1)
    expect(host.querySelectorAll('.groupNode__port').length).toBe(2)
    host.querySelector<HTMLButtonElement>('.groupNode__actions button')!.click()
    fixture.detectChanges()
    expect(component.currentGroupId).toBe('node_3')
    expect(host.querySelectorAll('polo-node').length).toBe(2)
    expect(host.querySelectorAll('.boundaryNode').length).toBe(2)
    expect(host.querySelector('.groupNode')).toBeNull()

    host.querySelector<HTMLButtonElement>('.groupToolbar button')!.click()
    fixture.detectChanges()
    expect(component.currentGroupId).toBeUndefined()
    host.querySelectorAll<HTMLButtonElement>('.groupNode__actions button')[1].click()
    fixture.detectChanges()
    expect(host.querySelectorAll('polo-node').length).toBe(3)
    expect(host.querySelector('.groupNode')).toBeNull()
  })

  it('frames nodes in place, edits the label and drags all members in one save', () => {
    component.groupControls = true
    const database = TestBed.inject(DatabaseService)
    const save = spyOn(database, 'saveTreeToDB').and.resolveTo(true)
    const activeStory = TestBed.inject(ActiveStoryService)
    activeStory.load('frame-story', 'Story', {
      nodes: [
        { id: 'node_0', type: 'content', left: 10, top: 20, join: [{ node: 'node_1' }] },
        { id: 'node_1', type: 'end', left: 300, top: 100 },
        { id: 'node_2', type: 'end', left: 600, top: 200 },
      ],
    })
    fixture.detectChanges()
    component.selectedNodeIds = new Set(['node_0', 'node_1'])
    component.boardElement!.nativeElement.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    fixture.detectChanges()
    const host: HTMLElement = fixture.nativeElement
    expect(component.canFrameSelection()).toBeTrue()
    expect(host.querySelectorAll<HTMLButtonElement>('.groupToolbar button')[1].disabled).toBeFalse()
    host.querySelectorAll<HTMLButtonElement>('.groupToolbar button')[1].click()
    expect(activeStory.entireTree().frames?.length).toBe(1)
    expect(component.visibleFrames().length).toBe(1)
    fixture.detectChanges()

    expect(host.querySelectorAll('polo-node').length).toBe(3)
    expect(host.querySelector('.boardFrame')).not.toBeNull()
    expect(activeStory.entireTree().nodes[0].join).toEqual([{ node: 'node_1' }])
    const frame = activeStory.entireTree().frames![0]
    const label = host.querySelector<HTMLInputElement>('.boardFrame input')!
    label.value = 'Act one'
    label.dispatchEvent(new Event('change'))
    fixture.detectChanges()
    expect(activeStory.entireTree().frames![0].name).toBe('Act one')

    const frameDrag = fixture.debugElement.query(By.css('.boardFrame'))
      .injector.get(CdkDrag) as CdkDrag<string>
    const start = component.getFrameDragPosition(frame)
    const moved = spyOn(frameDrag, 'getFreeDragPosition').and.returnValue(start)
    const followers = component.nodeDrags!.toArray()
    const firstMove = spyOn(followers[0], 'setFreeDragPosition')
    const secondMove = spyOn(followers[1], 'setFreeDragPosition')
    const thirdMove = spyOn(followers[2], 'setFreeDragPosition')
    spyOn(storyEditor, 'updateNodePositions').and.callThrough()
    component.frameDragStarted({ source: frameDrag } as CdkDragStart<string>, frame)
    moved.and.returnValue({ x: start.x + 50, y: start.y - 25 })
    component.nodeDragCheck({ source: frameDrag } as CdkDragMove<string>)
    expect(firstMove).toHaveBeenCalledWith({ x: 60, y: -5 })
    expect(secondMove).toHaveBeenCalledWith({ x: 350, y: 75 })
    expect(thirdMove).not.toHaveBeenCalled()
    component.frameDragEnded({ source: frameDrag } as CdkDragEnd<string>)
    expect(storyEditor.updateNodePositions).toHaveBeenCalledTimes(1)
    expect(activeStory.entireTree().nodes.map((node) => [node.left, node.top])).toEqual([
      [60, -5], [350, 75], [600, 200],
    ])
    expect(save).toHaveBeenCalled()
    fixture.detectChanges()
    host.querySelector<HTMLButtonElement>('.boardFrame button')!.click()
    fixture.detectChanges()
    expect(activeStory.entireTree().frames).toEqual([])
    expect(host.querySelectorAll('polo-node').length).toBe(3)
  })

  it('offers a remove-from-frame action on a framed node without removing the node', () => {
    const activeStory = TestBed.inject(ActiveStoryService)
    spyOn(TestBed.inject(DatabaseService), 'saveTreeToDB').and.resolveTo(true)
    activeStory.load('unframe', 'Story', {
      nodes: [
        { id: 'node_0', type: 'content', left: 0, top: 0, join: [{ node: 'node_1' }] },
        { id: 'node_1', type: 'end', left: 200, top: 100 },
        { id: 'node_2', type: 'end', left: 450, top: 100 },
      ],
    })
    storyEditor.frameNodes(new Set(['node_0', 'node_1', 'node_2']))
    fixture.detectChanges()
    const host: HTMLElement = fixture.nativeElement
    const framedNode = host.querySelectorAll<HTMLElement>('polo-node')[1]
    const drag = component.nodeDrags!.toArray()[1]
    spyOn(drag, 'getFreeDragPosition').and.returnValue({ x: 750, y: 100 })
    component.nodeDragEnded(
      { source: drag, dropPoint: { x: 9000, y: 9000 } } as CdkDragEnd<string>,
      activeStory.entireTree().nodes[1]
    )
    expect(activeStory.entireTree().frames?.[0].nodeIds).toEqual(['node_0', 'node_1', 'node_2'])
    fixture.detectChanges()
    const frame = activeStory.entireTree().frames![0]
    const bounds = component.frameBounds(frame)
    const right = bounds.left + bounds.width

    framedNode.querySelector<HTMLButtonElement>('.node__menuButton button')!.click()
    fixture.detectChanges()
    const option = Array.from(framedNode.querySelectorAll<HTMLElement>('polo-node-options polo-basic-button'))
      .find((button) => button.textContent?.includes('Remove from frame'))!
    expect(option).toBeTruthy()
    option.querySelector<HTMLButtonElement>('button')!.click()
    fixture.detectChanges()

    expect(activeStory.entireTree().frames?.[0].nodeIds).toEqual(['node_0', 'node_2'])
    expect(Number(activeStory.entireTree().nodes[1].left)).toBeGreaterThan(right)
    expect(activeStory.entireTree().nodes[0].join).toEqual([{ node: 'node_1' }])
    expect(host.querySelectorAll('polo-node')).toHaveSize(3)
    expect(framedNode.querySelector('polo-node-options')).toBeNull()
    framedNode.querySelector<HTMLButtonElement>('.node__menuButton button')!.click()
    fixture.detectChanges()
    expect(framedNode.textContent).not.toContain('Remove from frame')
  })

  it('adds a dragged node to a frame when its header is dropped inside at half zoom', () => {
    const activeStory = TestBed.inject(ActiveStoryService)
    spyOn(TestBed.inject(DatabaseService), 'saveTreeToDB').and.resolveTo(true)
    activeStory.load('drop-frame', 'Story', {
      nodes: [
        { id: 'node_0', type: 'content', left: 0, top: 0 },
        { id: 'node_1', type: 'content', left: 100, top: 100 },
        { id: 'node_2', type: 'end', left: 300, top: 100 },
        { id: 'node_3', type: 'end', left: 800, top: 100 },
      ],
    })
    const frameId = storyEditor.frameNodes(new Set(['node_1', 'node_2']))!
    fixture.detectChanges()
    const board = component.boardElement!.nativeElement
    spyOn(board, 'getBoundingClientRect').and.returnValue(
      new DOMRect(100, 200, board.offsetWidth / 2, board.offsetHeight / 2)
    )
    const drag = component.nodeDrags!.toArray()[3]
    spyOn(drag, 'getFreeDragPosition').and.returnValue({ x: 250, y: 120 })
    spyOn(storyEditor, 'updateNodePositions').and.callThrough()
    component.nodeDragEnded({ source: drag, dropPoint: { x: 300, y: 280 } } as CdkDragEnd<string>, activeStory.entireTree().nodes[3])

    expect(activeStory.entireTree().frames?.[0].nodeIds).toEqual(['node_1', 'node_2', 'node_3'])
    expect(activeStory.entireTree().nodes[3].left).toBe(250)
    expect(storyEditor.updateNodePositions).toHaveBeenCalledTimes(1)
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('.boardFrame__count').textContent).toContain('3 nodes')

    // Releasing outside keeps the node in its current frame and does not enroll others.
    const outsider = component.nodeDrags!.toArray()[0]
    spyOn(outsider, 'getFreeDragPosition').and.returnValue({ x: -50, y: 0 })
    component.nodeDragEnded({ source: outsider, dropPoint: { x: 800, y: 700 } } as CdkDragEnd<string>, activeStory.entireTree().nodes[0])
    expect(activeStory.entireTree().frames?.[0].nodeIds).toEqual(['node_1', 'node_2', 'node_3'])
    expect(activeStory.entireTree().frames?.[0].id).toBe(frameId)
  })

  it('counts joins for all visible groups once per tree and level', () => {
    spyOn(TestBed.inject(DatabaseService), 'saveTreeToDB').and.resolveTo(true)
    const activeStory = TestBed.inject(ActiveStoryService)
    activeStory.load('group-counts', 'Story', {
      nodes: [
        {
          id: 'node_0', type: 'content', left: 0, top: 0,
          join: [{ node: 'node_1' }, { node: 'node_3' }],
        },
        { id: 'node_1', type: 'content', left: 10, top: 0, groupId: 'node_2', join: [{ node: 'node_0' }] },
        { id: 'node_2', type: 'group', left: 10, top: 0 },
        { id: 'node_3', type: 'content', left: 20, top: 0, groupId: 'node_4', join: [{ node: 'node_0' }] },
        { id: 'node_4', type: 'group', left: 20, top: 0 },
      ],
    })
    fixture.detectChanges()

    const projection = component.projectedJoins()
    const counts = component.joinCounts()
    expect(component.groupPortCounts('node_2')).toEqual({ incoming: 1, outgoing: 1 })
    expect(component.groupPortCounts('node_4')).toEqual({ incoming: 1, outgoing: 1 })
    fixture.detectChanges()
    expect(component.projectedJoins()).toBe(projection)
    expect(component.joinCounts()).toBe(counts)

    component.currentGroupId = 'node_2'
    expect(component.projectedJoins()).not.toBe(projection)
    expect(component.joinCounts().boundary).toEqual({ incoming: 1, outgoing: 1 })
    component.currentGroupId = undefined
    storyEditor.removeJoin('node_0', 'node_3', false)
    expect(component.groupPortCounts('node_4')).toEqual({ incoming: 0, outgoing: 1 })
    expect(component.joinCounts()).not.toBe(counts)
  })

  it('restores the correct level for a focused node and resets on story change', () => {
    const activeStory = TestBed.inject(ActiveStoryService)
    activeStory.load('first', 'Story', {
      nodes: [
        { id: 'node_0', type: 'content', left: 0, top: 0 },
        { id: 'node_1', type: 'content', left: 10, top: 0, groupId: 'node_2' },
        { id: 'node_2', type: 'group', left: 10, top: 0 },
      ],
    })
    fixture.detectChanges()
    component.centerToNode(activeStory.entireTree().nodes[1])
    fixture.detectChanges()
    expect(component.currentGroupId).toBe('node_2')
    expect(component.visibleNodes().map((storyNode) => storyNode.id)).toEqual(['node_1'])

    activeStory.load('second', 'Other story', {
      nodes: [{ id: 'node_0', type: 'content', left: 0, top: 0 }],
    })
    fixture.detectChanges()
    expect(component.currentGroupId).toBeUndefined()
    expect(component.visibleNodes().map((storyNode) => storyNode.id)).toEqual(['node_0'])
  })

  it('moves selected nodes together and saves their positions in one mutation', () => {
    const activeStory = TestBed.inject(ActiveStoryService)
    activeStory.load('group', 'Story', {
      nodes: [
        { id: 'node_0', type: 'content', left: 10, top: 20 },
        { id: 'node_1', type: 'content', left: 200, top: 100 },
        { id: 'node_2', type: 'content', left: 400, top: 300 },
      ],
    })
    fixture.detectChanges()
    const drags = component.nodeDrags!.toArray()
    component.selectedNodeIds = new Set(['node_0', 'node_1'])
    const sourcePosition = spyOn(drags[0], 'getFreeDragPosition')
      .and.returnValue({ x: 0, y: 0 })
    const moveFollower = spyOn(drags[1], 'setFreeDragPosition')
    const moveUnselected = spyOn(drags[2], 'setFreeDragPosition')
    spyOn(storyEditor, 'updateNodePositions').and.callThrough()
    spyOn(storyEditor, 'updateNodePosition')

    component.nodeDragStarted({ source: drags[0] } as CdkDragStart<string>)
    sourcePosition.and.returnValue({ x: 30, y: -10 })
    component.nodeDragCheck({ source: drags[0] } as CdkDragMove<string>)
    expect(moveFollower).toHaveBeenCalledWith({ x: 220, y: 70 })
    expect(moveUnselected).not.toHaveBeenCalled()
    expect(storyEditor.updateNodePositions).not.toHaveBeenCalled()

    component.nodeDragEnded(
      { source: drags[0] } as CdkDragEnd<string>,
      activeStory.entireTree().nodes[0]
    )
    expect(storyEditor.updateNodePositions).toHaveBeenCalledTimes(1)
    expect(storyEditor.updateNodePosition).not.toHaveBeenCalled()
    expect(activeStory.entireTree().nodes.map((node) => [node.left, node.top])).toEqual([
      [30, -10], [220, 70], [400, 300],
    ])
  })

  it('drags an unselected node independently and clears the old selection', () => {
    const activeStory = TestBed.inject(ActiveStoryService)
    activeStory.load('group', 'Story', {
      nodes: [
        { id: 'node_0', type: 'content', left: 10, top: 20 },
        { id: 'node_1', type: 'content', left: 200, top: 100 },
      ],
    })
    fixture.detectChanges()
    const drags = component.nodeDrags!.toArray()
    component.selectedNodeIds = new Set(['node_0'])
    component.nodePointerDown('node_1')
    spyOn(drags[0], 'setFreeDragPosition')
    spyOn(drags[1], 'getFreeDragPosition').and.returnValue({ x: 230, y: 110 })
    spyOn(storyEditor, 'updateNodePositions')
    spyOn(storyEditor, 'updateNodePosition')

    component.nodeDragStarted({ source: drags[1] } as CdkDragStart<string>)
    component.nodeDragCheck({ source: drags[1] } as CdkDragMove<string>)
    component.nodeDragEnded(
      { source: drags[1] } as CdkDragEnd<string>,
      activeStory.entireTree().nodes[1]
    )

    expect(component.selectedNodeIds.size).toBe(0)
    expect(drags[0].setFreeDragPosition).not.toHaveBeenCalled()
    expect(storyEditor.updateNodePositions).not.toHaveBeenCalled()
    expect(storyEditor.updateNodePosition).toHaveBeenCalledWith(
      'node_1', 230, 110
    )
  })

  it('cancels an in-progress marquee without leaving pan disabled', () => {
    fixture.detectChanges()
    const board = component.boardElement!.nativeElement
    spyOn(board, 'setPointerCapture')
    spyOn(board, 'hasPointerCapture').and.returnValue(true)
    const release = spyOn(board, 'releasePointerCapture')
    const resume = spyOn(component.panzoom, 'resumeDrag')
    component.checkDragStart({
      button: 0, target: board, ctrlKey: true, pointerId: 7,
      x: 20, y: 30, clientX: 20, clientY: 30,
      preventDefault: () => {},
    } as unknown as PointerEvent)
    component.selectedNodeIds = new Set(['node_0'])

    component.cancelJoin({ pointerId: 7 } as PointerEvent)

    expect(component.selectionBox).toBeUndefined()
    expect(component.selectedNodeIds.size).toBe(0)
    expect(release).toHaveBeenCalledWith(7)
    expect(resume).toHaveBeenCalled()
  })

  it('clears selection on a plain background click or Escape', () => {
    fixture.detectChanges()
    const board = component.boardElement!.nativeElement
    component.selectedNodeIds = new Set(['node_0'])

    component.checkDragStart({
      button: 0, target: board, ctrlKey: false,
    } as unknown as PointerEvent)
    expect(component.selectedNodeIds.size).toBe(0)

    component.selectedNodeIds = new Set(['node_0'])
    component.handleEscape()
    expect(component.selectedNodeIds.size).toBe(0)
  })

  it('commits the CDK free drag position without resetting placement', () => {
    const storyNode: node = {
      id: 'node_0',
      left: 12.5,
      top: 20.25,
      type: 'content',
    }
    const source = {
      getFreeDragPosition: () => ({ x: 7.25, y: -5.5 }),
    } as unknown as CdkDrag
    spyOn(storyEditor, 'updateNodePosition')

    component.nodeDragEnded({ source } as CdkDragEnd, storyNode)

    expect(storyEditor.updateNodePosition).toHaveBeenCalledWith(
      'node_0',
      7.25,
      -5.5
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

  it('does not create a narrative node when a join is dropped on a group port', () => {
    fixture.detectChanges()
    const board = component.boardElement!.nativeElement
    const origin = document.createElement('div')
    origin.dataset['boardOrigin'] = 'node_0'
    const group = document.createElement('div')
    group.className = 'groupNode'
    const port = document.createElement('span')
    group.append(port)
    board.append(origin, group)
    spyOn(board, 'setPointerCapture')
    spyOn(document, 'elementFromPoint').and.returnValue(port)
    const create = spyOn(component, 'addNode')

    component.checkDragStart({
      button: 0, target: origin, pointerId: 4, clientX: 0, clientY: 0,
    } as unknown as PointerEvent)
    component.checkDragStop({ button: 0, pointerId: 4, x: 0, y: 0 } as PointerEvent)

    expect(create).not.toHaveBeenCalled()
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
