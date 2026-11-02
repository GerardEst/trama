# @trama/engine

Play stories made with [Trama](https://trama.app) in your own interface. The
engine has no UI and no dependencies: it resolves the next node, applies
events, checks requirements, evaluates distributors and fills in variables.
Rendering is entirely up to you.

Runs in browsers, Node 17+, Deno and workers.

The engine reads the story tree exactly as the Trama editor saves it. The tree
is used as it is, without copying it: treat it as read-only while playing, and
pass edited versions to `game.updateStory()` as a new tree.

## Usage

```ts
import { createGame } from '@trama/engine'
import storyTree from './my-story.json'

const game = createGame(storyTree)

game.subscribe(event => {
  if (event.type === 'state') render(event.state)
  if (event.type === 'change') console.info(event.change) // { type: 'stat', ref: 'stat_gold', before: 0, after: 5 }
})

game.start()
// later, from your UI:
game.choose('answer_3_1')
game.submitText('Ada')
game.back()
```

| Action | What it does |
| --- | --- |
| `start()` | Enters the starting node. |
| `choose(answerId)` | Chooses an answer of the current step, if it is connected and its requirements are met. |
| `submitText(value)` | Answers the current text node and stores the value in its property. |
| `advance()` | Follows the automatic join of the current node (see `autoAdvance`). |
| `back()` / `goTo(index)` | Returns to an earlier visit with the player state it had, without replaying events. |
| `restart()` | Starts over with an empty player. |
| `updateStory(story)` | Swaps in an edited story without losing the playthrough. |

Each action also returns the new `GameState`:

| Field | Meaning |
| --- | --- |
| `activeVisits` | What the player sees and acts on now: the nodes reached since their last input. |
| `previousVisits` | Earlier steps, for a cumulative reading view. |
| `current` | The latest visit. `current.scene` holds what to render. |
| `player` | `{ properties, stats, conditions }` |
| `ended` | The current node is an ending. |
| `problem` | `missingStart`, `missingNode` or `automaticLoop` when the story is broken. |

### Scenes

```ts
interface Scene {
  nodeId: string
  type: 'content' | 'text' | 'end'
  text: string          // HTML (plain text in older stories), variables resolved
  skipText: boolean     // the author linked straight to the answers
  image?: { path: string; url: string }
  answers: SceneAnswer[]
  input?: { property: string; placeholder?: string; buttonText?: string; description?: string }
  links: { name: string; url: string }[]
}

interface SceneAnswer {
  id: string
  text: string          // inline HTML
  connected: boolean    // false while the answer has no destination
  locked: boolean       // requirements not met
  display: 'locked' | 'requirements'
  missing: { ref: string; name?: string; type: 'stat' | 'condition'; required: number; current: number }[]
}
```

Answers the author chose to hide while locked are left out. Player values
inserted into HTML are escaped. Categories become
`<div class="storyCategory__entries">`, one entry per line.

### Rendering without playing

`renderScene(story, nodeId, entry, player)` returns what a node shows for a
given player state, without running events. Editors use it to refresh a visit
after the author corrects the text.

### Saving

```ts
localStorage.setItem('save', JSON.stringify(game.save()))
const game = restoreGame(storyTree, JSON.parse(localStorage.getItem('save')!))
```

### Options

```ts
createGame(storyTree, {
  random: seededRandom,                  // reproducible branches; defaults to Math.random
  imageUrl: path => `/images/${path}`,   // defaults to Trama's public image storage
  maxAutomaticSteps: 256,                // nodes entered without input before reporting a loop
  autoAdvance: true,                     // false stops at every node until advance() is called
})
```

## Development

```bash
npm install
npm test
npm run typecheck
npm run build      # dist/: ESM, CommonJS and type declarations
```

Inside the Trama repository, the app imports the sources through the
`@trama/engine` path alias in the root `tsconfig.json`.
