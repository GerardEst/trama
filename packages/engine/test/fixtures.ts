import { StoryNode, StoryTree } from '../src'

export function tree(nodes: Partial<StoryNode>[], extra: Partial<StoryTree> = {}): StoryTree {
  return {
    entryPoint: { targetNodeId: nodes[0]?.id },
    refs: {},
    ...extra,
    nodes: nodes.map(node => ({ type: 'content', ...node }) as StoryNode),
  }
}

/** A variable as the rich-text editor saves it. */
export function token(kind: 'property' | 'stat' | 'condition', key: string) {
  return `<span data-trama-variable="" data-kind="${kind}" data-key="${key}">#${key}</span>`
}
