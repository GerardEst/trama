/** UI-only origin/drag key, never stored as a node ID. */
export const ENTRY_POINT_ORIGIN = '@entry'

/**
 * Elements inside the board that act on their own press instead of moving the
 * board or a node: board gestures must leave them their focus and click.
 */
export const BOARD_CONTROL_SELECTOR =
  'button, a, input, textarea, select, label, [contenteditable], [role="textbox"], [role="button"], [role="menuitem"]'

export function isBoardControl(target: EventTarget | null): boolean {
  return target instanceof Element && !!target.closest(BOARD_CONTROL_SELECTOR)
}

export interface BoardPoint {
  x: number
  y: number
}

export interface BoardJoinStroke {
  originId: string
  from: HTMLElement
  to: BoardPoint
}
