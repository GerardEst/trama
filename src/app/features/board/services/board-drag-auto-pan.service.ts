import { Injectable, NgZone, OnDestroy } from '@angular/core'
import { CdkDrag, DragRef, Point } from '@angular/cdk/drag-drop'
import { PanzoomService } from './panzoom.service'
import { calculateEdgePanVelocity } from '../utils/edge-pan-velocity'

// Tune the interaction here, not in the geometry utility.
export const EDGE_ZONE_PX = 140
export const MAX_SPEED_PX_PER_SECOND = 1000
// At a side edge, steering grows continuously above/below the viewport centre.
export const CROSS_AXIS_STEERING = 1
const MAX_FRAME_INTERVAL_MS = 32

export interface DragFollower {
  source: CdkDrag<string>
  origin: Point
}

interface DragSession {
  source: CdkDrag<string>
  origin: Point
  position: Point
  // CDK adds its passive transform to the constrained pointer position.
  passivePosition: Point
  compensation: Point
  scale: number
  viewport: HTMLElement
  followers: DragFollower[]
  refresh: () => void
  pointer?: Point
  suspended: boolean
  hasAdjusted: boolean
}

/** One instance per board; only active drags have a frame loop or listeners. */
@Injectable()
export class BoardDragAutoPanService implements OnDestroy {
  private session?: DragSession
  private pickup?: {
    point: Point
    target: EventTarget | null
  }
  private frame?: number
  private previousTime?: number
  private removeListeners?: () => void

  constructor(private panzoom: PanzoomService, private zone: NgZone) {}

  prepare(event: PointerEvent) {
    this.pickup = { point: { x: event.clientX, y: event.clientY }, target: event.target }
  }

  start(
    source: CdkDrag<string>,
    origin: Point,
    viewport: HTMLElement,
    followers: DragFollower[],
    refresh: () => void,
    event?: MouseEvent | TouchEvent
  ) {
    const pickup = this.pickup
    this.clear()
    this.session = {
      source, origin, viewport, followers, refresh,
      position: { ...origin },
      passivePosition: { ...origin },
      compensation: { x: 0, y: 0 },
      scale: this.panzoom.getScale(),
      suspended: false,
      hasAdjusted: false,
    }
    // CDK starts on the threshold-crossing move, without applying that move.
    // Initialize it ourselves so a single fast move to the edge can auto-pan.
    const pointer = event && ('touches' in event ? event.touches[0] ?? event.changedTouches[0] : event)
    if (pointer && pickup?.target instanceof Node && source.getRootElement().contains(pickup.target)) {
      const session = this.session
      session.pointer = { x: pointer.clientX, y: pointer.clientY }
      session.position = {
        x: origin.x + (pointer.clientX - pickup.point.x) / session.scale,
        y: origin.y + (pointer.clientY - pickup.point.y) / session.scale,
      }
      source.setFreeDragPosition(session.position)
      session.passivePosition = { ...session.position }
      session.hasAdjusted = true
      this.moveFollowers(session)
      refresh()
    }
    this.zone.runOutsideAngular(() => {
      const stop = () => this.stop()
      const visibility = () => { if (document.hidden) this.stop() }
      window.addEventListener('blur', stop)
      document.addEventListener('visibilitychange', visibility)
      document.addEventListener('pointercancel', stop)
      document.addEventListener('touchcancel', stop)
      this.removeListeners = () => {
        window.removeEventListener('blur', stop)
        document.removeEventListener('visibilitychange', visibility)
        document.removeEventListener('pointercancel', stop)
        document.removeEventListener('touchcancel', stop)
      }
    })
    this.updateLoop()
  }

