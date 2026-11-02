import { describe, expect, it } from 'vitest'
import { loadStory } from '../src'

describe('loadStory', () => {
  it('starts at the entry target and nowhere else', () => {
    expect(loadStory({ entryPoint: { targetNodeId: 'b' }, nodes: [{ id: 'a', type: 'content' }, { id: 'b', type: 'content' }] })
      .entryNodeId).toBe('b')
    expect(loadStory({ nodes: [{ id: 'node_0', type: 'content' }] }).entryNodeId).toBeUndefined()
    expect(loadStory({ entryPoint: { left: 0, top: 0 }, nodes: [{ id: 'node_0', type: 'content' }] }).entryNodeId).toBeUndefined()
  })

  it('never starts at a group or a missing node', () => {
    expect(loadStory({ entryPoint: { targetNodeId: 'g' }, nodes: [{ id: 'g', type: 'group' }] }).entryNodeId).toBeUndefined()
    expect(loadStory({ entryPoint: { targetNodeId: 'x' }, nodes: [] }).entryNodeId).toBeUndefined()
  })

  it('indexes playable nodes and defaults missing collections', () => {
    const story = loadStory({ nodes: [{ id: 'a', type: 'end' }, { id: 'g', type: 'group' }] })
    expect(story.node('a')?.type).toBe('end')
    expect(story.node('g')).toBeUndefined()
    const empty = loadStory({})
    expect(empty.nodes).toEqual([])
    expect(empty.refs).toEqual({})
    expect(empty.unavailableAnswerDisplay).toBe('hidden')
  })

  it('uses the given tree without copying it', () => {
    const node = { id: 'a', type: 'content' as const }
    expect(loadStory({ nodes: [node] }).node('a')).toBe(node)
  })
})
