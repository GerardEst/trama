# Linear authoring view

The legend's Preview action opens a resizable board/reading workspace, with
70% for the board and 30% for preview by default (board range: 35–75%).
Desktop preview has a 550px minimum; one CSS-derived board width keeps the
board, divider, menus and entry distance aligned when that minimum applies.
Mobile overrides the minimum and fills the available width.
The pane enters from the right while both floating board menus translate left.
Shared CSS duration/easing coordinates all three motions; only `translate` and
opacity animate, not layout properties. Dragging or keyboard resizing follows
the divider immediately, and reduced-motion preferences disable the motion.
The reading pane fills the height with the same outer inset as the sidebar;
story controls and the legend stay in the board half. On small screens the
reading pane takes the full width and temporarily hides board menus; switching
to the board restores those menus and keeps the session.
Opening the dashboard on mobile still defaults to the board in this version.

## Boundaries

- `ActiveStoryService` is the only authored tree. Text corrections use
  `StoryEditorService` and the existing `StoryMutationService` autosave queue.
- `LinearEditorComponent` provides its own `PlayerService`, `GameEngineService`
  and `GameSessionService`. It does not load `PlaygroundComponent`, enable game
  tracking, or import either public player mode.
- `GameSessionService` owns navigation, visit checkpoints and cancellable
  automatic transitions. `GameEngineService` owns the shared story rules.
- Public single/cumulative presentations live in `playground/components/game/views/`.
  The linear view defaults to a single `GameNodeComponent` preview. Editing
  replaces it with a lightweight authoring sheet, independently of cumulative mode.
- The board receives a separate playing-node highlight and explicit reveal
  requests. Disabling Follow node clears the preview highlight; manual location
  still works without restoring it. Reveals ease into position and are cancelled
  when following stops or the author pans/zooms the board. Reduced-motion
  preferences keep reveals immediate. Selecting a board node never advances the
  playthrough. Following does not transfer keyboard focus or replace the editing
  selection.

## Reading layout

Preview and public players keep answer choices at the bottom of the reading
area, just like the edit sheet. Long passages remain in normal scrolling flow.
The public cumulative player expands only the current step to a viewport;
historical steps remain compact. Its reading-area measurement follows viewport
and header/footer changes while preserving scroll position.

## Deliberate editing concessions

Checkpoints capture player state after arrival events. Going back restores that
state without replaying events or random choices. A new choice discards the old
future. Changes to rules and connections never revalidate an already visited
path; subsequent navigation reads the latest authored data. Removing the
current node rewinds to the last existing visit, or restarts when none remain.

Only passages and answer text are editable here. Structural controls stay on
the board, but their services are independent of the canvas for future mobile
inspector reuse. Correction edits original source tokens, never interpolated
player values. One Edit/Preview toggle enables the passage and all authored
answers together. Answers become ordinary writing surfaces at the bottom of the
sheet, separated by a neutral divider: no pencils or navigation buttons in edit
mode. One shared rich-text toolbar follows the last focused surface (block
formatting remains disabled for inline-only answers). Embedded drafts autosave
after a short typing pause or blur, and are
flushed before navigation/closing/story switching. Consecutive autosaves to the
same field share one undo step until blur, an explicit commit, another field or
another authoring action. Leaving the dashboard flushes through CanDeactivate
before child editors are destroyed. External board corrections
refresh the sheet without replacing the selection on its own autosave echo.
Legacy plain-text variables/categories are converted to existing rich-text
tokens when corrected; ordinary text already authored as HTML stays literal.

## Regression coverage

- `playground/services/game-session.service.spec.ts`: checkpoints, branches,
  deletion, loops, distributor events and transition cancellation.
- `linear-editor.component.spec.ts`: text projection, source editing, player
  isolation and follow behavior.
- `tests/dashboard/linear-editor.test.ts`: mocked-backend desktop/mobile flows,
  autosave, group navigation, deletion and keyboard resizing. It can run with
  `--project=dashboard --no-deps` without real authentication credentials.
