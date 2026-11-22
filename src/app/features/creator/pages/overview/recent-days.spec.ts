import { playsPerDay } from './recent-days'

describe('playsPerDay', () => {
  const now = new Date(2026, 10, 22, 18, 30)

  it('counts each play on its local day, today last', () => {
    const counts = playsPerDay([
      new Date(2026, 10, 22, 9).toISOString(),
      new Date(2026, 10, 22, 0, 5).toISOString(),
      new Date(2026, 10, 21, 23, 55).toISOString(),
      new Date(2026, 9, 24, 12).toISOString(),
    ], 30, now)
    expect(counts.length).toBe(30)
    expect(counts[29]).toBe(2)
    expect(counts[28]).toBe(1)
    expect(counts[0]).toBe(1)
    expect(counts.reduce((sum, count) => sum + count, 0)).toBe(4)
  })

  it('leaves out plays before the window or in the future', () => {
    const counts = playsPerDay([
      new Date(2026, 9, 23, 12).toISOString(),
      new Date(2026, 10, 23, 12).toISOString(),
    ], 30, now)
    expect(counts.every((count) => count === 0)).toBeTrue()
  })
})
