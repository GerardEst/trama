# Contextual help

Optional authoring explanations, independent of story data and execution.

## Add an explanation

1. Add its title/body to `src/app/core/i18n/{en,ca,es}/context-help.ts`.
2. Map a stable topic ID to those translation keys and a `docsFragment` in
   `context-help.topics.ts`. The fragment must exist in every guide language. Node explanations use the
   canonical `board.node.types.*` titles rather than duplicating their names.
3. Import `ContextHelpComponent` in the consuming standalone component and place it explicitly:

```html
<span>
  Your label
  <polo-context-help topic="board.events"></polo-context-help>
</span>
```

Place it next to labels or controls, never inside a native button/link or a form label.
For integrated button help, project it into `ContextualButtonComponent` with the
`contextualButtonAccessory` attribute. The component groups both controls inside
one visual button surface while keeping their native buttons as siblings; it has
no dependency on the help system.
The help component owns the question mark, delayed hover, keyboard focus, touch/click,
Escape, viewport placement and teardown. Copy is plain text, not injected HTML.
Only one explanation can be open. Native manual popovers render in the top layer
without stealing focus or being clipped/scaled by the board. Document listeners
only exist while a panel is open; scrolling/resizing repositions it, board pan/zoom
and outside interaction dismiss it. Escape dismisses help before its parent editor.

`NODE_CONTEXT_HELP_TOPICS` maps the four playable node types to their topics.
Node headers and the board creation menu reuse this mapping and the same
`board.node.types.*` labels. The menu keeps help controls separate from creation
buttons, and destroys its help instances when closed.

Every explanation includes a documentation link styled as a button. It opens the
matching `/docs/features#chapter` in a new tab so the board stays open. Since the
panel contains a focusable link, it is a non-modal dialog, not a tooltip. Keyboard
focus can move from the question mark into the panel without closing it; Escape
from the link returns focus to the question mark.

## Preference

`ContextHelpService` owns a read-only enabled signal (default `true`) and persists
explicit choices under `polo-context-help` in localStorage. It is a browser
preference, not an account/server preference. Blocked storage does not break help.
`ContextHelpPreferenceComponent` is the dashboard control; its host does not need
to inject the service. Disabling help removes question marks and active panels.

## Remove the system

- Remove `polo-context-help` and `polo-context-help-preference` usages and imports.
- Remove this directory.
- Remove the three `context-help.ts` translation files and their imports/entries
  in the language indexes.

No story types, authoring services, backend configuration or execution logic depend
on this system. No global styles or new dependencies are required. The unused
localStorage key can remain or be removed separately.
