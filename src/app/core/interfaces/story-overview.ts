/** One story of the author, with how often it has been played and when it was last edited, for the dashboard. */
export interface StoryOverview {
  id: string
  name: string
  slug: string | null
  tracking: boolean
  plays: number
  recentPlays: number
  lastPlayedAt: string | null
  editedAt: string | null
}
