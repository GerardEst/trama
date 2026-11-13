import type { StoryTree } from '@trama-app/engine'
import type { Lang } from '../../i18n'
import { type LiveId } from './atlas'
import { liveTree } from './atlas/trees'
import { landingCopyFor } from './content'

/** The atlas's playable examples, plus an ending to publish. */
export type DemoId = LiveId | 'publish'

// Two paths to one ending, with the share button and the links an author adds.
function publishTree(lang: Lang): StoryTree {
  const a = landingCopyFor(lang).art
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
  // The story goes on past the right edge: the castle's next scene is out of view.
  scene: { start: [20, 40], castle: [450, 40], margin: [450, 330], inside: [1160, 40] },
  // The market's scenes share a frame; the distributor waits outside it and its two ways out are out of view.
  connections: { market: [40, 60], lamp: [400, 305], lost: [400, 60], way_out: [780, 236], lit: [1320, 120], dark: [1320, 420] },
  events: { room: [20, 70], out: [460, 190] },
  requirements: { door: [20, 70], open_end: [460, 150] },
  distributors: { guard: [10, 70], route: [380, 110], open: [700, 40], shut: [700, 330] },
  input: { ask: [20, 90], greet: [450, 100] },
  publish: { start: [20, 70], gates: [460, 90] },
}

/**
 * The Start marker waits off the board, to the left of the first scene: only its
 * connection comes into view, so an example opens on the story itself.
 */
const ENTRY_LEFT = -220

/** The frames an example draws around its scenes: an editor's tool, so the engine's trees have none. */
const FRAMES: Partial<Record<DemoId, { id: string; name: (lang: Lang) => string; scenes: string[] }[]>> = {
  connections: [{ id: 'frame_1', name: lang => landingCopyFor(lang).art.market, scenes: ['market', 'lamp', 'lost'] }],
}

/** The pictures an example's scenes carry: the address of each, by scene. */
export type ScenePictures = Record<string, string>

type StoryNode = NonNullable<StoryTree['nodes']>[number]

export interface BoardStory extends StoryTree {
  nodes: (StoryNode & { left: number; top: number })[]
}

/**
 * The editor finds a scene from the ids of its answers and routes, so a story on
 * the board must use the app's ids: node_1, answer_1_0, condition_1_0,
 * condition_1_fallback. The atlas
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
        fallbackCondition: node.fallbackCondition && { ...node.fallbackCondition, id: `condition_${n}_fallback`, join: rejoin(node.fallbackCondition.join) },
      }
    }),
  } as StoryTree
}

/** An atlas example with the app's ids, the positions the board needs and its pictures. */
export function boardStory(id: DemoId, lang: Lang, pictures: ScenePictures = {}): BoardStory {
  const source = id === 'publish' ? publishTree(lang) : liveTree(id, lang)
  const layout = LAYOUTS[id] ?? {}
  const scenes = source.nodes ?? []
  const positions = scenes.map((node, index) => layout[node.id] ?? [24 + index * 380, 40])
  const first = scenes.findIndex(node => node.id === source.entryPoint?.targetNodeId)
  const tree = withAppIds(source)
  const appId = (scene: string) => tree.nodes![scenes.findIndex(node => node.id === scene)]!.id
  const frames = FRAMES[id]?.map(frame => ({ id: frame.id, name: frame.name(lang), nodeIds: frame.scenes.map(appId) }))
  return {
    ...tree,
    ...(frames && { frames }),
    entryPoint: { ...tree.entryPoint, left: ENTRY_LEFT, top: positions[first]?.[1] ?? 0 },
    nodes: (tree.nodes ?? []).map((node, index) => {
      const [left, top] = positions[index]!
      const picture = pictures[scenes[index]!.id]
      return { ...node, ...(picture && { image: { path: picture } }), left, top }
    }),
  }
}
