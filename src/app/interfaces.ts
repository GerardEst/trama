export interface answer {}

export interface node {
  id: string
  top: string
  left: string
  text?: string
  answers?: Array<answer>
  type: 'content' | 'distributor' | 'end'
}

export interface condition {
  id: string
  ref?: string
  comparator?: string
  value?: number
}

export interface option {
  id: string
  name: string
  type: string
}
