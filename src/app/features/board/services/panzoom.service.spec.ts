import { fakeAsync, tick } from '@angular/core/testing'
import { node } from 'src/app/core/interfaces/interfaces'
import { PanzoomService } from './panzoom.service'

const target: node = { id: 'node_0', type: 'content', left: 5000, top: 5000 }

describe('PanzoomService centering', () => {
  let service: PanzoomService
  let viewport: HTMLElement
  let board: HTMLElement
  let motionPreference: jasmine.Spy

  beforeEach(() => {
    service = new PanzoomService()
    viewport = document.createElement('div')
    viewport.style.cssText = 'position: relative; width: 800px; height: 600px; overflow: hidden'
    board = document.createElement('div')
    board.style.cssText = 'width: 20000px; height: 20000px'
    viewport.appendChild(board)
    document.body.appendChild(viewport)
    motionPreference = spyOn(window, 'matchMedia').and.returnValue({ matches: false } as MediaQueryList)
  })

  afterEach(() => {
    service.destroy()
    viewport.remove()
  })

  function initialize(initialZoom = 1) {
    service.createPanzoomBoard(board, { initialZoom, zoomable: true, initialPosition: { x: 0, y: 0 } })
    tick(32)
  }

  function position() {
    const transform = new DOMMatrix(board.style.transform)
    return { x: transform.e, y: transform.f }
  }

  it('keeps ordinary authoring navigation immediate', fakeAsync(() => {
    initialize()
    service.centerToNode(target)
    tick(32)
    expect(position()).toEqual({ x: -4700, y: -4900 })
  }))

  it('moves smoothly to the node using the embedded viewport', fakeAsync(() => {
    initialize()
    service.centerToNode(target, true)
    expect(position()).toEqual({ x: 0, y: 0 })
    tick(96)
    expect(position().x).toBeLessThan(0)
    expect(position().x).toBeGreaterThan(-4700)
    tick(400)
    expect(position()).toEqual({ x: -4700, y: -4900 })
    expect(service.getScale()).toBe(1)
  }))

  it('centers at the existing zoom without changing the scale', fakeAsync(() => {
    initialize(0.5)
    service.centerToNode(target, true)
    tick(400)
    expect(position()).toEqual({ x: -2150, y: -2300 })
    expect(service.getScale()).toBe(0.5)
  }))

  it('makes preview reveals immediate when reduced motion is preferred', fakeAsync(() => {
    initialize()
    motionPreference.and.returnValue({ matches: true } as MediaQueryList)
    service.centerToNode(target, true)
    tick(32)
    expect(position()).toEqual({ x: -4700, y: -4900 })
    tick(400)
    expect(position()).toEqual({ x: -4700, y: -4900 })
  }))

  it('replaces an ongoing reveal instead of continuing toward an old target', fakeAsync(() => {
    initialize()
    service.centerToNode(target, true)
    tick(96)
    service.centerToNode({ ...target, left: 6000, top: 5500 }, true)
    tick(400)
    expect(position()).toEqual({ x: -5700, y: -5400 })
  }))

  it('does not let a reveal override a subsequent immediate board move', fakeAsync(() => {
    initialize()
    service.centerToNode(target, true)
    tick(96)
    service.goTo(-10, -20)
    tick(400)
    expect(position()).toEqual({ x: -10, y: -20 })
  }))

  it('stops an ongoing reveal when following is disabled', fakeAsync(() => {
    initialize()
    service.centerToNode(target, true)
    tick(96)
    service.stopCentering()
    tick(32)
    const stopped = position()
    tick(400)
    expect(position()).toEqual(stopped)
  }))

  it('stops centering when the author starts a node drag', fakeAsync(() => {
    initialize()
    service.centerToNode(target, true)
    tick(96)
    service.pauseDrag()
    const stopped = position()
    tick(400)
    expect(position()).toEqual(stopped)
  }))

  it('lets a manual board pan interrupt a reveal', fakeAsync(() => {
    initialize()
    service.centerToNode(target, true)
    tick(96)
    viewport.dispatchEvent(new MouseEvent('mousedown', { clientX: 10, clientY: 10, button: 0, bubbles: true }))
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 30, clientY: 30, bubbles: true }))
    tick(32)
    const stopped = position()
    tick(400)
    expect(position()).toEqual(stopped)
    service.destroy()
  }))

  it('lets a manual zoom interrupt a reveal', fakeAsync(() => {
    initialize()
    service.centerToNode(target, true)
    tick(96)
    viewport.dispatchEvent(new WheelEvent('wheel', { deltaY: 100, clientX: 100, clientY: 100, bubbles: true }))
    tick(32)
    const stopped = position()
    expect(service.getScale()).toBeLessThan(1)
    tick(400)
    expect(position()).toEqual(stopped)
  }))

  it('cancels animation frames on destruction', fakeAsync(() => {
    initialize()
    service.centerToNode(target, true)
    tick(96)
    service.destroy()
    const stopped = position()
    tick(400)
    expect(position()).toEqual(stopped)
  }))
})
