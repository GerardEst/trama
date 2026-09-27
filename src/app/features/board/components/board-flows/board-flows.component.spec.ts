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

  function createAnchor(left: number, top: number) {
    const anchor = document.createElement('div')
    spyOn(anchor, 'getBoundingClientRect').and.returnValue(
      new DOMRect(left, top, 10, 10)
    )
    return anchor
  }
})
