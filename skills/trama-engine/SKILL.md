---
name: trama-engine
description: Build players, visualizations and tools for interactive stories made with Trama (trama.app) using the @trama-app/engine library. Use when the user wants to play, embed, restyle, map, analyze or summarize a Trama story, mentions a trama.app link, a story slug or id, or the @trama-app/engine package.
---

# Trama engine

Trama (https://trama.app) is an editor for branching interactive stories.
`@trama-app/engine` plays those stories without any UI: it resolves the next
node, applies events, checks requirements, evaluates distributors and fills in
variables. You provide the rendering.

## Rules

1. **Always play stories through the engine.** Never walk `tree.nodes`
   yourself to decide what comes next: random joins, distributors,
   requirements, events, variables and `toAnswer` jumps have exact rules that
   the engine already implements. Read the tree directly only for things that
   are not playing: maps, statistics, outlines.
2. **Pin the version**: `https://cdn.jsdelivr.net/npm/@trama-app/engine@0.1.0/+esm`
   in the browser, or `npm install @trama-app/engine` with a bundler or Node.
3. **Story text is author HTML.** Render it as HTML, not as text, and sanitize
   it (the template uses DOMPurify). Player values inside it are already escaped.
4. **Never mutate the tree** while a game runs. Pass an edited copy to
   `game.updateStory()`.
5. Stories are **read-only and cannot be listed**. You need the slug or id, and
   you cannot save changes to Trama.

## Finding the story

The user gives a slug, an id or a link:

- `https://trama.app/<slug>` → `{ slug: '<slug>' }`
- `https://trama.app/private/<uuid>` → `{ id: '<uuid>' }`

To understand a story before building anything, run the outline script instead
of reading the raw JSON. It is much smaller and lists structural problems:

```bash
node scripts/story-outline.mjs --slug <slug>        # or --id <uuid>, or a local .json file
node scripts/story-outline.mjs --slug <slug> --save story.json   # also keep the full story
```

## Building a player

Start from `assets/player.html`. It is a complete, dependency-free player
(engine and DOMPurify from a CDN) that behaves like Trama's own. Change
`STORY`, then restyle or restructure it as the user asks. Keep this behavior
unless the user wants otherwise:

| State | Render |
| --- | --- |
| `state.activeVisits` | **Every** visit, in order: a step can contain several nodes reached without input. All are interactive. |
| `state.previousVisits` | Only when `story.settings.cumulativeMode` is true, above the current step, read-only, with `visit.selectedAnswerId` and `visit.userResponse` shown. |
| `scene.text` | As HTML, unless `scene.skipText` is true. |
| `scene.image` | `scene.image.url`. |
| `scene.answers` | One button each (`answer.text` is inline HTML). Disabled when `locked` or `!connected`. When `locked` and `display === 'requirements'`, list `answer.missing` using `name`, never the `ref` id. |
| `scene.type === 'text'` | A required text field (max 100 characters) labeled with `input.description`, then `game.submitText(value)`. |
| `scene.type === 'end'` / `state.ended` | `scene.links`; a share button only if `settings.sharing` and `scene.share`; offer restart. |
| `state.problem` | A friendly notice (`missingStart`, `missingNode`, `automaticLoop`). |
| `state.canGoBack` | A back button → `game.back()`. |
| `settings.tapLink === false` | A "Created with Trama" link to https://trama.app. |
| `settings.footer` | The author's footer text and link. |

Render from the `state` event (`game.subscribe`) or the `GameState` each
action returns. Use `visit.id` as a key. Use `change` events for effects such
as "+5 gold" notices, and `player` from the state for HUDs of stats,
conditions and properties (names come from `game.story.refs`).

### Where the player runs

- A normal web page or local file can fetch the story from Trama's API.
- Sandboxes such as chat artifacts may block the API but allow the CDN. Then
  save the story with `--save` and paste it into the `embedded-story` script
  tag of the template (escape `</` as `<\/`).
- In frameworks (React, Vue, Svelte, Angular), keep one `Game` per playthrough,
  subscribe in an effect, unsubscribe on teardown, and keep the `GameState` in
  component state.

## Visualizations and analysis

- **Story maps:** nodes are vertices. Edges come from `node.join`, each
  `answer.join`, each `conditions[].join` and `fallbackCondition.join`.
  Use `plainText()` from the engine for labels.
- **What a node shows for a given player:** `renderScene(loadStory(tree), nodeId, { node: nodeId }, player)`.
- **Simulating many playthroughs** (ending frequencies, stat ranges): create
  games with a seeded `random`, choose answers by a policy (random,
  greedy…), and record `end` and `change` events. Cap the number of steps,
  since stories can loop.
- **Saving progress:** `game.save()` is plain JSON. Resume with
  `restoreGame(tree, save)`.

## References

- `references/engine-api.md`: every function, type and event of the engine.
- `references/story-format.md`: the story JSON (node types, joins, events,
  requirements, distributors, refs, text tokens).
- `assets/player.html`: the player template.
- `scripts/story-outline.mjs`: story outline and structural checks (Node 18+, no dependencies).
