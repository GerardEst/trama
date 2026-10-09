export interface ScreenPoint {
  x: number
  y: number
}

export interface EdgePanViewport {
  left: number
  right: number
  top: number
  bottom: number
}

export interface EdgePanOptions {
  edgeZonePx: number
  maxSpeedPxPerSecond: number
  /** Centre-relative steering strength on the perpendicular axis, from 0 to 1. */
  crossAxisSteering: number
}

/** Navigation velocity in screen pixels/second (the canvas moves oppositely). */
export function calculateEdgePanVelocity(
  pointer: ScreenPoint,
  viewport: EdgePanViewport,
  options: EdgePanOptions
): ScreenPoint {
  const width = viewport.right - viewport.left
  const height = viewport.bottom - viewport.top
  if (width <= 0 || height <= 0 || options.edgeZonePx <= 0 || options.maxSpeedPxPerSecond <= 0) {
    return { x: 0, y: 0 }
  }

  // Avoid overlapping edge zones in small embedded boards.
  const horizontalZone = Math.min(options.edgeZonePx, width / 2)
  const verticalZone = Math.min(options.edgeZonePx, height / 2)
  const intensity = (distance: number, zone: number) =>
    Math.pow(Math.min(1, Math.max(0, 1 - distance / zone)), 2)

  const edgeX = intensity(viewport.right - pointer.x, horizontalZone) -
    intensity(pointer.x - viewport.left, horizontalZone)
  const edgeY = intensity(viewport.bottom - pointer.y, verticalZone) -
    intensity(pointer.y - viewport.top, verticalZone)
  const centred = (position: number, start: number, size: number) =>
    Math.min(1, Math.max(-1, (position - start - size / 2) / (size / 2)))
  const steering = Math.min(1, Math.max(0, options.crossAxisSteering))

  // Only edge penetration activates panning. Once active, even a small offset
  // from the centre line steers the other axis, fading into its own edge force.
  const x = edgeX + (1 - Math.abs(edgeX)) * Math.abs(edgeY) *
    centred(pointer.x, viewport.left, width) * steering
  const y = edgeY + (1 - Math.abs(edgeY)) * Math.abs(edgeX) *
    centred(pointer.y, viewport.top, height) * steering
  const speed = options.maxSpeedPxPerSecond / Math.max(1, Math.hypot(x, y))

  return { x: x * speed, y: y * speed }
}
