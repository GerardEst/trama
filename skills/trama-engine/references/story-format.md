# Trama story format

What `fetchStory()` returns and what `createGame()` accepts. Read this to
understand a story or to build something around it (a map, statistics, an
outline). To *play* a story, never interpret these rules yourself: pass the tree
to the engine.

## Published story

```ts
interface PublishedStory {
  id: string                 // uuid
  name: string
  slug: string | null        // custom address chosen by the author
  settings: {
    cumulativeMode: boolean  // show earlier steps above the current one
    sharing: boolean         // the author allows share buttons on endings
    tapLink: boolean         // true = hide the "Created with Trama" link
    tracking: boolean        // the author records playthroughs (Trama's own player only)
    footer: { text?: string; link?: string }
  }
  tree: StoryTree
}
```

The public API serves the tree without editor layout: no node positions, no
groups, no frames.

## Tree

```ts
interface StoryTree {
  nodes?: StoryNode[]
  refs?: Record<string, StoryRef>               // keyed by ref id
  categories?: { id: string; name: string }[]
  entryPoint?: { targetNodeId?: string }        // no target = the story has no start
  unavailableAnswerDisplay?: 'hidden' | 'locked' | 'requirements'  // default 'hidden'
}
```

Every field can be missing in older stories. Treat them all as optional.

## Nodes

```ts
interface StoryNode {
  id: string                     // e.g. "node_12"
  type: 'content' | 'text' | 'distributor' | 'end'
  name?: string                  // author's label, not shown to players
  text?: string                  // HTML passage (plain text in older stories)
  image?: { path: string }
  join?: StoryJoin[]             // automatic continuation
  answers?: StoryAnswer[]
  events?: StoryEvent[]          // applied when the node is entered
  conditions?: StoryConditionRoute[]            // distributor only
  fallbackCondition?: { join?: StoryJoin[] }    // distributor only
  userTextOptions?: { property: string; placeholder?: string; buttonText?: string; description?: string } // text only
  links?: { name: string; url: string }[]       // shown on endings
  share?: { sharedText?: string; shareButtonText?: string }  // endings
}
```

| Type | Shown | Moves on when |
| --- | --- | --- |
| `content` | Passage, image and answers | The player chooses an answer. A content node without answers but with `join` continues by itself. |
| `text` | Passage and a text field | The player submits a value (Trama requires one, up to 100 characters). It is stored in the property `userTextOptions.property`, or not stored when that is empty. Then `join` is followed. |
| `distributor` | Never | Immediately: the first route whose rules all match, else `fallbackCondition`. |
| `end` | Passage, links, share | Never. The story is over. |

## Joins

```ts
interface StoryJoin { node: string; toAnswer?: boolean }
```

`join` is always an array. When it holds several targets, the engine picks one
at random (this is how authors make random branches). `toAnswer: true` means
"show only the answers of the target node", skipping its passage.

## Answers

```ts
interface StoryAnswer {
  id: string                         // e.g. "answer_3_1"
  text?: string                      // HTML, usually one <p>
  join?: StoryJoin[]                 // empty = unfinished answer, not clickable
  events?: StoryEvent[]              // applied when chosen
  requirements?: StoryRequirement[]  // all must be met
  unavailableAnswerDisplay?: 'hidden' | 'locked' | 'requirements'  // overrides the story setting
}
```

When requirements are not met, the answer is hidden, shown locked, or shown
locked with the missing requirements, depending on `unavailableAnswerDisplay`.

## Player state and refs

The player has three kinds of values. Refs give them names:

```ts
interface StoryRef { name: string; type: 'stat' | 'condition' | 'property'; category?: string }
// refs: { "stat_1": { name: "gold", type: "stat" }, "condition_0": { name: "has_key", type: "condition" } }
```

| Kind | Value | Changed by |
| --- | --- | --- |
| stat | Number. Never below 0; 0 means the player does not have it. | `alterStat` adds `amount` (can be negative). |
| condition | Present or absent. | `alterCondition`: `amount` 1 adds, anything else removes. |
| property | String. | `alterProperty` stores `property`; text nodes store what the player typed. |

```ts
interface StoryEvent { action: 'alterStat' | 'alterCondition' | 'alterProperty'; type: 'stat' | 'condition' | 'property'; target: string; amount: string | number; property?: string }
interface StoryRequirement { target: string; type: 'stat' | 'condition'; amount: number } // stat: minimum; condition: 1 must have, 0 must not have
```

Distributor rules:

```ts
interface StoryConditionRoute { join?: StoryJoin[]; rules: { ref?: string; comparator?: 'equalto' | 'lessthan' | 'morethan'; value?: number | string }[] }
```

The ref type comes from its id prefix (`stat_…`, `condition_…`). Stats compare
with `comparator`; conditions ignore it and use `value` 1 (has) or 0 (has not).
A route without rules never matches.

## Text

Passages and answers are HTML from the editor's rich text field. Variables and
categories are marked with explicit tokens:

```html
<span data-trama-variable data-kind="stat" data-key="stat_gold">#stat_gold</span>
<div data-trama-category data-key="inventory">[inventory]</div>
```

The engine replaces them with the player's values (escaped) when it renders a
scene. A category becomes `<div class="storyCategory__entries">` with one owned
ref per line ("Gold: 5", "Key"); style it with `white-space: pre-line`.

Images: `image.path` is relative to Trama's public storage. Scenes already carry
the full `url`.
