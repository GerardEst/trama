/** The window the dashboard counts recent plays in, in days. */
export const RECENT_DAYS = 30

/**
 * How many plays fell on each local day of the recent window, oldest first and today last.
 * Plays outside the window are left out.
 */
export function playsPerDay(playedAt: readonly string[], days = RECENT_DAYS, now = new Date()): number[] {
  const counts = new Array<number>(days).fill(0)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  for (const date of playedAt) {
    const played = new Date(date)
    const day = new Date(played.getFullYear(), played.getMonth(), played.getDate())
    // Whole days between the two midnights; rounding absorbs a daylight-saving hour.
    const ago = Math.round((today.getTime() - day.getTime()) / 86_400_000)
    if (ago >= 0 && ago < days) counts[days - 1 - ago]++
  }
  return counts
}
