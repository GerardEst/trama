const LONG_PRESS_MS = 500
const LONG_PRESS_TOLERANCE_PX = 10

/**
 * Detects a finger held still, the touch stand-in for a right click.
 * Feed it the pointer events of one surface; it fires once per press.
 */
export class LongPress {
  private press?: { pointerId: number; x: number; y: number; timer: ReturnType<typeof setTimeout> }

  constructor(private readonly onLongPress: (event: PointerEvent) => void) {}

  /** Starts timing a primary touch; any other press (a second finger, a mouse) cancels. */
  down(event: PointerEvent) {
    this.cancel()
    if (event.pointerType !== 'touch' || !event.isPrimary) return
    const timer = setTimeout(() => {
      this.press = undefined
      this.onLongPress(event)
    }, LONG_PRESS_MS)
    this.press = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, timer }
  }

  /** A finger that travels is panning, not pressing. */
  move(event: PointerEvent) {
    const press = this.press
    if (press && event.pointerId === press.pointerId &&
      Math.hypot(event.clientX - press.x, event.clientY - press.y) >= LONG_PRESS_TOLERANCE_PX) this.cancel()
  }

  cancel() {
    if (this.press) clearTimeout(this.press.timer)
    this.press = undefined
  }
}
