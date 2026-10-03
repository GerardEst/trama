# Sortable lists

`SortableListDirective` is a standalone, dependency-free ordering primitive. It does not know about story nodes or mutate data.

```html
<div poloSortableList (sorted)="reorder($event)" (sorting)="pauseOtherGestures($event)">
  @for (item of items; track item.id) {
    <div [attr.data-sortable-id]="item.id">
      <button type="button" data-sortable-handle aria-label="Drag to reorder, or use arrow keys">⠿</button>
      <!-- Editable content is not a drag handle. -->
    </div>
  }
</div>
```

- Items must be direct children with unique, stable `data-sortable-id` values.
- `sorted` emits `{ id, toIndex }`, where `toIndex` is the final zero-based index. The consumer updates its model and renders the new order, tracking by ID.
- `sorting` is true during a pointer gesture and false on completion/cancellation. Use it to suspend competing gestures such as board panning.
- Style the handle with `touch-action: none` and `user-select: none`. Keep it focusable and give it a translated accessible name explaining the keyboard controls. The shared `SortableHandleComponent` (`polo-sortable-handle`, required `label` input) provides the same discreet, accessible grip for answers and distributor routes.
- Style `[data-sortable-dragging]` for the faded source. `SortableDragFeedback` creates a non-interactive `[data-sortable-preview]` ghost that follows the pointer and a separate `[data-sortable-indicator]` line in the insertion gap. Both are viewport overlays, so they never change item borders or list layout. Computed styles preserve the ghost's appearance and scale outside transformed containers; cloned IDs and board/sortable identities are removed. Overlays are hidden from assistive technology and cleaned up on every completion/cancellation.
- Up/Down, Home and End reorder from the handle. Focus is restored after Angular renders the new order; consumers should announce the resulting position in a live region.
- Pointer Events and pointer capture support mouse, touch and pen. Viewport-relative bounds support transformed/zoomed containers. No native HTML drag-and-drop or experimental browser APIs are required.
- Escape, pointer cancellation, lost capture, destruction and dropping outside the list do not emit a move. Transfers between lists and automatic scrolling are intentionally not supported.
