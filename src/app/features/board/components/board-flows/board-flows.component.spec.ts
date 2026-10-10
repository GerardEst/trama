import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing'
import { node } from 'src/app/core/interfaces/interfaces'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { projectBoardJoins } from '../../board-join-projection'
import { BoardAnchorRegistryService } from '../../services/board-anchor-registry.service'
import { StoryEditorService } from '../../services/story-editor.service'
import { BoardFlowsComponent } from './board-flows.component'

describe('BoardFlowsComponent', () => {
  let component: BoardFlowsComponent
  let fixture: ComponentFixture<BoardFlowsComponent>
  let anchors: BoardAnchorRegistryService

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BoardFlowsComponent],
      providers: [BoardAnchorRegistryService],
    })
    fixture = TestBed.createComponent(BoardFlowsComponent)
    component = fixture.componentInstance
    anchors = TestBed.inject(BoardAnchorRegistryService)
    fixture.detectChanges()
  })

  afterEach(() => fixture.destroy())

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('uses board-scoped anchors, unique path ids, and one measurement per anchor', () => {
    const source = createAnchor(10, 20)
    const nodeTarget = createAnchor(100, 40)
    const answersTarget = createAnchor(100, 80)
    anchors.register('node_0_join', source)
    anchors.register('node_1_joiner', nodeTarget)
    anchors.register('node_1_joiner--answers', answersTarget)
    const svg = component.svg?.nativeElement
    expect(svg).toBeDefined()
    spyOn(svg!, 'getScreenCTM').and.returnValue(svg!.createSVGMatrix())
    const globalLookup = spyOn(document, 'getElementById').and.callThrough()
    const nodes: node[] = [
      {
        id: 'node_0',
        left: 0,
        top: 0,
        type: 'content',
        join: [
          { node: 'node_1' },
          { node: 'node_1', toAnswer: true },
        ],
      },
      { id: 'node_1', left: 100, top: 40, type: 'content' },
    ]

    const paths = component.calculatePaths(nodes)

    expect(paths.map((path) => path.id)).toEqual([
      'node_0::node_1::node',
      'node_0::node_1::answers',
    ])
    expect(source.getBoundingClientRect).toHaveBeenCalledTimes(1)
    expect(globalLookup).not.toHaveBeenCalled()
  })

  it('projects joins through group ports and boundary ports without modifying the story', () => {
    const activeStory = TestBed.inject(ActiveStoryService)
    activeStory.load('story', 'Story', {
      nodes: [
        { id: 'node_0', type: 'content', left: 0, top: 0, join: [{ node: 'node_1' }] },
        { id: 'node_1', type: 'content', left: 100, top: 0, groupId: 'node_3', join: [{ node: 'node_2' }] },
        { id: 'node_2', type: 'content', left: 200, top: 0, groupId: 'node_3', join: [{ node: 'node_4' }] },
        { id: 'node_3', type: 'group', left: 100, top: 0 },
        { id: 'node_4', type: 'end', left: 400, top: 0 },
      ],
    })
    const svg = component.svg!.nativeElement
    spyOn(svg, 'getScreenCTM').and.returnValue(svg.createSVGMatrix())
    anchors.register('node_0_join', createAnchor(0, 0))
    anchors.register('node_1_joiner', createAnchor(100, 0))
    anchors.register('node_1_join', createAnchor(100, 0))
    anchors.register('node_2_joiner', createAnchor(200, 0))
    anchors.register('node_2_join', createAnchor(200, 0))
    anchors.register('node_3_group-entry', createAnchor(100, 0))
    anchors.register('node_3_group-exit', createAnchor(200, 0))
    anchors.register('node_4_joiner', createAnchor(400, 0))
    anchors.register('node_3_boundary-in', createAnchor(0, 0))
    anchors.register('node_3_boundary-out', createAnchor(400, 0))

    expect(component.paths().map((path) => path.id)).toEqual([
      'node_0::node_1::node', 'node_2::node_4::node',
    ])
    fixture.componentRef.setInput('projectedJoins', [])
    fixture.detectChanges()
    expect(component.paths()).toEqual([])
    fixture.componentRef.setInput(
      'projectedJoins', projectBoardJoins(activeStory.entireTree().nodes, 'node_3')
    )
    fixture.componentRef.setInput('groupId', 'node_3')
    fixture.detectChanges()
    expect(component.paths().map((path) => path.id)).toEqual([
      'node_0::node_1::node', 'node_1::node_2::node', 'node_2::node_4::node',
    ])
    expect(activeStory.entireTree().nodes[0].join).toEqual([{ node: 'node_1' }])
    expect(activeStory.entireTree().nodes[2].join).toEqual([{ node: 'node_4' }])

    const removeJoin = spyOn(TestBed.inject(StoryEditorService), 'removeJoin').and.returnValue(true)
    component.joinContextMenuInfo = component.paths()[0]
    component.deleteJoin()
    expect(removeJoin).toHaveBeenCalledWith('node_0', 'node_1', false)
  })

  it('keeps visible connector strokes one screen pixel wide when zoomed', fakeAsync(() => {
    spyOn(component, 'calculatePaths').and.returnValue([{
      id: 'node_0::node_1::node',
      origin: 'node_0',
      destiny: 'node_1',
      toAnswer: false,
      svgPath: 'M0,0 L10,10',
    }])
    spyOn(component, 'createPath').and.returnValue('M0,0 L10,10')
    fixture.componentRef.setInput('drawingStroke', {
      originId: 'node_0',
      from: document.createElement('div'),
      to: { x: 10, y: 10 },
    })
    anchors.invalidate()
    tick(16)
    fixture.detectChanges()

    const strokes = fixture.nativeElement.querySelectorAll('path[stroke="#cccccc"]')
    expect(strokes.length).toBe(2)
    strokes.forEach((stroke: SVGPathElement) => {
      expect(stroke.getAttribute('vector-effect')).toBe('non-scaling-stroke')
    })
  }))

  it('coalesces repeated refresh requests into one animation frame', () => {
    const animationFrame = spyOn(window, 'requestAnimationFrame').and.returnValue(1)

    component.scheduleRefresh()
    component.scheduleRefresh()

    expect(animationFrame).toHaveBeenCalledTimes(1)
  })

  it('measures only the moved node anchors and keeps unrelated path objects', fakeAsync(() => {
    const measurements = setupConnectedBoard()
    const before = component.paths()
    const unrelated = before.find(path => path.origin === 'node_3')!
    measurements.get('node_0_join')!.and.returnValue(new DOMRect(50, 60, 10, 10))
    measurements.get('node_0_joiner')!.and.returnValue(new DOMRect(45, 60, 10, 10))
    measurements.get('custom-answer_join')!.and.returnValue(new DOMRect(50, 90, 10, 10))
    const fullCalculation = spyOn(component, 'calculatePaths').and.callThrough()

    component.scheduleRefresh(['node_0'])
    tick(16)
    fixture.detectChanges()

    const after = component.paths()
    expect(fullCalculation).not.toHaveBeenCalled()
    expect(after.filter((path, index) => path.svgPath !== before[index].svgPath).length).toBe(3)
    expect(after.find(path => path.origin === 'node_3')).toBe(unrelated)
    expect(after.find(path => path.origin === 'node_0')!.svgPath).toContain('M55,65 ')
    expect(after.find(path => path.origin === 'custom-answer')!.svgPath).toContain('M55,95 ')
    expect(after.find(path => path.origin === 'node_2')!.svgPath).toContain('50,65')
    for (const [id, measurement] of measurements) {
      expect(measurement.calls.count()).withContext(id).toBe(
        ['node_0_join', 'node_0_joiner', 'custom-answer_join'].includes(id) ? 1 : 0
      )
    }
  }))

  it('merges moved nodes in one frame and measures shared endpoints only once', fakeAsync(() => {
    const measurements = setupConnectedBoard()
    measurements.get('node_0_join')!.and.returnValue(new DOMRect(50, 60, 10, 10))
    measurements.get('node_1_joiner')!.and.returnValue(new DOMRect(150, 60, 10, 10))
    const before = component.paths()

    component.scheduleRefresh(['node_0'])
    component.scheduleRefresh(['node_1', 'node_0'])
    tick(16)
    fixture.detectChanges()

    expect(component.paths().find(path => path.origin === 'node_0')!.svgPath).toContain('155,65')
    expect(measurements.get('node_0_join')!).toHaveBeenCalledTimes(1)
    expect(measurements.get('node_1_joiner')!).toHaveBeenCalledTimes(1)
    expect(measurements.get('node_2_join')!).not.toHaveBeenCalled()
    expect(measurements.get('node_3_join')!).not.toHaveBeenCalled()
    expect(component.paths().find(path => path.origin === 'node_3'))
      .toBe(before.find(path => path.origin === 'node_3'))
  }))

  it('reuses board coordinates during camera pan and zoom', fakeAsync(() => {
    const measurements = setupConnectedBoard()
    const svg = component.svg!.nativeElement
    const matrix = svg.createSVGMatrix()
    matrix.a = matrix.d = 0.5
    matrix.e = 200
    matrix.f = 100
    const camera = svg.getScreenCTM as jasmine.Spy
    camera.and.returnValue(matrix)
    // Board position (50, 60), seen through the new camera transform.
    measurements.get('node_0_join')!.and.returnValue(new DOMRect(225, 130, 5, 5))
    measurements.get('node_0_joiner')!.and.returnValue(new DOMRect(225, 130, 5, 5))
    measurements.get('custom-answer_join')!.and.returnValue(new DOMRect(225, 145, 5, 5))

    component.scheduleRefresh(['node_0'])
    tick(16)
    fixture.detectChanges()

    expect(component.paths().find(path => path.origin === 'node_0')!.svgPath)
      .toBe('M55,65 C85,65 75,45 105,45')
    expect(measurements.get('node_1_joiner')!).not.toHaveBeenCalled()
  }))

  it('does no geometry work for a moved node with no visible connections', fakeAsync(() => {
    const measurements = setupConnectedBoard()
    const before = component.paths()
    const context = spyOn(component.svg!.nativeElement, 'createSVGPoint').and.callThrough()

    component.scheduleRefresh(['unconnected'])
    tick(16)
    fixture.detectChanges()

    expect(component.paths()).toBe(before)
    expect(context).not.toHaveBeenCalled()
    measurements.forEach(measurement => expect(measurement).not.toHaveBeenCalled())
  }))

  it('fully refreshes after story edits and explicit refreshes', fakeAsync(() => {
    const measurements = setupConnectedBoard()
    TestBed.inject(ActiveStoryService).updateTree(draft => { draft.nodes[0].left = 50 })
    fixture.detectChanges()
    measurements.forEach(measurement => {
      expect(measurement).toHaveBeenCalledTimes(1)
      measurement.calls.reset()
    })

    component.scheduleRefresh(['node_0'])
    component.scheduleRefresh()
    tick(16)
    fixture.detectChanges()

    measurements.forEach(measurement => expect(measurement).toHaveBeenCalledTimes(1))
  }))

  it('updates collapsed group ports rather than looking for hidden story node anchors', fakeAsync(() => {
    const story = TestBed.inject(ActiveStoryService)
    story.load('group-story', 'Story', { nodes: [
      { id: 'inside', type: 'content', left: 0, top: 0, groupId: 'group', join: [{ node: 'outside' }] },
      { id: 'group', type: 'group', left: 0, top: 0 },
      { id: 'outside', type: 'content', left: 100, top: 0, join: [{ node: 'inside' }] },
      { id: 'other', type: 'content', left: 200, top: 0, join: [{ node: 'outside' }] },
    ] })
    const entry = createAnchor(0, 10)
    const exit = createAnchor(0, 20)
    const target = createAnchor(100, 20)
    anchors.register('group_group-entry', entry)
    anchors.register('group_group-exit', exit)
    anchors.register('outside_joiner', target)
    anchors.register('outside_join', createAnchor(100, 30))
    anchors.register('other_join', createAnchor(200, 30))
    const svg = component.svg!.nativeElement
    spyOn(svg, 'getScreenCTM').and.returnValue(svg.createSVGMatrix())
    fixture.componentRef.setInput('projectedJoins', projectBoardJoins(story.entireTree().nodes))
    tick(16)
    fixture.detectChanges()
    const before = component.paths()
    const entryMeasurement = entry.getBoundingClientRect as jasmine.Spy
    const exitMeasurement = exit.getBoundingClientRect as jasmine.Spy
    const targetMeasurement = target.getBoundingClientRect as jasmine.Spy
    entryMeasurement.calls.reset()
    exitMeasurement.calls.reset()
    targetMeasurement.calls.reset()
    entryMeasurement.and.returnValue(new DOMRect(50, 10, 10, 10))
    exitMeasurement.and.returnValue(new DOMRect(50, 20, 10, 10))

    component.scheduleRefresh(['group'])
    tick(16)
    fixture.detectChanges()

    expect(entryMeasurement).toHaveBeenCalledTimes(1)
    expect(exitMeasurement).toHaveBeenCalledTimes(1)
    expect(targetMeasurement).not.toHaveBeenCalled()
    expect(component.paths().filter((path, index) => path.svgPath !== before[index].svgPath).length).toBe(2)
    expect(component.paths().find(path => path.origin === 'other'))
      .toBe(before.find(path => path.origin === 'other'))
  }))

  it('caches group boundaries during dragging and refreshes their new positions on commit', fakeAsync(() => {
    const story = TestBed.inject(ActiveStoryService)
    story.load('boundary-story', 'Story', { nodes: [
      { id: 'inside', type: 'content', left: 0, top: 0, groupId: 'group', join: [{ node: 'outside' }] },
      { id: 'group', type: 'group', left: 0, top: 0 },
      { id: 'outside', type: 'content', left: 200, top: 0, join: [{ node: 'inside' }] },
    ] })
    const measurements = new Map<string, jasmine.Spy>()
    for (const [id, left] of [
      ['group_boundary-in', -280], ['group_boundary-out', 380],
      ['inside_join', 0], ['inside_joiner', 0],
    ] as const) {
      const anchor = createAnchor(left, 0)
      anchors.register(id, anchor)
      measurements.set(id, anchor.getBoundingClientRect as jasmine.Spy)
    }
    const svg = component.svg!.nativeElement
    spyOn(svg, 'getScreenCTM').and.returnValue(svg.createSVGMatrix())
    fixture.componentRef.setInput('groupId', 'group')
    fixture.componentRef.setInput('projectedJoins', projectBoardJoins(story.entireTree().nodes, 'group'))
    tick(16)
    fixture.detectChanges()
    expect(component.paths().length).toBe(2)
    measurements.forEach(measurement => measurement.calls.reset())
    measurements.get('inside_join')!.and.returnValue(new DOMRect(50, 0, 10, 10))
    measurements.get('inside_joiner')!.and.returnValue(new DOMRect(50, 0, 10, 10))

    component.scheduleRefresh(['inside'])
    tick(16)
    fixture.detectChanges()
    expect(measurements.get('inside_join')!).toHaveBeenCalledTimes(1)
    expect(measurements.get('inside_joiner')!).toHaveBeenCalledTimes(1)
    expect(measurements.get('group_boundary-in')!).not.toHaveBeenCalled()
    expect(measurements.get('group_boundary-out')!).not.toHaveBeenCalled()
    measurements.forEach(measurement => measurement.calls.reset())

    // Committing the drag can move the board's rightmost boundary as well.
    measurements.get('group_boundary-out')!.and.returnValue(new DOMRect(430, 0, 10, 10))
    story.updateTree(draft => { draft.nodes[0].left = 50 })
    component.scheduleRefresh()
    tick(16)
    fixture.detectChanges()
    expect(component.paths().find(path => path.origin === 'inside')!.svgPath).toContain('435,5')
    measurements.forEach(measurement => expect(measurement).toHaveBeenCalledTimes(1))
  }))

  it('keeps geometry work constant on a thousand-node board', fakeAsync(() => {
    const nodes: node[] = Array.from({ length: 1000 }, (_, index) => ({
      id: `node_${index}`, type: 'content', left: index * 10, top: 0,
      join: index < 999 ? [{ node: `node_${index + 1}` }] : [],
    }))
    TestBed.inject(ActiveStoryService).load('large', 'Story', { nodes })
    const measurements: jasmine.Spy[] = []
    for (let index = 0; index < 999; index++) {
      for (const [id, left] of [
        [`node_${index}_join`, index * 10],
        [`node_${index + 1}_joiner`, (index + 1) * 10],
      ] as const) {
        const anchor = createAnchor(left, 0)
        anchors.register(id, anchor)
        measurements.push(anchor.getBoundingClientRect as jasmine.Spy)
      }
    }
    const svg = component.svg!.nativeElement
    spyOn(svg, 'getScreenCTM').and.returnValue(svg.createSVGMatrix())
    tick(16)
    fixture.detectChanges()
    const before = component.paths()
    expect(before.length).toBe(999)
    expect(measurements.reduce((count, measurement) => count + measurement.calls.count(), 0)).toBe(1998)
    measurements.forEach(measurement => measurement.calls.reset())
    for (const id of ['node_500_join', 'node_500_joiner']) {
      const measurement = anchors.get(id)!.getBoundingClientRect as jasmine.Spy
      measurement.and.returnValue(new DOMRect(5050, 50, 10, 10))
    }

    component.scheduleRefresh(['node_500'])
    tick(16)
    fixture.detectChanges()

    expect(measurements.reduce((count, measurement) => count + measurement.calls.count(), 0)).toBe(2)
    expect(component.paths().filter((path, index) => path !== before[index]).length).toBe(2)
  }))

  it('remeasures all anchors when a lazy consumer misses multiple invalidation frames', fakeAsync(() => {
    const measurements = setupConnectedBoard()
    measurements.get('node_0_join')!.and.returnValue(new DOMRect(50, 60, 10, 10))
    measurements.get('node_3_join')!.and.returnValue(new DOMRect(350, 60, 10, 10))

    component.scheduleRefresh(['node_0'])
    tick(16)
    component.scheduleRefresh(['node_3'])
    tick(16)
    fixture.detectChanges()

    expect(component.paths().find(path => path.origin === 'node_0')!.svgPath).toContain('M55,65 ')
    expect(component.paths().find(path => path.origin === 'node_3')!.svgPath).toContain('M355,65 ')
    measurements.forEach(measurement => expect(measurement).toHaveBeenCalledTimes(1))
  }))

  it('drops and restores paths when an anchor is unregistered and replaced', fakeAsync(() => {
    setupConnectedBoard()
    const oldTarget = anchors.get('node_1_joiner')!
    anchors.unregister('node_1_joiner', oldTarget)
    tick(16)
    fixture.detectChanges()
    expect(component.paths().some(path => path.origin === 'node_0')).toBeFalse()

    anchors.register('node_1_joiner', createAnchor(150, 60))
    tick(16)
    fixture.detectChanges()
    expect(component.paths().find(path => path.origin === 'node_0')!.svgPath).toContain('155,65')
  }))

  function setupConnectedBoard() {
    TestBed.inject(ActiveStoryService).load('story', 'Story', { nodes: [
      { id: 'node_0', type: 'content', left: 0, top: 0, join: [{ node: 'node_1' }],
        answers: [{ id: 'custom-answer', join: [{ node: 'node_1', toAnswer: true }] }] },
      { id: 'node_1', type: 'content', left: 100, top: 40 },
      { id: 'node_2', type: 'content', left: 200, top: 40, join: [{ node: 'node_0' }] },
      { id: 'node_3', type: 'content', left: 300, top: 40, join: [{ node: 'node_4' }] },
      { id: 'node_4', type: 'content', left: 400, top: 40 },
    ] })
    const measurements = new Map<string, jasmine.Spy>()
    for (const [id, left, top] of [
      ['node_0_join', 0, 0], ['node_0_joiner', 0, 0], ['custom-answer_join', 0, 30],
      ['node_1_joiner', 100, 40], ['node_1_joiner--answers', 100, 80],
      ['node_2_join', 200, 40], ['node_3_join', 300, 40], ['node_4_joiner', 400, 40],
    ] as const) {
      const anchor = createAnchor(left, top)
      anchors.register(id, anchor)
      measurements.set(id, anchor.getBoundingClientRect as jasmine.Spy)
    }
    const svg = component.svg!.nativeElement
    spyOn(svg, 'getScreenCTM').and.returnValue(svg.createSVGMatrix())
    tick(16)
    fixture.detectChanges()
    expect(component.paths().length).toBe(4)
    measurements.forEach(measurement => measurement.calls.reset())
    return measurements
  }

  function createAnchor(left: number, top: number) {
    const anchor = document.createElement('div')
    spyOn(anchor, 'getBoundingClientRect').and.returnValue(
      new DOMRect(left, top, 10, 10)
    )
    return anchor
  }
})
