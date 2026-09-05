export interface BoardPoint {
  x: number
  y: number
}

export interface BoardJoinStroke {
  originId: string
  from: HTMLElement
  to: BoardPoint
}
