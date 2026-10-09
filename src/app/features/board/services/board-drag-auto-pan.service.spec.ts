import { CdkDrag, DragRef, Point } from '@angular/cdk/drag-drop'
import { NgZone } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { BoardDragAutoPanService, CROSS_AXIS_STEERING, EDGE_ZONE_PX, MAX_SPEED_PX_PER_SECOND } from './board-drag-auto-pan.service'
import { PanzoomService } from './panzoom.service'

// Model CDK's active/passive transforms: setting a position while dragging
// resets the active one. This is precisely why compensation needs a session.
function dragDouble() {
  const root = document.createElement('div')
  const drag = jasmine.createSpyObj<CdkDrag<string>>('drag', [
    'getRootElement', 'getFreeDragPosition', 'setFreeDragPosition',
  ])
  drag.getRootElement.and.returnValue(root)
  drag.getFreeDragPosition.and.returnValue({ x: 0, y: 0 })
  drag.setFreeDragPosition.and.callFake(() => {
    drag.getFreeDragPosition.and.returnValue({ x: 0, y: 0 })
    return drag
  })
  return drag
}

describe('BoardDragAutoPanService', () => {
  let service: BoardDragAutoPanService
  let panzoom: jasmine.SpyObj<PanzoomService>
  let source: ReturnType<typeof dragDouble>
  let follower: ReturnType<typeof dragDouble>
  let viewport: HTMLElement
  let refresh: jasmine.Spy
  let callbacks: Map<number, FrameRequestCallback>
  let nextId: number
  const origin = { x: 100, y: 100 }
  const dimensions = new DOMRect(100, 100, 200, 100)
  const pickup = { x: 10, y: 10 }

  beforeEach(() => {
    panzoom = jasmine.createSpyObj('panzoom', ['getScale', 'moveBy'])
    panzoom.getScale.and.returnValue(0.5)
    panzoom.moveBy.and.callFake((x: number, y: number) => ({ x, y }))
    TestBed.configureTestingModule({ providers: [
      BoardDragAutoPanService, { provide: PanzoomService, useValue: panzoom },
    ] })
    service = TestBed.inject(BoardDragAutoPanService)
    source = dragDouble()
    follower = dragDouble()
    viewport = document.createElement('div')
    spyOn(viewport, 'getBoundingClientRect').and.returnValue(new DOMRect(0, 0, 800, 600))
    spyOnProperty(window, 'innerWidth').and.returnValue(1000)
    spyOnProperty(window, 'innerHeight').and.returnValue(800)
    refresh = jasmine.createSpy('refresh')
    callbacks = new Map()
    nextId = 0
    spyOn(window, 'requestAnimationFrame').and.callFake((callback) => {
      callbacks.set(++nextId, callback)
      return nextId
    })
    spyOn(window, 'cancelAnimationFrame').and.callFake((id) => { callbacks.delete(id) })
    service.start(source, origin, viewport, [{ source: follower, origin: { x: 300, y: 200 } }], refresh)
  })

  afterEach(() => service.ngOnDestroy())

  function frame(time: number) {
    const pending = [...callbacks.values()]
    callbacks.clear()
    TestBed.inject(NgZone).runOutsideAngular(() => pending.forEach((callback) => callback(time)))
  }

  function move(pointer: Point) {
    const constrained = service.constrainPosition(pointer, {
      getRootElement: () => source.getRootElement(),
    } as DragRef, dimensions, pickup)!
    // Simulate the active transform CDK derives from the constrained pointer.
    const passive = source.setFreeDragPosition.calls.mostRecent()?.args[0] ?? origin
    source.getFreeDragPosition.and.returnValue({
      x: constrained.x - dimensions.left + passive.x,
      y: constrained.y - dimensions.top + passive.y,
    })
    service.moved(source)
  }

  it('pans with a stationary pointer and compensates every follower at half zoom', () => {
    move({ x: 800, y: 300 })
    const before = source.getFreeDragPosition()
    frame(0)
    frame(16)
    const screenDelta = MAX_SPEED_PX_PER_SECOND * 0.016
    const boardDelta = screenDelta / 0.5
    expect(panzoom.moveBy).toHaveBeenCalledWith(-screenDelta, -0)
    expect(source.setFreeDragPosition).toHaveBeenCalledWith({ x: before.x + boardDelta, y: before.y })
    expect(follower.setFreeDragPosition).toHaveBeenCalledWith({ x: before.x + boardDelta + 200, y: before.y + 100 })
    expect(refresh).toHaveBeenCalledTimes(1)
    frame(32)
    expect(panzoom.moveBy).toHaveBeenCalledTimes(2)
  })

  it('activates farther from the edge with the wider detection zone', () => {
    move({ x: 700, y: 300 })
    frame(0)
    frame(16)
    const intensity = Math.pow(1 - 100 / EDGE_ZONE_PX, 2)
    expect(panzoom.moveBy.calls.mostRecent().args[0]).toBeCloseTo(-MAX_SPEED_PX_PER_SECOND * intensity * 0.016)
  })

  for (const offset of [-10, 10]) {
    it(`steers vertically at centre offset ${offset} and compensates the dragged node`, () => {
      move({ x: 800, y: 300 + offset })
      const before = source.getFreeDragPosition()
      frame(0)
      frame(16)
      const [dx, dy] = panzoom.moveBy.calls.mostRecent().args
      expect(Math.sign(dy)).toBe(-Math.sign(offset))
      expect(dy / Math.abs(dx)).toBeCloseTo(-offset / 300 * CROSS_AXIS_STEERING)
      const position = source.setFreeDragPosition.calls.mostRecent().args[0]
      expect(position.x).toBeCloseTo(before.x - dx / 0.5)
      expect(position.y).toBeCloseTo(before.y - dy / 0.5)
    })
  }

  it('uses full centre-relative steering when dragging along a side', () => {
    move({ x: 800, y: 330 })
    frame(0)
    frame(16)
    const [dx, dy] = panzoom.moveBy.calls.mostRecent().args
    expect(dy / dx).toBeCloseTo(0.1, 4)
    expect(Math.hypot(dx, dy)).toBeCloseTo(MAX_SPEED_PX_PER_SECOND * 0.016)
  })

  it('does not jump on the next pointer move or lose the final position on drop', () => {
    move({ x: 800, y: 300 })
    frame(0)
    frame(16)
    const panned = source.setFreeDragPosition.calls.mostRecent().args[0]
    move({ x: 795, y: 300 })
    expect(source.getFreeDragPosition().x).toBeCloseTo(panned.x - 10)
    frame(32)
    const finalPosition = { ...source.setFreeDragPosition.calls.mostRecent().args[0] }
    service.finish(source)
    expect(source.setFreeDragPosition.calls.mostRecent().args[0]).toEqual(finalPosition)
    expect(callbacks.size).toBe(0)
  })

  it('uses the actual camera delta, not the requested one', () => {
    panzoom.moveBy.and.returnValue({ x: -2, y: 0 })
    move({ x: 800, y: 300 })
    const before = source.getFreeDragPosition()
    frame(0)
    frame(16)
    expect(source.setFreeDragPosition).toHaveBeenCalledWith({ x: before.x + 4, y: before.y })
  })

  it('caps diagonal speed and uses an offset embedded viewport', () => {
    viewport.getBoundingClientRect = () => new DOMRect(100, 50, 400, 300)
    move({ x: 500, y: 50 })
    frame(0)
    frame(16)
    const [dx, dy] = panzoom.moveBy.calls.mostRecent().args
    expect(dx).toBeLessThan(0)
    expect(dy).toBeGreaterThan(0)
    expect(Math.hypot(dx, dy)).toBeCloseTo(MAX_SPEED_PX_PER_SECOND * 0.016)
  })

  it('immediately stops in the dead zone and restarts without accumulating idle time', () => {
    move({ x: 800, y: 300 })
    frame(0)
    frame(16)
    move({ x: 400, y: 300 })
    expect(callbacks.size).toBe(0)
    move({ x: 800, y: 300 })
    frame(1000)
    expect(panzoom.moveBy).toHaveBeenCalledTimes(1)
    frame(1016)
    expect(panzoom.moveBy).toHaveBeenCalledTimes(2)
  })

  it('bounds the delta after a long frame interval', () => {
    move({ x: 800, y: 300 })
    frame(0)
    frame(1000)
    expect(panzoom.moveBy).toHaveBeenCalledWith(-MAX_SPEED_PX_PER_SECOND * 0.032, -0)
  })

  for (const event of ['blur', 'pointercancel', 'touchcancel']) {
    it(`stops on ${event} and removes active listeners`, () => {
      move({ x: 800, y: 300 })
      frame(0)
      frame(16)
      const remove = spyOn(document, 'removeEventListener').and.callThrough()
      const target = event === 'blur' ? window : document
      target.dispatchEvent(new Event(event))
      expect(callbacks.size).toBe(0)
      expect(remove).toHaveBeenCalled()
      move({ x: 800, y: 300 })
      expect(callbacks.size).toBe(0)
    })
  }

  it('stops on loss of visibility', () => {
    move({ x: 800, y: 300 })
    spyOnProperty(document, 'hidden').and.returnValue(true)
    document.dispatchEvent(new Event('visibilitychange'))
    expect(callbacks.size).toBe(0)
  })

  it('cancels the loop on destruction', () => {
    move({ x: 800, y: 300 })
    service.ngOnDestroy()
    expect(callbacks.size).toBe(0)
  })

  it('leaves an ordinary drag untouched on finish', () => {
    move({ x: 400, y: 300 })
    service.finish(source)
    expect(source.setFreeDragPosition).not.toHaveBeenCalled()
  })
})
