import { Story, StoryNode, StoryTree, UnavailableAnswerDisplay } from './types'

/**
 * Indexes a story tree for playing. The tree is used as it is, not copied:
 * treat it as read-only and pass edits to `game.updateStory()` as a new tree.
 */
export function loadStory(tree: StoryTree): Story {
  const nodes = tree.nodes ?? []
  const playable = new Map<string, StoryNode>()
  for (const node of nodes) {
    if (node.type !== 'group') playable.set(node.id, node)
  }
  const entry = tree.entryPoint?.targetNodeId

  return {
    nodes,
    refs: tree.refs ?? {},
    entryNodeId: entry && playable.has(entry) ? entry : undefined,
    unavailableAnswerDisplay: answerDisplay(tree.unavailableAnswerDisplay),
    node: (id: string) => playable.get(id),
  }
}

export function answerDisplay(value: unknown): UnavailableAnswerDisplay {
  return value === 'locked' || value === 'requirements' ? value : 'hidden'
}
