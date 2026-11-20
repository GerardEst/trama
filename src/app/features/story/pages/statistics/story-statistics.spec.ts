import { GameRow, endingOf, summarize } from './story-statistics'
import type { tree } from 'src/app/core/interfaces/interfaces'

describe('story statistics', () => {
  const story: Pick<tree, 'nodes' | 'refs'> = {
    refs: { stat_gold: { name: 'Gold', type: 'stat' }, condition_key: { name: 'Key', type: 'condition' }, property_name: { name: 'Name', type: 'property' } },
    nodes: [
      { id: 'node_0', type: 'content', top: 0, left: 0 },
      { id: 'node_win', name: 'The crown', type: 'end', top: 0, left: 0 },
      { id: 'node_lose', type: 'end', top: 0, left: 0 },
    ],
  }
  const now = Date.parse('2026-11-20T12:00:00Z')
  const step = (id: string) => ({ id, type: 'node' as const, text: '', timestamp: 0 })
  const games: GameRow[] = [
    { user_name: 'anna', created_at: '2026-11-19T10:00:00Z', path: [step('node_0'), step('node_win')], result: { stats: { stat_gold: 4 }, conditions: ['condition_key'], properties: {} } },
    { user_name: 'pau', created_at: '2026-11-18T10:00:00Z', path: [step('node_0'), step('node_win')], result: { stats: { stat_gold: 2 }, conditions: [], properties: {} } },
    { user_name: 'Anonymous', created_at: '2026-09-01T10:00:00Z', path: [step('node_0')], result: { stats: {}, conditions: [], properties: {} } },
  ]

  it('takes a game’s ending from the last node of its path, only when that node is an end', () => {
    expect(endingOf(games[0], story)).toBe('node_win')
    expect(endingOf(games[2], story)).toBeUndefined()
    expect(endingOf({ ...games[0], path: undefined }, story)).toBeUndefined()
  })

  it('counts games, recent games and endings, the most reached first and unfinished last', () => {
    const summary = summarize(games, story, now)
    expect(summary.plays).toBe(3)
    expect(summary.recent).toBe(2)
    expect(summary.lastPlayed).toBe('2026-11-19T10:00:00Z')
    expect(summary.endings).toEqual([
      { nodeId: 'node_win', name: 'The crown', count: 2 },
      { nodeId: undefined, name: undefined, count: 1 },
    ])
  })

  it('averages stats and gives the share of games that meet each condition, leaving properties out', () => {
    expect(summarize(games, story, now).references).toEqual([
      { id: 'stat_gold', name: 'Gold', type: 'stat', value: 2 },
      { id: 'condition_key', name: 'Key', type: 'condition', value: 1 / 3 },
    ])
    expect(summarize([], story, now).references.map((ref) => ref.value)).toEqual([0, 0])
  })
})