  constrainPosition(pointer: Point, dragRef: DragRef, rect: DOMRect, pickup: Point): Point | undefined {
    const session = this.session
    if (!session || dragRef.getRootElement() !== session.source.getRootElement()) return undefined

    session.pointer = { ...pointer }
    // All deltas are in board units; rect and pickup remain CDK's initial screen snapshot.
    const dx = (pointer.x - rect.left - pickup.x) / session.scale
    const dy = (pointer.y - rect.top - pickup.y) / session.scale
    session.position = {
      x: session.origin.x + dx + session.compensation.x,
      y: session.origin.y + dy + session.compensation.y,
    }
    this.updateLoop()
    return {
      x: rect.left + session.position.x - session.passivePosition.x,
      y: rect.top + session.position.y - session.passivePosition.y,
    }
  }

  moved(source: CdkDrag<string>) {
    const session = this.session
    if (!session || session.source !== source) return
    session.position = source.getFreeDragPosition()
    this.moveFollowers(session)
  }

  finish(source: CdkDrag<string>) {
    const session = this.session
    if (!session || session.source !== source) return
    // setFreeDragPosition resets CDK's active transform. Restore the final passive
    // position AFTER cdkDragEnded, also when the pointer never moved after a pan.
    if (session.hasAdjusted) source.setFreeDragPosition(session.position)
    this.clear()
  }

  /** Stop motion but retain compensation until CDK finishes the current drag. */
  stop() {
    if (this.session) this.session.suspended = true
    this.cancelFrame()
    this.removeListeners?.()
    this.removeListeners = undefined
  }

  destroy() {
    this.clear()
  }

  ngOnDestroy() {
    this.destroy()
  }

  private clear() {
    this.stop()
    this.session = undefined
    this.pickup = undefined
  }

  private velocity(session: DragSession) {
    if (!session.pointer || session.suspended) return { x: 0, y: 0 }
    const rect = session.viewport.getBoundingClientRect()
    return calculateEdgePanVelocity(session.pointer, {
      left: Math.max(0, rect.left),
      right: Math.min(window.innerWidth, rect.right),
      top: Math.max(0, rect.top),
      bottom: Math.min(window.innerHeight, rect.bottom),
    }, {
      edgeZonePx: EDGE_ZONE_PX,
      maxSpeedPxPerSecond: MAX_SPEED_PX_PER_SECOND,
      crossAxisSteering: CROSS_AXIS_STEERING,
    })
  }

  private updateLoop() {
    const session = this.session
    if (!session) return
    const velocity = this.velocity(session)
    if (!velocity.x && !velocity.y) {
      this.cancelFrame()
    } else if (this.frame === undefined) {
      this.previousTime = undefined
      this.zone.runOutsideAngular(() => {
        this.frame = requestAnimationFrame(this.animate)
      })
    }
  }

  private readonly animate = (now: number) => {
    this.frame = undefined
    const session = this.session
    if (!session) return
    const velocity = this.velocity(session)
    if (!velocity.x && !velocity.y) {
      this.previousTime = undefined
      return
    }
    const seconds = this.previousTime === undefined ? 0 :
      Math.min(Math.max(0, now - this.previousTime), MAX_FRAME_INTERVAL_MS) / 1000
    this.previousTime = now
    if (seconds > 0) {
      const applied = this.panzoom.moveBy(-velocity.x * seconds, -velocity.y * seconds)
      const dx = -applied.x / session.scale
      const dy = -applied.y / session.scale
      if (dx || dy) {
        session.compensation.x += dx
        session.compensation.y += dy
        session.position = { x: session.position.x + dx, y: session.position.y + dy }
        session.source.setFreeDragPosition(session.position)
        session.passivePosition = { ...session.position }
        session.hasAdjusted = true
        this.moveFollowers(session)
        session.refresh()
      }
    }
    this.frame = requestAnimationFrame(this.animate)
  }

  private moveFollowers(session: DragSession) {
    const dx = session.position.x - session.origin.x
    const dy = session.position.y - session.origin.y
    for (const follower of session.followers) {
      follower.source.setFreeDragPosition({ x: follower.origin.x + dx, y: follower.origin.y + dy })
    }
  }

  private cancelFrame() {
    if (this.frame !== undefined) cancelAnimationFrame(this.frame)
    this.frame = undefined
    this.previousTime = undefined
  }
}
