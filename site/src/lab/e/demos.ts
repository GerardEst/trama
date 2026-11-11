import type { StoryTree } from '@trama-app/engine'
import type { Lang } from '../../i18n'
import { type LiveId } from '../atlas'
import { liveTree } from '../atlas/trees'
import { labCopyFor } from '../content'

/** The atlas's playable examples, plus an ending to publish. */
export type DemoId = LiveId | 'publish'

// Two paths to one ending, with the share button and the links an author adds.
function publishTree(lang: Lang): StoryTree {
  const a = labCopyFor(lang).art
  return {
    nodes: [
      {
        id: 'start',
        type: 'content',
        text: `<p>${a.crossroadsText}</p>`,
        answers: [
          { id: 'forest', text: a.forest, join: [{ node: 'gates' }] },
          { id: 'river', text: a.river, join: [{ node: 'gates' }] },
        ],
      },
      {
        id: 'gates',
        type: 'end',
        text: `<p>${a.endingText}</p>`,
        share: { shareButtonText: a.passOn },
        links: [{ name: a.moreStories, url: 'https://trama.app' }],
      },
    ],
    refs: {},
    categories: [],
    entryPoint: { targetNodeId: 'start' },
  } as StoryTree
}

// Where each scene of the playable examples sits on its live board. The trees
// themselves are the atlas's (tested in atlas/trees.test.ts); the board only adds
// positions, so the example a reader edits is the one the engine plays.
const LAYOUTS: Partial<Record<DemoId, Record<string, [left: number, top: number]>>> = {
  scene: { start: [20, 70], forest_end: [450, 40], river_end: [450, 330] },
  connections: { market: [20, 70], gone: [460, 170] },
  events: { room: [20, 70], out: [460, 190] },
  requirements: { door: [20, 70], open_end: [460, 150] },
  distributors: { guard: [10, 70], route: [380, 110], open: [700, 40], shut: [700, 330] },
  input: { ask: [20, 90], greet: [450, 100] },
  publish: { start: [20, 70], gates: [460, 90] },
}

/** The Start marker sits just above the first scene. */
const ENTRY: [left: number, top: number] = [20, 14]

type StoryNode = NonNullable<StoryTree['nodes']>[number]

export interface BoardStory extends StoryTree {
  nodes: (StoryNode & { left: number; top: number })[]
}

/**
 * The editor finds a scene from the ids of its answers and routes, so a story on
 * the board must use the app's ids: node_1, answer_1_0, condition_1_0. The atlas
 * names its scenes for readability; this renames them, joins included.
 */
function withAppIds(tree: StoryTree): StoryTree {
  const nodes = tree.nodes ?? []
  const ids = new Map(nodes.map((node, index) => [node.id, `node_${index + 1}`]))
  const rejoin = (joins?: { node: string; toAnswer?: boolean }[]) =>
    joins?.map(join => ({ ...join, node: ids.get(join.node) ?? join.node }))
  return {
    ...tree,
    entryPoint: tree.entryPoint && { ...tree.entryPoint, targetNodeId: ids.get(tree.entryPoint.targetNodeId ?? '') },
    nodes: nodes.map((node, index) => {
      const n = index + 1
      return {
        ...node,
        id: `node_${n}`,
        join: rejoin(node.join),
        answers: node.answers?.map((answer, k) => ({ ...answer, id: `answer_${n}_${k}`, join: rejoin(answer.join) })),
        conditions: node.conditions?.map((condition, k) => ({ ...condition, id: `condition_${n}_${k}`, join: rejoin(condition.join) })),
        fallbackCondition: node.fallbackCondition && { ...node.fallbackCondition, join: rejoin(node.fallbackCondition.join) },
      }
    }),
  } as StoryTree
}

/** An atlas example with the app's ids and the positions the board needs. */
export function boardStory(id: DemoId, lang: Lang): BoardStory {
  const source = id === 'publish' ? publishTree(lang) : liveTree(id, lang)
  const layout = LAYOUTS[id] ?? {}
  const positions = (source.nodes ?? []).map((node, index) => layout[node.id] ?? [24 + index * 380, 40])
  const tree = withAppIds(source)
  return {
    ...tree,
    entryPoint: { ...tree.entryPoint, left: ENTRY[0], top: ENTRY[1] },
    nodes: (tree.nodes ?? []).map((node, index) => {
      const [left, top] = positions[index]!
      return { ...node, left, top }
    }),
  }
}
