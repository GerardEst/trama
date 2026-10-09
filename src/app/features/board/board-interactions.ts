/** UI-only origin/drag key, never stored as a node ID. */
export const ENTRY_POINT_ORIGIN = '@entry'

export interface BoardPoint {
  x: number
  y: number
}

export interface BoardJoinStroke {
  originId: string
  from: HTMLElement
  to: BoardPoint
}
