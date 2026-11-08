# @trama-app/engine API

Version 0.1.0. No dependencies, no UI. Runs in browsers, Node 18+, Deno and
workers.

```js
// Browser, no build step (pin the version):
import { createGame, fetchStory } from 'https://cdn.jsdelivr.net/npm/@trama-app/engine@0.1.0/+esm'
// With a bundler or Node:
//   npm install @trama-app/engine
import { createGame, fetchStory } from '@trama-app/engine'
```

## Loading

```ts
fetchStory(ref: { id: string } | { slug: string }, options?: { api?: string; fetch?: typeof fetch }): Promise<PublishedStory | undefined>
```

- Resolves `undefined` when the story does not exist (HTTP 404).
- Throws `StoryRequestError` (with `.status`) for any other failure.
- Endpoint: `TRAMA_STORY_API` = `https://lsemostpqoguehpsbzgu.supabase.co/functions/v1/story`
  (`?id=<uuid>` or `?slug=<slug>`, CORS open, cached 30 s). Stories cannot be
  listed.

## Playing

```ts
const game = createGame(story.tree, options?)
const unsubscribe = game.subscribe(event => { ... })   // subscribe before start()
game.start()
```

| Method | Returns | Does |
| --- | --- | --- |
| `start()` | `GameState` | Enters the starting node. No-op if already started. |
| `choose(answerId)` | `GameState` | Chooses an answer of the current step. Ignored if locked or unconnected. |
| `submitText(value)` | `GameState` | Answers the current text node. |
| `advance()` | `GameState` | Follows the automatic join (only needed with `autoAdvance: false`). |
| `back()` | `GameState` | Returns to the previous visit with the player state it had. |
| `goTo(visitIndex)` | `GameState` | Returns to any visit up to the cursor. |
| `restart()` | `GameState` | Starts over with an empty player. |
| `getState()` | `GameState` | Current state (a copy). |
| `save()` | `GameSave` | JSON-serializable save. |
| `updateStory(tree)` | `void` | Swaps in an edited story, keeping the playthrough. |
| `setAutoAdvance(bool)` | `void` | |
| `subscribe(fn)` | `() => void` | Listens to `GameEvent`s; returns unsubscribe. |
| `story` | `Story` | Indexed story: `story.node(id)`, `story.refs`, `story.entryNodeId`. |

```ts
restoreGame(tree, save, options?)   // continues a saved game; throws TypeError on unknown save versions
```

### Options

```ts
{
  random?: () => number              // [0, 1); seed it for reproducible random branches
  imageUrl?: (path: string) => string // defaults to Trama's public image storage
  maxAutomaticSteps?: number         // default 256, then reports 'automaticLoop'
  autoAdvance?: boolean              // default true
}
```

## State

```ts
interface GameState {
  started: boolean
  visits: Visit[]           // every recorded visit (including ones after the cursor after going back)
  cursor: number
  current?: Visit           // latest visit
  activeVisits: Visit[]     // what the player sees and acts on now (one or more nodes)
  previousVisits: Visit[]   // earlier steps, for a cumulative view
  player: { properties: Record<string, string>; stats: Record<string, number>; conditions: string[] }
  ended: boolean            // current node is an ending
  canGoBack: boolean
  problem: 'missingStart' | 'missingNode' | 'automaticLoop' | null
}

interface Visit {
  id: number                // unique and stable: use it as a render key
  nodeId: string
  step: number              // visits with the same step were reached without input in between
  player: PlayerState       // state on arrival, after the node's events
  scene: Scene
  selectedAnswerId?: string // set once the player chose an answer here
  userResponse?: string     // set once the player submitted text here
}

interface Scene {
  nodeId: string
  type: 'content' | 'text' | 'end'
  name?: string
  text: string              // HTML with variables resolved
  skipText: boolean         // do not show the passage, only the answers
  image?: { path: string; url: string }
  answers: SceneAnswer[]    // hidden locked answers already removed
  input?: { property: string; placeholder?: string; buttonText?: string; description?: string } // text nodes
  links: { name: string; url: string }[]
  share?: { sharedText?: string; shareButtonText?: string }
}

interface SceneAnswer {
  id: string
  text: string              // inline HTML (paragraphs become <br>)
  connected: boolean        // false: unfinished, render disabled
  locked: boolean           // requirements not met
  display: 'locked' | 'requirements'
  missing: { ref: string; name?: string; type: 'stat' | 'condition'; required: number; current: number }[]
}
```

### Events

```ts
type GameEvent =
  | { type: 'node'; visit }               // a node was entered
  | { type: 'answer'; answer; visit }     // the player chose an answer
  | { type: 'input'; property; value; visit }
  | { type: 'change'; change: { type: 'stat' | 'condition' | 'property'; ref; before; after } }
  | { type: 'end'; visit }
  | { type: 'problem'; problem }
  | { type: 'state'; state }              // once after every action that changed the game
```

Render from `state` events (or the `GameState` each action returns). Use
`change` events for effects such as "+5 gold" toasts, `end` for analytics.

## Helpers without a game

| Function | Use |
| --- | --- |
| `loadStory(tree)` | Index a tree: `story.node(id)`, `entryNodeId`, `refs`. |
| `renderScene(story, nodeId, entry, player, options?)` | What a node shows for a given player, without running events. `entry` is a join, e.g. `{ node: nodeId }`. |
| `applyEvents(player, events)` | `{ player, changes }` on a copy. |
| `distribute(distributorNode, player)` | The joins a distributor would follow. |
| `matchesRule(rule, player)` / `meetsRequirement(s)(player, reqs)` / `missingRequirements(story, player, reqs)` | Rule checks. |
| `interpolate(html, story, player)` | Resolve variable tokens in any text. |
| `inlineHtml(html)` / `plainText(html)` | Flatten paragraphs / strip markup (for excerpts, search, graphs). |
| `answerDisplay(value)` | Normalize an `unavailableAnswerDisplay` value. |

The tree is used as is, not copied: never mutate it while a game runs. Pass an
edited copy to `game.updateStory()`.
