import {
  CdkDrag,
  CdkDragEnd,
  CdkDragMove,
  CdkDragStart,
  DragRef,
} from '@angular/cdk/drag-drop'
import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing'
import { By } from '@angular/platform-browser'
import { NgZone } from '@angular/core'
import { node } from 'src/app/core/interfaces/interfaces'
import { DatabaseService } from 'src/app/core/services/database.service'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { StoryMutationService } from 'src/app/shared/services/story-mutation.service'
import { StoryEditorService } from './services/story-editor.service'
import { StoryReferencesService } from './services/story-references.service'
import { AnswerComponent } from './components/node/answer/answer.component'
import { ConditionComponent } from './components/condition/condition.component'
import { FrameColorsService } from './services/frame-colors.service'
import { BoardComponent } from './board.component'
import { BoardAnchorRegistryService } from './services/board-anchor-registry.service'
import { StoryImagesService } from 'src/app/shared/services/story-images.service'
import { RichTextFieldComponent } from './components/rich-text/rich-text-field.component'
import { StoryEditorLoader } from './components/rich-text/story-editor-loader.service'
import { NodeComponent } from './components/node/node.component'
import { ContextHelpService } from 'src/app/shared/context-help/context-help.service'
import { ContextHelpComponent } from 'src/app/shared/context-help/context-help.component'
import { CONTEXT_HELP_TOPICS, NODE_CONTEXT_HELP_TOPICS } from 'src/app/shared/context-help/context-help.topics'
import { I18nService } from 'src/app/core/i18n/i18n.service'
import { ENTRY_POINT_ORIGIN } from './board-interactions'

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

  it('explains the entry with the shared help without starting a drag or changing the story', async () => {
    const key = 'polo-context-help'
    const previous = localStorage.getItem(key)
    const help = TestBed.inject(ContextHelpService)
    const story = TestBed.inject(ActiveStoryService)
    story.load('entry-help', 'Story', { nodes: [] })
    fixture.detectChanges()
    const board = component.boardElement!.nativeElement
    const capture = spyOn(board, 'setPointerCapture')
    const before = story.entireTree()
    try {
      help.setEnabled(false)
      fixture.detectChanges()
      expect(board.querySelector('polo-entry-point polo-context-help button')).toBeNull()
      help.setEnabled(true)
      fixture.detectChanges()
      const trigger = board.querySelector<HTMLButtonElement>('polo-entry-point polo-context-help button')!
      trigger.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }))
      trigger.click()
      fixture.detectChanges()
      await new Promise<void>(resolve => setTimeout(resolve, 0))
      const panel = board.querySelector<HTMLElement>('polo-entry-point .contextHelp__panel')!
      const copy = CONTEXT_HELP_TOPICS['board.entryPoint']
      const i18n = TestBed.inject(I18nService)
      expect(panel.matches(':popover-open')).toBeTrue()
      expect(panel.querySelector('strong')?.textContent).toBe(i18n.t(copy.title))
      expect(panel.querySelector('.contextHelp__body')?.textContent).toBe(i18n.t(copy.body))
      expect(panel.querySelector('a')?.getAttribute('href')).toContain('#connections')
      expect(capture).not.toHaveBeenCalled()
      expect(component.isDrawingJoin).toBeFalse()
      expect(story.entireTree()).toBe(before)
    } finally {
      if (previous === null) localStorage.removeItem(key)
      else localStorage.setItem(key, previous)
    }
  })

  it('renders one movable entry outside node selections, frames and groups', () => {
    const story = TestBed.inject(ActiveStoryService)
    const save = spyOn(TestBed.inject(DatabaseService), 'saveTreeToDB').and.resolveTo(true)
    story.load('entry', 'Story', { nodes: [
      { id: 'node_0', type: 'content', left: 200, top: 100 },
      { id: 'node_1', type: 'end', left: 400, top: 100 },
    ] })
    fixture.detectChanges()
    const host: HTMLElement = fixture.nativeElement
    expect(host.querySelectorAll('polo-entry-point')).toHaveSize(1)
    expect(component.nodeDrags?.map(drag => drag.data)).toEqual(['node_0', 'node_1'])
    expect(component.projectedJoins().find(path => path.origin === ENTRY_POINT_ORIGIN)?.destiny).toBe('node_0')
    component.entryDragEnded({ source: { getFreeDragPosition: () => ({ x: 50, y: 80 }) } } as CdkDragEnd<string>)
    expect(story.entireTree().entryPoint).toEqual({ left: 50, top: 80, targetNodeId: 'node_0' })
    expect(save.calls.mostRecent().args[1].entryPoint?.left).toBe(50)
    component.selectedNodeIds = new Set(['node_0', 'node_1'])
    expect(component.canGroupSelection()).toBeTrue()
    component.groupSelection()
    const group = story.entireTree().nodes.find(node => node.type === 'group')!
    component.enterGroup(group.id)
    fixture.detectChanges()
    expect(host.querySelector('polo-entry-point')).toBeNull()
    expect(component.projectedJoins().some(path => path.origin === ENTRY_POINT_ORIGIN && path.fromBoundary)).toBeTrue()
    component.leaveGroup()
    fixture.detectChanges()
    expect(host.querySelectorAll('polo-entry-point')).toHaveSize(1)
  })

  it('connects the real entry port with the existing pointer flow and ignores answer ports', () => {
    const story = TestBed.inject(ActiveStoryService)
    spyOn(TestBed.inject(DatabaseService), 'saveTreeToDB').and.resolveTo(true)
    story.load('entry', 'Story', { nodes: [
      { id: 'node_0', type: 'content', left: 200, top: 100 },
      { id: 'node_1', type: 'content', left: 500, top: 100, answers: [{ id: 'answer_1_0', text: 'Answer' }] },
    ] })
    fixture.detectChanges()
    const board = component.boardElement!.nativeElement
    const origin = board.querySelector<HTMLElement>('polo-entry-point [data-board-origin]')!
    const target = board.querySelector<HTMLElement>('polo-node [data-board-join-node="node_1"]')!
    const hit = spyOn(document, 'elementFromPoint').and.returnValue(target)
    spyOn(board, 'setPointerCapture')
    spyOn(board, 'hasPointerCapture').and.returnValue(false)
    const start = () => component.checkDragStart({ button: 0, target: origin, pointerId: 7, clientX: 0, clientY: 0 } as unknown as PointerEvent)
    const stop = () => component.checkDragStop({ button: 0, pointerId: 7, x: 100, y: 100 } as PointerEvent)
    start()
    stop()
    expect(story.initialNode()?.id).toBe('node_1')
    const answerTarget = board.querySelector<HTMLElement>('[data-board-join-to-answers="true"]')!
    expect(answerTarget).not.toBeNull()
    hit.and.returnValue(answerTarget)
    start()
    stop()
    expect(story.initialNode()?.id).toBe('node_1')
    expect(story.entireTree().nodes).toHaveSize(2)
    hit.and.returnValue(board)
    start()
    stop()
    expect(story.initialNode()?.id).toBe('node_2')
    expect(story.entireTree().nodes).toHaveSize(3)
  })

  it('allows deleting node_0 from its component and shows the disconnected entry notice', () => {
    const story = TestBed.inject(ActiveStoryService)
    spyOn(TestBed.inject(DatabaseService), 'saveTreeToDB').and.resolveTo(true)
    story.load('entry', 'Story', { nodes: [{ id: 'node_0', type: 'content', left: 200, top: 100 }] })
    fixture.detectChanges()
    const nodeComponent = fixture.debugElement.query(By.directive(NodeComponent)).componentInstance as NodeComponent
    nodeComponent.onRemoveNode()
    fixture.detectChanges()
    expect(story.entireTree().nodes).toEqual([])
    expect(fixture.nativeElement.querySelector('polo-entry-point [role="status"]')?.textContent).toContain('Connect Start')
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('keeps separate group-name commits as separate undo steps', () => {
    const story = TestBed.inject(ActiveStoryService)
    story.load('group-names', 'Story', { nodes: [
      { id: 'node_0', type: 'content', top: 0, left: 0 },
      { id: 'node_1', type: 'group', text: 'Original', top: 0, left: 0 },
    ] })
    story.beginHistorySession()
    component.renameGroup('node_1', 'First name')
    component.renameGroup('node_1', 'Second name')
    expect(story.undoTree()?.nodes[1].text).toBe('First name')
    expect(story.undoTree()?.nodes[1].text).toBe('Original')
  })

  it('uses the same canonical names in the creation menu and node headers in every language', async () => {
    const i18n = TestBed.inject(I18nService)
    const previousLang = i18n.lang()
    fixture.componentRef.setInput('focusElements', false)
    TestBed.inject(ActiveStoryService).load('node-names', 'Story', { nodes:
      component.creatableNodeTypes.map((type, index) => ({
        id: `node_${index}`, type, top: 0, left: index * 400,
      })),
    })
    component.contextMenuActive = true
    fixture.detectChanges()
    try {
      for (const [lang, names] of [
        ['en', ['Content node - Free text', 'Content node - Selection', 'Distributor node', 'End node']],
        ['ca', ['Node de contingut - Text lliure', 'Node de contingut - Selecció', 'Node distribuidor', 'Node final']],
        ['es', ['Nodo de contenido - Texto libre', 'Nodo de contenido - Selección', 'Nodo distribuidor', 'Nodo final']],
      ] as const) {
        await i18n.setLang(lang, { persist: false })
        fixture.detectChanges()
        const host = fixture.nativeElement as HTMLElement
        const options = Array.from(host.querySelectorAll('.contextMenu__create'))
        const headers = Array.from(host.querySelectorAll('polo-node .node__type'))
        expect(options.map(option => option.textContent?.trim())).toEqual([...names])
        expect(headers.map(header => header.textContent?.trim())).toEqual([...names])
      }
    } finally {
      await i18n.setLang(previousLang, { persist: false })
    }
  })

  it('reuses node help in the right-click menu without creating a node or closing the menu', async () => {
    const key = 'polo-context-help'
    const previous = localStorage.getItem(key)
    const help = TestBed.inject(ContextHelpService)
    const create = spyOn(component, 'createNode')
    fixture.detectChanges()
    const board = fixture.nativeElement.querySelector('.board') as HTMLElement
    try {
      help.setEnabled(true)
      board.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 80, clientY: 100 }))
      fixture.detectChanges()
      expect(component.contextMenuActive).toBeTrue()
      const menu = fixture.nativeElement.querySelector('.contextMenu') as HTMLElement
      expect(menu.querySelector('header')?.textContent).toContain('Create new node')
      for (const type of component.creatableNodeTypes) {
        const row = menu.querySelector(`[data-node-type="${type}"]`)!
        const explanation = fixture.debugElement.queryAll(By.directive(ContextHelpComponent))
          .find(item => row.contains(item.nativeElement))!.componentInstance as ContextHelpComponent
        expect(explanation.topic).toBe(NODE_CONTEXT_HELP_TOPICS[type])
        row.querySelector<HTMLButtonElement>('polo-context-help button')!.click()
        fixture.detectChanges()
        await new Promise<void>(resolve => setTimeout(resolve, 0))
        const popup = row.querySelector<HTMLElement>('.contextHelp__panel')!
        expect(popup.matches(':popover-open')).toBeTrue()
        expect(popup.querySelector('strong')?.textContent).toBe(component.nodeTypeName(type))
        expect(popup.querySelector('.contextHelp__body')?.textContent).toBe(
          TestBed.inject(I18nService).t(CONTEXT_HELP_TOPICS[explanation.topic].body)
        )
        expect(component.contextMenuActive).toBeTrue()
        expect(create).not.toHaveBeenCalled()
      }
      board.click()
      fixture.detectChanges()
      expect(fixture.nativeElement.querySelector('.contextMenu')).toBeNull()
      expect(help.activeId()).toBeNull()
    } finally {
      if (previous === null) localStorage.removeItem(key)
      else localStorage.setItem(key, previous)
    }
  })

  it('keeps node creation available when contextual help is disabled', () => {
    const key = 'polo-context-help'
    const previous = localStorage.getItem(key)
    const create = spyOn(component, 'createNode')
    fixture.detectChanges()
    const board = fixture.nativeElement.querySelector('.board') as HTMLElement
    try {
      TestBed.inject(ContextHelpService).setEnabled(false)
      for (const type of component.creatableNodeTypes) {
        board.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }))
        component.contextMenuPosition = { x: 120, y: 240 }
        fixture.detectChanges()
        const row = fixture.nativeElement.querySelector(`[data-node-type="${type}"]`) as HTMLElement
        expect(row.querySelector('polo-context-help button')).toBeNull()
        row.querySelector<HTMLButtonElement>('.contextMenu__create')!.click()
        expect(create).toHaveBeenCalledWith({ left: 120, top: 240 }, type)
        expect(component.contextMenuActive).toBeFalse()
        fixture.detectChanges()
        expect(fixture.nativeElement.querySelector('.contextMenu')).toBeNull()
      }
    } finally {
      if (previous === null) localStorage.removeItem(key)
      else localStorage.setItem(key, previous)
    }
  })

  it('reveals a playthrough node inside its group without replacing the editing selection', async () => {
    TestBed.inject(ActiveStoryService).load('story', 'Story', { nodes: [
      { id: 'node_0', type: 'content', top: 0, left: 0 },
      { id: 'node_1', type: 'content', groupId: 'node_2', top: 100, left: 200 },
      { id: 'node_2', type: 'group', top: 0, left: 0 },
    ] })
    fixture.detectChanges()
    const center = spyOn(component.panzoom, 'centerToNode')
    component.activateNode('node_0')
    fixture.componentRef.setInput('playingNodeId', 'node_1')
    component.revealNode('node_1')
    fixture.detectChanges()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
    expect(component.currentGroupId).toBe('node_2')
    expect(component.activeNodeId()).toBe('node_0')
    expect(center).toHaveBeenCalledWith(jasmine.objectContaining({ id: 'node_1' }), true)
    expect(fixture.nativeElement.querySelector('polo-node.node--playing')).not.toBeNull()
  })

  it('cancels a pending node reveal and any ongoing centering when following stops', async () => {
    TestBed.inject(ActiveStoryService).load('story', 'Story', { nodes: [
      { id: 'node_0', type: 'content', top: 0, left: 0 },
    ] })
    fixture.detectChanges()
    const center = spyOn(component.panzoom, 'centerToNode')
    const stop = spyOn(component.panzoom, 'stopCentering')
    component.revealNode('node_0')
    stop.calls.reset()
    component.cancelNodeReveal()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
    expect(center).not.toHaveBeenCalled()
    expect(stop).toHaveBeenCalledTimes(1)
  })

  it('does not run node shortcuts while keyboard focus is in a sibling view', () => {
    TestBed.inject(ActiveStoryService).load('story', 'Story', { nodes: [
      { id: 'node_0', type: 'content', top: 0, left: 0 },
      { id: 'node_1', type: 'content', top: 0, left: 0 },
    ] })
    fixture.detectChanges()
    component.activateNode('node_1')
    const remove = spyOn(component, 'removeNode')
    const button = document.createElement('button')
    document.body.appendChild(button)
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }))
    button.remove()
    expect(remove).not.toHaveBeenCalled()
  })

  it('focuses a newly created node, not every node and answer loaded onto the board', async () => {
    spyOn(TestBed.inject(DatabaseService), 'saveTreeToDB').and.resolveTo(true)
    await TestBed.inject(StoryEditorLoader).load()
    TestBed.inject(ActiveStoryService).load('focus-test', 'Story', {
      nodes: [{ id: 'node_0', type: 'content', left: 0, top: 0,
        answers: [{ id: 'answer_0_0', text: '<p>Answer</p>' }] }],
    })
    fixture.detectChanges()
    await new Promise<void>(resolve => setTimeout(resolve, 0))
    const existing = fixture.debugElement.queryAll(By.directive(RichTextFieldComponent))
      .map(item => item.componentInstance as RichTextFieldComponent)
    expect(existing.length).toBe(2)
    for (const field of existing) expect(field.inlineEditor).toBeUndefined()

    const created = component.createNode({ left: 400, top: 0 }, 'content')
    fixture.detectChanges()
    await new Promise<void>(resolve => setTimeout(resolve, 0))
    const node = fixture.debugElement.queryAll(By.directive(NodeComponent))
      .find(item => (item.componentInstance as NodeComponent).nodeId === created.id)!
    const field = node.query(By.directive(RichTextFieldComponent)).componentInstance as RichTextFieldComponent
    expect(field.inlineEditor).toBeDefined()

    const firstNode = fixture.debugElement.queryAll(By.directive(NodeComponent))
      .find(item => (item.componentInstance as NodeComponent).nodeId === 'node_0')!
    const nodeComponent = firstNode.componentInstance as NodeComponent
    nodeComponent.addAnswer()
    fixture.detectChanges()
    await new Promise<void>(resolve => setTimeout(resolve, 0))
    expect(nodeComponent.answerComponents?.last.richTextField?.inlineEditor).toBeDefined()
  })

  it('starts a drag from the name, but a click edits without moving focus to the header', () => {
    const activeStory = TestBed.inject(ActiveStoryService)
    spyOn(TestBed.inject(DatabaseService), 'saveTreeToDB').and.resolveTo(true)
    activeStory.load('story-1', 'Story', {
      nodes: [{ id: 'node_0', type: 'content', left: 0, top: 0 }],
    })
    fixture.detectChanges()
    const host = fixture.nativeElement as HTMLElement
    document.body.appendChild(host)
    const header = host.querySelector<HTMLElement>('.node__header')!
    const input = host.querySelector<HTMLInputElement>('.node__name input')!
    const mouseDown = jasmine.createSpy('mouseDown')
    header.addEventListener('mousedown', mouseDown)
    input.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1 }))
    input.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }))
    expect(mouseDown).toHaveBeenCalledTimes(1)
    input.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    fixture.detectChanges()
    expect(document.activeElement).toBe(input)
    input.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    expect(mouseDown).toHaveBeenCalledTimes(1)
    input.value = 'My beginning'
    input.dispatchEvent(new Event('change', { bubbles: true }))
    expect(activeStory.entireTree().nodes[0].name).toBe('My beginning')
    expect(document.activeElement).toBe(input)
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
      'polo-answer polo-node-events polo-contextual-button button',
      'polo-answer polo-node-requirements polo-contextual-button button',
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

  it('measures the board only when a Ctrl-marquee starts, not on every move', () => {
    TestBed.inject(ActiveStoryService).load('marquee-measure', 'Story', {
      nodes: [
        { id: 'node_0', type: 'content', left: 0, top: 0 },
        { id: 'node_1', type: 'end', left: 350, top: 0 },
      ],
    })
    fixture.detectChanges()
    const board = component.boardElement!.nativeElement
    const nodes = Array.from(board.querySelectorAll<HTMLElement>('polo-node'))
    const boardRect = spyOn(board, 'getBoundingClientRect').and.returnValue(
      new DOMRect(0, 0, board.offsetWidth, 5000)
    )
    spyOn(board, 'setPointerCapture')
    spyOn(board, 'hasPointerCapture').and.returnValue(false)
    const nodeRects = [
      spyOn(nodes[0], 'getBoundingClientRect').and.returnValue(new DOMRect(50, 50, 30, 30)),
      spyOn(nodes[1], 'getBoundingClientRect').and.returnValue(new DOMRect(200, 50, 30, 30)),
    ]

    board.dispatchEvent(new PointerEvent('pointerdown', {
      bubbles: true, button: 0, ctrlKey: true, pointerId: 4,
      clientX: 10, clientY: 10,
    }))
    boardRect.calls.reset()
    nodeRects.forEach((rect) => rect.calls.reset())

    board.dispatchEvent(new PointerEvent('pointermove', {
      bubbles: true, pointerId: 4, clientX: 100, clientY: 100,
    }))
    expect([...component.selectedNodeIds]).toEqual(['node_0'])
    board.dispatchEvent(new PointerEvent('pointermove', {
      bubbles: true, pointerId: 4, clientX: 250, clientY: 100,
    }))
    expect([...component.selectedNodeIds]).toEqual(['node_0', 'node_1'])
    expect(component.selectionBox).toEqual({
      left: 10, top: 10, width: 240, height: 90,
    })

    expect(boardRect).not.toHaveBeenCalled()
    nodeRects.forEach((rect) => expect(rect).not.toHaveBeenCalled())
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

  it('groups a valid multi-selection with Ctrl+G without requiring an active node', () => {
    component.groupControls = true
    const activeStory = TestBed.inject(ActiveStoryService)
    spyOn(TestBed.inject(DatabaseService), 'saveTreeToDB').and.resolveTo(true)
    activeStory.load('group-shortcut', 'Story', {
      nodes: [
        { id: 'node_0', type: 'content', left: 0, top: 0 },
        { id: 'node_1', type: 'content', left: 200, top: 0 },
        { id: 'node_2', type: 'end', left: 400, top: 0 },
      ],
    })
    fixture.detectChanges()
    const groupButton = (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('.groupToolbar button')!
    expect(groupButton.title).toContain('Ctrl+G / ⌘G')
    component.selectedNodeIds = new Set(['node_1', 'node_2'])
    expect(component.activeNodeId()).toBeUndefined()

    const shortcut = new KeyboardEvent('keydown', {
      key: 'g', ctrlKey: true, bubbles: true, cancelable: true,
    })
    document.dispatchEvent(shortcut)

    expect(shortcut.defaultPrevented).toBeTrue()
    expect(activeStory.entireTree().nodes.find((node) => node.id === 'node_3')?.type).toBe('group')
    expect(activeStory.entireTree().nodes.find((node) => node.id === 'node_1')?.groupId).toBe('node_3')
    expect(component.selectedNodeIds.size).toBe(0)
  })

  it('frames a multi-selection with Ctrl+F while leaving focus editing intact', async () => {
    component.groupControls = true
    const activeStory = TestBed.inject(ActiveStoryService)
    spyOn(TestBed.inject(DatabaseService), 'saveTreeToDB').and.resolveTo(true)
    activeStory.load('frame-shortcut', 'Story', {
      nodes: [
        { id: 'node_0', type: 'content', left: 0, top: 0 },
        { id: 'node_1', type: 'end', left: 200, top: 0 },
      ],
    })
    fixture.detectChanges()
    const host: HTMLElement = fixture.nativeElement
    expect(host.querySelectorAll<HTMLButtonElement>('.groupToolbar button')[1].title)
      .toContain('Ctrl+F / ⌘F')
    component.selectedNodeIds = new Set(['node_0'])
    const invalidGroup = new KeyboardEvent('keydown', {
      key: 'g', ctrlKey: true, bubbles: true, cancelable: true,
    })
    document.dispatchEvent(invalidGroup)
    expect(invalidGroup.defaultPrevented).toBeFalse()
    expect(activeStory.entireTree().nodes).toHaveSize(2)
    component.selectedNodeIds = new Set(['node_0', 'node_1'])

    const preview = host.querySelector<HTMLElement>('polo-node .richTextField__preview')!
    const edit = new KeyboardEvent('keydown', {
      key: 'f', ctrlKey: true, bubbles: true, cancelable: true,
    })
    preview.dispatchEvent(edit)
    fixture.detectChanges()
    expect(edit.defaultPrevented).toBeTrue()
    const field = fixture.debugElement.query(By.directive(RichTextFieldComponent)).componentInstance as RichTextFieldComponent
    expect(field.openEditor).toBeTrue()
    expect(activeStory.entireTree().frames).toBeUndefined()
    field.onClosed(field.draft)
    fixture.detectChanges()

    const shortcut = new KeyboardEvent('keydown', {
      key: 'f', ctrlKey: true, bubbles: true, cancelable: true,
    })
    document.dispatchEvent(shortcut)
    expect(shortcut.defaultPrevented).toBeTrue()
    expect(activeStory.entireTree().frames?.[0].nodeIds).toEqual(['node_0', 'node_1'])
    expect(activeStory.entireTree().nodes).toHaveSize(2)
    expect(component.selectedNodeIds.size).toBe(0)

    const noSelection = new KeyboardEvent('keydown', {
      key: 'f', metaKey: true, bubbles: true, cancelable: true,
    })
    document.dispatchEvent(noSelection)
    expect(noSelection.defaultPrevented).toBeFalse()
    component.selectedNodeIds = new Set(['node_0', 'node_1'])
    const macShortcut = new KeyboardEvent('keydown', {
      key: 'f', metaKey: true, bubbles: true, cancelable: true,
    })
    document.dispatchEvent(macShortcut)
    expect(macShortcut.defaultPrevented).toBeTrue()
    expect(activeStory.entireTree().frames?.[0].nodeIds).toEqual(['node_0', 'node_1'])
  })

  it('leaves browser shortcuts alone when multi-selection actions are unavailable', () => {
    const activeStory = TestBed.inject(ActiveStoryService)
    activeStory.load('inactive-shortcut', 'Story', {
      nodes: [
        { id: 'node_0', type: 'content', left: 0, top: 0 },
        { id: 'node_1', type: 'end', left: 200, top: 0 },
        { id: 'node_2', type: 'end', left: 400, top: 0 },
      ],
    })
    fixture.detectChanges()
    component.selectedNodeIds = new Set(['node_1', 'node_2'])
    for (const key of ['f', 'g']) {
      const event = new KeyboardEvent('keydown', {
        key, metaKey: true, bubbles: true, cancelable: true,
      })
      document.dispatchEvent(event)
      expect(event.defaultPrevented).toBeFalse()
    }
    expect(activeStory.entireTree().frames).toBeUndefined()
    expect(activeStory.entireTree().nodes).toHaveSize(3)
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
    const groupStartButton = (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('.groupToolbar button')!
    expect(groupStartButton.disabled).toBeFalse()
    component.selectedNodeIds = new Set(['node_1'])
    component.boardElement!.nativeElement.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    fixture.detectChanges()
    expect(groupStartButton.disabled).toBeTrue()
    expect(fixture.nativeElement.textContent).toContain('Ctrl + drag')
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

  it('frames nodes in place, edits the label and drags all members in one save', async () => {
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

    const color = host.querySelector<HTMLButtonElement>('polo-color-picker [popoverTrigger]')!
    expect(color.getAttribute('aria-expanded')).toBe('false')
    const pauseDrag = spyOn(component.panzoom, 'pauseDrag')
    color.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    expect(pauseDrag).not.toHaveBeenCalled()
    color.click()
    fixture.detectChanges()
    expect(host.querySelectorAll('.colorPicker__option').length).toBe(7)
    host.querySelector<HTMLButtonElement>('[data-color="lavender"]')!.click()
    fixture.detectChanges()
    expect(activeStory.entireTree().frames![0].colorId).toBe('lavender')
    await Promise.resolve()
    expect(save.calls.mostRecent().args[1].frames?.[0].colorId).toBe('lavender')
    expect(host.querySelector<HTMLElement>('.boardFrame')!.style.getPropertyValue('--frame-color'))
      .toBe('var(--polo-color-frame-lavender)')
    color.click()
    fixture.detectChanges()
    host.querySelector<HTMLButtonElement>('[data-color="default"]')!.click()
    fixture.detectChanges()
    expect(activeStory.entireTree().frames![0].colorId).toBeUndefined()

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
    host.querySelector<HTMLButtonElement>('.boardFrame__remove')!.click()
    fixture.detectChanges()
    expect(activeStory.entireTree().frames).toEqual([])
    expect(host.querySelectorAll('polo-node').length).toBe(3)
  })

  it('creates story colors and propagates palette edits to every frame and picker', async () => {
    fixture.componentRef.setInput('focusElements', false)
    spyOn(TestBed.inject(DatabaseService), 'saveTreeToDB').and.resolveTo(true)
    const activeStory = TestBed.inject(ActiveStoryService)
    activeStory.load('palette-story', 'Story', {
      nodes: [
        { id: 'node_0', type: 'content', left: 10, top: 20 },
        { id: 'node_1', type: 'end', left: 300, top: 100 },
      ],
      frames: [
        { id: 'first', name: 'First', nodeIds: ['node_0'] },
        { id: 'second', name: 'Second', nodeIds: ['node_1'] },
      ],
    })
    fixture.detectChanges()
    const host: HTMLElement = fixture.nativeElement
    document.body.appendChild(host)
    const pickers = host.querySelectorAll<HTMLElement>('polo-color-picker')
    async function open(index: number) {
      pickers[index].querySelector<HTMLButtonElement>('[popoverTrigger]')!.click()
      fixture.detectChanges()
      await new Promise<void>(resolve => setTimeout(resolve, 0))
    }
    async function saveForm(nameValue: string, hexValue: string) {
      fixture.detectChanges()
      // Wait for form registration/focus, not unrelated database session timers.
      await new Promise<void>(resolve => setTimeout(resolve, 0))
      const name = host.querySelector<HTMLInputElement>('input[name="name"]')!
      name.value = nameValue
      name.dispatchEvent(new Event('input', { bubbles: true }))
      const hex = host.querySelector<HTMLInputElement>('input[name="hex"]')!
      hex.value = hexValue
      hex.dispatchEvent(new Event('input', { bubbles: true }))
      fixture.detectChanges()
      host.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      fixture.detectChanges()
    }
    await open(0)
    expect(host.querySelector('.colorPicker__edit[data-key="default"]')).toBeNull()
    host.querySelector<HTMLButtonElement>('.colorPicker__create')!.click()
    await saveForm('Battle', '#aabbcc')
    const id = activeStory.entireTree().frames![0].colorId!
    expect(activeStory.entireTree().frameColors).toEqual([{ id, name: 'Battle', value: '#aabbcc' }])
    await open(1)
    pickers[1].querySelector<HTMLButtonElement>(`[data-color="${id}"]`)!.click()
    fixture.detectChanges()
    await open(0)
    host.querySelector<HTMLButtonElement>(`.colorPicker__edit[data-key="${id}"]`)!.click()
    await saveForm('Conversation', '#112233')
    expect(activeStory.entireTree().frames?.map(frame => frame.colorId)).toEqual([id, id])
    for (const frame of Array.from(host.querySelectorAll<HTMLElement>('.boardFrame'))) {
      expect(frame.style.getPropertyValue('--frame-color')).toBe('#112233')
      expect(frame.querySelector('[popoverTrigger]')?.getAttribute('title')).toBe('Conversation')
    }
    await open(1)
    expect(pickers[1].querySelector(`[data-color="${id}"]`)?.getAttribute('aria-pressed')).toBe('true')
    pickers[1].querySelector<HTMLButtonElement>('[data-color="default"]')!.click()
    fixture.detectChanges()
    expect(activeStory.entireTree().frames![1].colorId).toBeUndefined()
    expect(activeStory.entireTree().frames![0].colorId).toBe(id)
    activeStory.load('other-story', 'Other', { nodes: [] })
    fixture.detectChanges()
    expect(TestBed.inject(FrameColorsService).options().some(color => color.value === id)).toBeFalse()
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

  it('reuses frame bounds between checks and follows rendered node sizes', async () => {
    const activeStory = TestBed.inject(ActiveStoryService)
    spyOn(TestBed.inject(DatabaseService), 'saveTreeToDB').and.resolveTo(true)
    activeStory.load('frame-size', 'Story', {
      nodes: [
        { id: 'node_0', type: 'content', left: 0, top: 0 },
        { id: 'node_1', type: 'end', left: 300, top: 0 },
      ],
    })
    storyEditor.frameNodes(new Set(['node_0', 'node_1']))
    fixture.detectChanges()
    const resized = () => new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    )
    await resized()
    const frame = activeStory.entireTree().frames![0]
    const bounds = component.frameBounds(frame)
    fixture.detectChanges()
    expect(component.frameBounds(frame)).toBe(bounds)

    const tallNode = component.nodeDrags!.toArray()[1].element.nativeElement
    tallNode.style.minHeight = '1000px'
    await resized()
    expect(component.frameBounds(frame).height).toBe(tallNode.offsetHeight + 88)
    expect(component.frameBounds(frame).width).toBe(bounds.width)
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

  it('keeps a clicked or dragged node active until another node or the background is clicked', () => {
    const activeStory = TestBed.inject(ActiveStoryService)
    activeStory.load('active-node', 'Story', {
      nodes: [
        { id: 'node_0', type: 'content', left: 0, top: 0 },
        { id: 'node_1', type: 'end', left: 350, top: 0 },
      ],
    })
    fixture.detectChanges()
    const board = component.boardElement!.nativeElement
    const nodes = Array.from(board.querySelectorAll<HTMLElement>('polo-node'))

    nodes[0].dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }))
    fixture.detectChanges()
    expect(component.activeNodeId()).toBe('node_0')
    expect(nodes[0].classList.contains('node--active')).toBeTrue()
    expect(nodes[0].classList.contains('node--selected')).toBeFalse()
    nodes[0].dispatchEvent(new MouseEvent('mouseleave'))
    nodes[0].dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
    component.handleEscape()
    fixture.detectChanges()
    expect(nodes[0].classList.contains('node--active')).toBeTrue()

    nodes[1].dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }))
    fixture.detectChanges()
    expect(component.activeNodeId()).toBe('node_1')
    expect(nodes[0].classList.contains('node--active')).toBeFalse()
    expect(nodes[1].classList.contains('node--active')).toBeTrue()

    board.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }))
    fixture.detectChanges()
    expect(component.activeNodeId()).toBeUndefined()
    expect(nodes[1].classList.contains('node--active')).toBeFalse()
  })

  it('activates a node when its menu is opened without starting a drag', () => {
    TestBed.inject(ActiveStoryService).load('menu-focus', 'Story', {
      nodes: [
        { id: 'node_0', type: 'content', left: 0, top: 0 },
        { id: 'node_1', type: 'end', left: 350, top: 0 },
      ],
    })
    fixture.detectChanges()
    const nodes = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('polo-node')
    nodes[0].dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }))
    const menu = nodes[1].querySelector<HTMLButtonElement>('.node__menuButton button')!
    menu.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }))
    menu.click()
    fixture.detectChanges()

    expect(component.activeNodeId()).toBe('node_1')
    expect(nodes[1].classList.contains('node--active')).toBeTrue()
    expect(nodes[0].classList.contains('node--active')).toBeFalse()
  })

  it('activates group nodes and clears focus when entering their board', () => {
    TestBed.inject(ActiveStoryService).load('group-focus', 'Story', {
      nodes: [
        { id: 'node_0', type: 'content', left: 0, top: 0 },
        { id: 'node_1', type: 'group', left: 350, top: 0 },
        { id: 'node_2', type: 'end', left: 400, top: 10, groupId: 'node_1' },
      ],
    })
    fixture.detectChanges()
    const group = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('.groupNode')!
    group.querySelector<HTMLElement>('.groupNode__header')!.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, button: 0 })
    )
    fixture.detectChanges()
    expect(component.activeNodeId()).toBe('node_1')
    expect(group.classList.contains('node--active')).toBeTrue()

    group.querySelector<HTMLButtonElement>('.groupNode__actions button')!.click()
    fixture.detectChanges()
    expect(component.currentGroupId).toBe('node_1')
    expect(component.activeNodeId()).toBeUndefined()
  })

  it('activates the dragged node without losing a multi-node selection', () => {
    const activeStory = TestBed.inject(ActiveStoryService)
    activeStory.load('active-drag', 'Story', {
      nodes: [
        { id: 'node_0', type: 'content', left: 0, top: 0 },
        { id: 'node_1', type: 'end', left: 350, top: 0 },
      ],
    })
    fixture.detectChanges()
    const drags = component.nodeDrags!.toArray()
    component.selectedNodeIds = new Set(['node_0', 'node_1'])
    component.nodePointerDown('node_1')
    component.nodeDragStarted({ source: drags[1] } as CdkDragStart<string>)
    expect(component.activeNodeId()).toBe('node_1')
    expect(component.selectedNodeIds.size).toBe(2)
    spyOn(drags[1], 'getFreeDragPosition').and.returnValue({ x: 380, y: 10 })
    component.nodeDragEnded(
      { source: drags[1] } as CdkDragEnd<string>,
      activeStory.entireTree().nodes[1]
    )
    fixture.detectChanges()
    expect(component.activeNodeId()).toBe('node_1')
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('.node--selected').length).toBe(2)
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('.node--active').length).toBe(1)
  })

  it('clears the active node on clicks outside the board and across stories', () => {
    const activeStory = TestBed.inject(ActiveStoryService)
    activeStory.load('first', 'Story', {
      nodes: [{ id: 'node_0', type: 'content', left: 0, top: 0 }],
    })
    fixture.detectChanges()
    component.nodePointerDown('node_0')
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    expect(component.activeNodeId()).toBeUndefined()

    component.nodePointerDown('node_0')
    activeStory.load('second', 'Story', {
      nodes: [{ id: 'node_0', type: 'content', left: 0, top: 0 }],
    })
    expect(component.activeNodeId()).toBeUndefined()
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
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(component.selectedNodeIds.size).toBe(0)
  })

  it('cancels a join with Escape via the board keydown listener', () => {
    fixture.detectChanges()
    const board = component.boardElement!.nativeElement
    const origin = document.createElement('div')
    origin.dataset['boardOrigin'] = 'node_0'
    board.appendChild(origin)
    spyOn(board, 'setPointerCapture')
    spyOn(board, 'hasPointerCapture').and.returnValue(false)
    const resume = spyOn(component.panzoom, 'resumeDrag')
    component.checkDragStart({
      button: 0, target: origin, pointerId: 7, clientX: 10, clientY: 20,
    } as unknown as PointerEvent)
    expect(component.isDrawingJoin).toBeTrue()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))

    expect(component.isDrawingJoin).toBeFalse()
    expect(resume).toHaveBeenCalled()
  })

  it('runs Supr, Ctrl+U and Ctrl+D on the active node through existing actions', () => {
    const activeStory = TestBed.inject(ActiveStoryService)
    spyOn(TestBed.inject(DatabaseService), 'saveTreeToDB').and.resolveTo(true)
    activeStory.load('shortcuts', 'Story', {
      nodes: [
        { id: 'node_0', type: 'content', left: 0, top: 0, join: [{ node: 'node_1' }] },
        { id: 'node_1', type: 'end', left: 200, top: 40 },
        { id: 'node_2', type: 'end', left: 420, top: 40 },
      ],
    })
    storyEditor.frameNodes(new Set(['node_1', 'node_2']))
    fixture.detectChanges()
    component.activateNode('node_1')
    const shortcut = (key: string, ctrlKey = false, extra: KeyboardEventInit = {}) => {
      const event = new KeyboardEvent('keydown', {
        key, ctrlKey, bubbles: true, cancelable: true, ...extra,
      })
      document.dispatchEvent(event)
      return event
    }

    expect(shortcut('u', true).defaultPrevented).toBeTrue()
    expect(activeStory.entireTree().frames?.[0].nodeIds).toEqual(['node_2'])
    expect(activeStory.entireTree().nodes[1].left).not.toBe(200)
    expect(activeStory.entireTree().nodes[0].join).toEqual([{ node: 'node_1' }])
    expect(shortcut('d', true).defaultPrevented).toBeTrue()
    expect(shortcut('d', false, { metaKey: true }).defaultPrevented).toBeTrue()
    expect(activeStory.entireTree().nodes.map((node) => node.id)).toEqual([
      'node_0', 'node_1', 'node_2', 'node_3', 'node_4',
    ])
    expect(activeStory.entireTree().nodes[3].type).toBe('end')
    expect(component.activeNodeId()).toBe('node_1')
    expect(shortcut('Backspace').defaultPrevented).toBeFalse()
    expect(activeStory.entireTree().nodes).toHaveSize(5)
    expect(shortcut('Delete').defaultPrevented).toBeTrue()
    expect(activeStory.entireTree().nodes.map((node) => node.id)).toEqual([
      'node_0', 'node_2', 'node_3', 'node_4',
    ])
    expect(activeStory.entireTree().nodes[0].join).toEqual([])
    expect(component.activeNodeId()).toBeUndefined()
    expect(shortcut('d', true).defaultPrevented).toBeFalse()

    component.activateNode('node_2')
    expect(shortcut('d', true, { repeat: true }).defaultPrevented).toBeFalse()
    expect(shortcut('d', true, { shiftKey: true }).defaultPrevented).toBeFalse()
    expect(activeStory.entireTree().nodes).toHaveSize(4)
    component.activateNode('node_0')
    expect(shortcut('Delete').defaultPrevented).toBeTrue()
    expect(activeStory.entireTree().nodes.map(node => node.id)).toEqual(['node_2', 'node_3', 'node_4'])
    expect(activeStory.entireTree().entryPoint?.targetNodeId).toBeUndefined()
  })

  it('supports frame removal and ungrouping shortcuts for an active group node', () => {
    const activeStory = TestBed.inject(ActiveStoryService)
    spyOn(TestBed.inject(DatabaseService), 'saveTreeToDB').and.resolveTo(true)
    activeStory.load('group-shortcuts', 'Story', {
      nodes: [
        { id: 'node_0', type: 'content', left: 0, top: 0 },
        { id: 'node_1', type: 'group', left: 100, top: 0 },
        { id: 'node_2', type: 'end', left: 120, top: 20, groupId: 'node_1' },
        { id: 'node_3', type: 'end', left: 400, top: 0 },
      ],
    })
    storyEditor.frameNodes(new Set(['node_1', 'node_3']))
    fixture.detectChanges()
    component.activateNode('node_1')
    const shortcut = (key: string, ctrlKey = false) => {
      const event = new KeyboardEvent('keydown', {
        key, ctrlKey, bubbles: true, cancelable: true,
      })
      document.dispatchEvent(event)
      return event
    }
    expect(shortcut('d', true).defaultPrevented).toBeFalse()
    expect(shortcut('i', true).defaultPrevented).toBeFalse()
    expect(shortcut('u', true).defaultPrevented).toBeTrue()
    expect(activeStory.entireTree().frames?.[0].nodeIds).toEqual(['node_3'])
    expect(shortcut('Backspace').defaultPrevented).toBeFalse()
    expect(shortcut('Delete').defaultPrevented).toBeTrue()
    expect(activeStory.entireTree().nodes.some((node) => node.id === 'node_1')).toBeFalse()
    expect(activeStory.entireTree().nodes.find((node) => node.id === 'node_2')?.groupId).toBeUndefined()
    expect(component.activeNodeId()).toBeUndefined()
  })

  it('updates reused answer events, requirements and condition reference options when history is restored', () => {
    const story = TestBed.inject(ActiveStoryService)
    spyOn(TestBed.inject(DatabaseService), 'saveTreeToDB').and.resolveTo(true)
    const event = { id: 'event_1', type: 'stat' as const, action: 'alterStat' as const, target: 'stat_gold', amount: '1' }
    story.load('answer-history', 'Story', {
      refs: { stat_gold: { name: 'Gold', type: 'stat' } },
      nodes: [
        { id: 'node_0', type: 'content', top: 0, left: 0, answers: [
          { id: 'answer_0_0', text: 'Continue', events: [event], requirements: [{ target: 'stat_gold', type: 'stat', amount: 1 }] },
        ] },
        { id: 'node_1', type: 'distributor', top: 0, left: 300, conditions: [{ id: 'condition_1_0', ref: 'stat_gold', value: 1 }] },
      ],
    })
    story.beginHistorySession()
    fixture.detectChanges()
    const answer = fixture.debugElement.query(By.directive(AnswerComponent)).componentInstance as AnswerComponent
    const condition = fixture.debugElement.query(By.directive(ConditionComponent)).componentInstance as ConditionComponent
    storyEditor.saveAnswerEvents('answer_0_0', [{ ...event, amount: '5' }])
    storyEditor.saveAnswerRequirements('answer_0_0', [{ target: 'stat_gold', type: 'stat', amount: 2 }])
    TestBed.inject(StoryReferencesService).rename('stat_gold', 'Coins')
    fixture.detectChanges()
    expect(answer.events[0].amount).toBe('5')
    expect(answer.requirements[0].amount).toBe(2)
    expect(condition.refOptions[0].name).toBe('Coins')
    for (let index = 0; index < 3; index++) TestBed.inject(StoryMutationService).undo()
    component.historyRestored()
    fixture.detectChanges()
    expect(fixture.debugElement.query(By.directive(AnswerComponent)).componentInstance).toBe(answer)
    expect(answer.events[0].amount).toBe('1')
    expect(answer.requirements[0].amount).toBe(1)
    expect(condition.refOptions[0].name).toBe('Gold')
  })

  it('reconciles group navigation and invisible selections after undoing and redoing grouping', () => {
    const story = TestBed.inject(ActiveStoryService)
    spyOn(TestBed.inject(DatabaseService), 'saveTreeToDB').and.resolveTo(true)
    story.load('group-history', 'Story', { nodes: [
      { id: 'node_0', type: 'content', top: 0, left: 0 },
      { id: 'node_1', type: 'content', top: 0, left: 300 },
      { id: 'node_2', type: 'content', top: 0, left: 600 },
    ] })
    story.beginHistorySession()
    const groupId = storyEditor.groupNodes(new Set(['node_1', 'node_2']))!
    component.currentGroupId = groupId
    component.activateNode('node_1')
    component.selectedNodeIds = new Set(['node_1'])
    expect(TestBed.inject(StoryMutationService).undo()).toBeTrue()
    component.historyRestored()
    expect(component.currentGroupId).toBeUndefined()
    expect(component.activeNodeId()).toBe('node_1')
    expect(TestBed.inject(StoryMutationService).redo()).toBeTrue()
    component.historyRestored()
    expect(component.activeNodeId()).toBeUndefined()
    expect(component.selectedNodeIds.size).toBe(0)
  })

  it('creates a node and its dragged connection as one undo step', () => {
    const story = TestBed.inject(ActiveStoryService)
    const save = spyOn(TestBed.inject(DatabaseService), 'saveTreeToDB').and.resolveTo(true)
    story.load('joined-node-history', 'Story', { nodes: [
      { id: 'node_0', type: 'content', top: 0, left: 0 },
    ] })
    story.beginHistorySession()
    const before = story.entireTree()
    fixture.detectChanges()
    component.joinStroke = { originId: 'node_0', from: fixture.nativeElement, to: { x: 500, y: 300 } }
    component.addNode(new MouseEvent('click', { clientX: 500, clientY: 300 }), 'content')
    expect(story.entireTree().nodes).toHaveSize(2)
    expect(story.entireTree().nodes[0].join).toEqual([{ node: 'node_1', toAnswer: false }])
    expect(save).toHaveBeenCalledTimes(1)
    expect(TestBed.inject(StoryMutationService).undo()).toBeTrue()
    expect(story.entireTree()).toBe(before)
    expect(story.canUndo()).toBeFalse()
  })

  it('keeps an active node image available for undo when deleting with Supr', async () => {
    const activeStory = TestBed.inject(ActiveStoryService)
    spyOn(TestBed.inject(DatabaseService), 'saveTreeToDB').and.resolveTo(true)
    activeStory.load('delete-image', 'Story', {
      nodes: [
        { id: 'node_0', type: 'content', left: 0, top: 0 },
        { id: 'node_1', type: 'end', left: 300, top: 0, image: { path: 'image.png' } },
      ],
    })
    activeStory.beginHistorySession()
    fixture.detectChanges()
    const removeImage = spyOn(TestBed.inject(StoryImagesService), 'removeImage').and.resolveTo(true)
    component.activateNode('node_1')
    const event = new KeyboardEvent('keydown', {
      key: 'Delete', bubbles: true, cancelable: true,
    })
    document.dispatchEvent(event)
    expect(event.defaultPrevented).toBeTrue()
    expect(removeImage).not.toHaveBeenCalled()
    await new Promise<void>((resolve) => setTimeout(resolve, 0))
    expect(activeStory.entireTree().nodes.map((node) => node.id)).toEqual(['node_0'])
    expect(TestBed.inject(StoryMutationService).undo()).toBeTrue()
    component.historyRestored()
    fixture.detectChanges()
    expect(activeStory.entireTree().nodes[1].image?.path).toBe('image.png')
    expect(removeImage).not.toHaveBeenCalled()
  })

  it('uses Ctrl+I to open the active node image picker and does not intercept editing', () => {
    const activeStory = TestBed.inject(ActiveStoryService)
    activeStory.load('image-shortcut', 'Story', {
      nodes: [
        { id: 'node_0', type: 'content', left: 0, top: 0 },
        { id: 'node_1', type: 'distributor', left: 300, top: 0 },
      ],
    })
    fixture.detectChanges()
    const host: HTMLElement = fixture.nativeElement
    const input = host.querySelector<HTMLInputElement>('polo-node .node__shortcutImageInput')!
    const click = spyOn(input, 'click')
    component.activateNode('node_0')
    const shortcut = (target: EventTarget, key: string, extra: KeyboardEventInit = {}) => {
      const event = new KeyboardEvent('keydown', {
        key, ctrlKey: true, bubbles: true, cancelable: true, ...extra,
      })
      target.dispatchEvent(event)
      return event
    }

    expect(shortcut(document, 'i').defaultPrevented).toBeTrue()
    expect(click).toHaveBeenCalledTimes(1)
    const text = host.querySelector<HTMLElement>('polo-node .richTextField__preview')!
    text.focus()
    for (const key of ['i', 'd', 'u']) {
      expect(shortcut(text, key).defaultPrevented).toBeFalse()
    }
    for (const key of ['Backspace', 'Delete']) {
      const event = new KeyboardEvent('keydown', {
        key, bubbles: true, cancelable: true,
      })
      text.dispatchEvent(event)
      expect(event.defaultPrevented).toBeFalse()
    }
    expect(activeStory.entireTree().nodes).toHaveSize(2)
    expect(click).toHaveBeenCalledTimes(1)

    const header = host.querySelector<HTMLElement>('polo-node .node__header')!
    header.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }))
    expect(document.activeElement).toBe(header)
    component.activateNode('node_1')
    expect(shortcut(document, 'i').defaultPrevented).toBeFalse()
    expect(shortcut(document, 'u').defaultPrevented).toBeFalse()
    expect(shortcut(document, 'd').defaultPrevented).toBeTrue()
    expect(activeStory.entireTree().nodes).toHaveSize(3)
  })

  it('does not trigger an active-node shortcut inside a focused dialog', () => {
    TestBed.inject(ActiveStoryService).load('dialog-shortcut', 'Story', {
      nodes: [{ id: 'node_0', type: 'content', left: 0, top: 0 }],
    })
    fixture.detectChanges()
    component.activateNode('node_0')
    const dialog = document.createElement('dialog')
    const button = document.createElement('button')
    dialog.appendChild(button)
    document.body.appendChild(dialog)
    const duplicate = spyOn(storyEditor, 'duplicateNode')
    const event = new KeyboardEvent('keydown', {
      key: 'd', ctrlKey: true, bubbles: true, cancelable: true,
    })
    button.dispatchEvent(event)
    dialog.remove()
    expect(event.defaultPrevented).toBeFalse()
    expect(duplicate).not.toHaveBeenCalled()
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

  for (const kind of ['node', 'selection', 'frame', 'entry'] as const) {
    it(`auto-pans a real CDK ${kind} drag at half zoom without jumping or losing the drop`, fakeAsync(() => {
      const save = spyOn(TestBed.inject(DatabaseService), 'saveTreeToDB').and.resolveTo(true)
      spyOn(TestBed.inject(StoryEditorLoader), 'prefetch')
      const story = TestBed.inject(ActiveStoryService)
      story.load('auto-pan', 'Story', {
        nodes: [
          { id: 'node_0', type: kind === 'node' ? 'content' : 'group', left: 200, top: 200 },
          { id: 'node_1', type: 'group', left: 500, top: 300 },
        ],
        entryPoint: { left: 50, top: 50 },
        frames: kind === 'frame' ? [{ id: 'frame_0', name: 'Frame', nodeIds: ['node_0', 'node_1'] }] : [],
      })
      component.initialZoom = 0.5
      fixture.nativeElement.style.cssText = 'position: fixed; left: 0; top: 0; width: 800px; height: 600px; overflow: hidden'
      document.body.appendChild(fixture.nativeElement)
      fixture.detectChanges()
      // CDK defers root/handle registration and its initial position until stability.
      TestBed.inject(NgZone).onStable.emit()
      tick(32)
      if (kind === 'selection') component.selectedNodeIds = new Set(['node_0', 'node_1'])

      const id = kind === 'entry' ? ENTRY_POINT_ORIGIN : kind === 'frame' ? 'frame_0' : 'node_0'
      const source = fixture.debugElement.queryAll(By.directive(CdkDrag))
        .map((element) => element.injector.get<CdkDrag<string>>(CdkDrag))
        .find((drag) => drag.data === id)!
      const root = source.getRootElement()
      const handle = root.querySelector<HTMLElement>('.node__header, .groupNode__header, .boardFrame__header, .entryPoint__handle')!
      const start = root.getBoundingClientRect()
      const downX = start.left + 8
      const downY = start.top + 8
      handle.dispatchEvent(new PointerEvent('pointerdown', { clientX: downX, clientY: downY, button: 0, bubbles: true }))
      handle.dispatchEvent(new MouseEvent('mousedown', { clientX: downX, clientY: downY, button: 0, buttons: 1, detail: 1, bubbles: true }))
      const edgeX = Math.min(800, window.innerWidth) - 5
      const pointerY = Math.floor(Math.min(600, window.innerHeight) / 2) - 10
      const move = (x: number) => document.dispatchEvent(new MouseEvent('mousemove', { clientX: x, clientY: pointerY, bubbles: true }))
      // One fast move starts the drag at the edge; no further pointer events.
      move(edgeX)
      expect(component.isInteracting).toBeTrue()
      const beforePan = new DOMMatrix(component.boardElement!.nativeElement.style.transform)
      const originalTree = story.entireTree()
      tick(96)
      const afterPan = new DOMMatrix(component.boardElement!.nativeElement.style.transform)
      expect(afterPan.e).toBeLessThan(beforePan.e)
      // Just 10 screen pixels above centre now produces vertical camera motion.
      expect(afterPan.f).toBeGreaterThan(beforePan.f)
      expect(root.getBoundingClientRect().left + 8).toBeCloseTo(edgeX, 0)
      expect(root.getBoundingClientRect().top + 8).toBeCloseTo(pointerY, 0)
      expect(story.entireTree()).toBe(originalTree)
      expect(save).not.toHaveBeenCalled()

      // Resume pointer movement after several stationary auto-pan frames.
      move(edgeX - 10)
      expect(root.getBoundingClientRect().left + 8).toBeCloseTo(edgeX - 10, 0)
      tick(48)
      const beforeDrop = root.getBoundingClientRect()
      document.dispatchEvent(new MouseEvent('mouseup', { clientX: edgeX - 10, clientY: pointerY, bubbles: true }))
      fixture.detectChanges()
      tick(64)
      expect(root.getBoundingClientRect().left).toBeCloseTo(beforeDrop.left, 0)
      expect(root.getBoundingClientRect().top).toBeCloseTo(beforeDrop.top, 0)
      expect(save).toHaveBeenCalledTimes(1)
      expect(component.isInteracting).toBeFalse()
      const position = source.getFreeDragPosition()
      if (kind === 'entry') {
        expect(story.entireTree().entryPoint!.left).toBe(position.x)
        expect(story.entireTree().entryPoint!.top).toBe(position.y)
      } else if (kind === 'frame' || kind === 'selection') {
        const [first, second] = story.entireTree().nodes
        expect(Number(second.left) - Number(first.left)).toBeCloseTo(300)
        expect(Number(second.top) - Number(first.top)).toBeCloseTo(100)
        expect(Number(first.left)).toBeGreaterThan(200)
      } else {
        expect(story.entireTree().nodes[0].left).toBe(position.x)
        expect(story.entireTree().nodes[0].top).toBe(position.y)
        expect(story.entireTree().nodes[1].left).toBe(500)
      }
      const stopped = component.boardElement!.nativeElement.style.transform
      tick(96)
      expect(component.boardElement!.nativeElement.style.transform).toBe(stopped)
      if (kind === 'node') {
        // A second drag uses the newly saved origin and can drop without another move.
        const next = root.getBoundingClientRect()
        handle.dispatchEvent(new PointerEvent('pointerdown', {
          clientX: next.left + 8, clientY: next.top + 8, button: 0, bubbles: true,
        }))
        handle.dispatchEvent(new MouseEvent('mousedown', {
          clientX: next.left + 8, clientY: next.top + 8, button: 0, buttons: 1, detail: 1, bubbles: true,
        }))
        move(edgeX - 20)
        tick(96)
        expect(root.getBoundingClientRect().left + 8).toBeCloseTo(edgeX - 20, 0)
        expect(save).toHaveBeenCalledTimes(1)
        document.dispatchEvent(new MouseEvent('mouseup', { clientX: edgeX - 20, clientY: pointerY, bubbles: true }))
        fixture.detectChanges()
        tick(64)
        expect(root.getBoundingClientRect().left + 8).toBeCloseTo(edgeX - 20, 0)
        expect(story.entireTree().nodes[0].left).toBe(source.getFreeDragPosition().x)
        expect(save).toHaveBeenCalledTimes(2)
      }
      fixture.destroy()
      flush()
    }))
  }

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
