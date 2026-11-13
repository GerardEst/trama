import { describe, expect, it, vi } from 'vitest'
import { boardStory } from './demos'

vi.mock('astro:i18n', () => ({ getRelativeLocaleUrl: () => '/' }))

// The board draws a connection only from an id it knows: the app's own.
describe('the examples as the board reads them', () => {
  it('gives every route of a distributor the app’s id, the fallback included', () => {
    const story = boardStory('connections', 'en')
    const distributor = story.nodes.find(node => node.type === 'distributor')!
    const number = distributor.id.replace('node_', '')
    expect(distributor.conditions?.map(condition => condition.id)).toEqual([`condition_${number}_0`])
    expect(distributor.fallbackCondition).toEqual({
      id: `condition_${number}_fallback`,
      join: [{ node: story.nodes.find(node => node.text?.includes('dark'))!.id }],
    })
  })

  it('frames scenes by the ids the board gives them and leaves the distributor out', () => {
    const story = boardStory('connections', 'en')
    const framed = (story.frames as { nodeIds: string[] }[])[0]!.nodeIds
    expect(framed).toHaveLength(3)
    expect(framed.every(id => story.nodes.some(node => node.id === id && node.type === 'content'))).toBe(true)
  })

  it('keeps the Start marker off the board, level with the first scene', () => {
    const story = boardStory('scene', 'en')
    expect(story.entryPoint).toEqual({ targetNodeId: 'node_1', left: -220, top: story.nodes[0]!.top })
  })
})
