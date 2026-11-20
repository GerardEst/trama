import { game, refType, tree } from 'src/app/core/interfaces/interfaces'

export const RECENT_DAYS = 30
const DAY = 24 * 3600 * 1000

export interface EndingCount {
  /** The end node reached, or undefined for games that stopped before an ending. */
  nodeId?: string
  name?: string
  count: number
}

export interface StatSummary {
  id: string
  name: string
  type: refType
  /** Mean final value of a stat, or the share of games that met a condition, from 0 to 1. */
  value: number
}

export interface StorySummary {
  plays: number
  recent: number
  lastPlayed?: string
  endings: EndingCount[]
  references: StatSummary[]
}

export type GameRow = Pick<game, 'created_at' | 'result' | 'user_name'> & Partial<Pick<game, 'path'>> & { id?: string | number }

/** The end node a game reached: the last node of its path, when that node is an ending. */
export function endingOf(gameRow: GameRow, story: Pick<tree, 'nodes'>): string | undefined {
  const lastNode = [...(gameRow.path ?? [])].reverse().find((step) => step.type === 'node')
  if (!lastNode) return undefined
  return story.nodes.find((storyNode) => storyNode.id === lastNode.id)?.type === 'end' ? lastNode.id : undefined
}

/** What the author wants to know first: how much the story is played, how it ends and where players finish. */
export function summarize(games: readonly GameRow[], story: Pick<tree, 'nodes' | 'refs'>, now = Date.now()): StorySummary {
  const sorted = [...games].sort((a, b) => b.created_at.localeCompare(a.created_at))
  const endings = new Map<string | undefined, number>()
  for (const gameRow of games) {
    const ending = endingOf(gameRow, story)
    endings.set(ending, (endings.get(ending) ?? 0) + 1)
  }
  const names = new Map(story.nodes.map((storyNode) => [storyNode.id, storyNode.name]))
  const references = Object.entries(story.refs ?? {})
    .filter(([, ref]) => ref.type === 'stat' || ref.type === 'condition')
    .map(([id, ref]) => ({
      id,
      name: ref.name,
      type: ref.type,
      value: games.length === 0 ? 0 : ref.type === 'stat'
        ? games.reduce((sum, gameRow) => sum + (Number(gameRow.result?.stats?.[id]) || 0), 0) / games.length
        : games.filter((gameRow) => gameRow.result?.conditions?.includes(id)).length / games.length,
    }))
  return {
    plays: games.length,
    recent: games.filter((gameRow) => now - new Date(gameRow.created_at).getTime() <= RECENT_DAYS * DAY).length,
    lastPlayed: sorted[0]?.created_at,
    endings: [...endings]
      .map(([nodeId, count]) => ({ nodeId, name: nodeId ? names.get(nodeId) : undefined, count }))
      // Endings first, the most reached on top; unfinished games last.
      .sort((a, b) => Number(!a.nodeId) - Number(!b.nodeId) || b.count - a.count),
    references,
  }
}
