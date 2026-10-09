import { calculateEdgePanVelocity } from './edge-pan-velocity'

describe('calculateEdgePanVelocity', () => {
  const viewport = { left: 100, right: 900, top: 50, bottom: 650 }
  const options = { edgeZonePx: 80, maxSpeedPxPerSecond: 600, crossAxisSteering: 0.5 }

  it('has a central dead zone, including the start of each edge strip', () => {
    expect(calculateEdgePanVelocity({ x: 500, y: 350 }, viewport, options)).toEqual({ x: 0, y: 0 })
    expect(calculateEdgePanVelocity({ x: 820, y: 130 }, viewport, options)).toEqual({ x: 0, y: 0 })
  })

  it('accelerates quadratically on each independent axis', () => {
    expect(calculateEdgePanVelocity({ x: 860, y: 350 }, viewport, options)).toEqual({ x: 150, y: 0 })
    expect(calculateEdgePanVelocity({ x: 100, y: 350 }, viewport, options)).toEqual({ x: -600, y: 0 })
    expect(calculateEdgePanVelocity({ x: 500, y: 50 }, viewport, options)).toEqual({ x: 0, y: -600 })
    expect(calculateEdgePanVelocity({ x: 500, y: 610 }, viewport, options)).toEqual({ x: 0, y: 150 })
  })

  it('steers vertically near either side edge as soon as the pointer leaves the centre line', () => {
    for (const x of [100, 900]) {
      for (const offset of [-50, -10, 10, 50]) {
        const velocity = calculateEdgePanVelocity({ x, y: 350 + offset }, viewport, options)
        expect(Math.sign(velocity.x)).toBe(x === 100 ? -1 : 1)
        expect(Math.sign(velocity.y)).toBe(Math.sign(offset))
        expect(velocity.y / Math.abs(velocity.x)).toBeCloseTo(offset / 300 * options.crossAxisSteering)
        expect(Math.hypot(velocity.x, velocity.y)).toBeCloseTo(600)
      }
    }
  })

  it('steers horizontally near top/bottom edges without activating in the central area', () => {
    const velocity = calculateEdgePanVelocity({ x: 510, y: 50 }, viewport, options)
    expect(velocity.x).toBeGreaterThan(0)
    expect(velocity.y).toBeLessThan(0)
    expect(velocity.x / Math.abs(velocity.y)).toBeCloseTo(10 / 400 * options.crossAxisSteering)
    expect(calculateEdgePanVelocity({ x: 510, y: 360 }, viewport, options)).toEqual({ x: 0, y: 0 })
  })

  it('fades steering with edge penetration and stops at the inner edge', () => {
    const shallow = calculateEdgePanVelocity({ x: 840, y: 360 }, viewport, options)
    const deeper = calculateEdgePanVelocity({ x: 860, y: 360 }, viewport, options)
    expect(shallow.y).toBeGreaterThan(0)
    expect(deeper.y).toBeCloseTo(shallow.y * 4)
    expect(calculateEdgePanVelocity({ x: 820, y: 360 }, viewport, options)).toEqual({ x: 0, y: 0 })
  })

  it('blends steering continuously into the perpendicular edge zone', () => {
    const before = calculateEdgePanVelocity({ x: 900, y: 130.001 }, viewport, options)
    const after = calculateEdgePanVelocity({ x: 900, y: 129.999 }, viewport, options)
    expect(before.x).toBeCloseTo(after.x, 2)
    expect(before.y).toBeCloseTo(after.y, 2)
  })

  it('allows steering to be disabled through caller configuration', () => {
    expect(calculateEdgePanVelocity({ x: 900, y: 360 }, viewport, {
      ...options, crossAxisSteering: 0,
    })).toEqual({ x: 600, y: 0 })
  })

  it('preserves diagonal direction and caps its combined speed', () => {
    const velocity = calculateEdgePanVelocity({ x: 900, y: 50 }, viewport, options)
    expect(velocity.x).toBeCloseTo(-velocity.y)
    expect(Math.hypot(velocity.x, velocity.y)).toBeCloseTo(600)
  })

  it('clamps outside pointers without increasing the maximum speed', () => {
    expect(calculateEdgePanVelocity({ x: 1000, y: 350 }, viewport, options)).toEqual({ x: 600, y: 0 })
  })

  it('accepts speed configuration from the caller', () => {
    expect(calculateEdgePanVelocity({ x: 900, y: 350 }, viewport, {
      ...options, maxSpeedPxPerSecond: 200,
    })).toEqual({ x: 200, y: 0 })
  })

  it('avoids opposing edge zones on small boards', () => {
    expect(calculateEdgePanVelocity({ x: 20, y: 20 }, {
      left: 0, right: 40, top: 0, bottom: 40,
    }, options)).toEqual({ x: 0, y: 0 })
  })

  it('does not move for empty viewports or disabled configuration', () => {
    expect(calculateEdgePanVelocity({ x: 0, y: 0 }, {
      left: 10, right: 0, top: 0, bottom: 600,
    }, options)).toEqual({ x: 0, y: 0 })
    expect(calculateEdgePanVelocity({ x: 900, y: 350 }, viewport, {
      ...options, edgeZonePx: 0,
    })).toEqual({ x: 0, y: 0 })
  })
})
