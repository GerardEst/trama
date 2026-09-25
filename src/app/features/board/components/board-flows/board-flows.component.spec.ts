import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing'
import { node } from 'src/app/core/interfaces/interfaces'
import { BoardAnchorRegistryService } from '../../services/board-anchor-registry.service'
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
    ]

    const paths = component.calculatePaths(nodes)

    expect(paths.map((path) => path.id)).toEqual([
      'node_0::node_1::node',
      'node_0::node_1::answers',
    ])
    expect(source.getBoundingClientRect).toHaveBeenCalledTimes(1)
    expect(globalLookup).not.toHaveBeenCalled()
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
