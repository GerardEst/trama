export interface ref {
  id?: string
  name: string
  type: string
}

export interface tree {
  refs?: Array<ref>
  nodes?: Array<node>
}

export interface config {
  title: string
  showLockedAnswers: boolean
  sharing: boolean
  tapLink: boolean
  cumulativeMode: boolean
  footer: any
  tracking: boolean
  customId?: string
}

export interface node {
  id: string
  top: string
  left: string
  join?: Array<join>
  image?: { path: string }
  answers?: Array<node_answer>
  conditions?: Array<node_conditions>
  fallbackCondition?: node_fallbackCondition
  text?: string
  type: 'text' | 'content' | 'distributor' | 'end'
  share?: shareOptions
  links?: link[]
  userTextOptions?: node_userTextOptions
  events?: Array<event>
}

export interface node_answer {
  id: string
  join: Array<join>
  text: string
  events: Array<event>
  requirements: Array<answer_requirement>
}

export interface node_conditions {
  id: string
  join?: Array<join>
  ref: string
  comparator: string
  value: number
}
export interface node_userTextOptions {
  property: string
  placeholder?: string
  buttonText?: string
  description?: string
}
export interface node_fallbackCondition {
  id: string
  join?: Array<join>
}
export interface event {
  id: string
  action: 'alterStat' | 'alterCondition' // TODO - Quedar-me amb type, crec que action només l'està liant
  type: 'stat' | 'condition'
  amount: string
  target: string
}
export interface answer_requirement {
  id: string
  type: 'stat' | 'condition'
  amount: number
}

export interface shareOptions {
  sharedText?: string
  shareButtonText?: string
}

export interface link {
  name: string
  url: string
}

export interface property {
  [key: string]: string // Basicament pot tenir qualsevol cosa que se li vulgui fotre
}

export interface stat {
  id: string
  amount: number
}
export interface condition {
  id: string
}
export interface join {
  node: string
  toAnswer?: boolean
}
export interface externalEvent {
  name: 'leaveTab' | 'goBackToTab' | 'blurWindow' | 'focusWindow'
  time: number
}

// Results and Stadistics
export interface external_event {
  name: 'goBackToTab' | 'focusWindow' | 'blurWindow' | 'leave tab'
  time: 1708971350724
}
export interface path {
  id: string
  text: string
  timestamp: number
  type: 'node' | 'answer'
}
export interface result {
  conditions: condition[]
  name: string
  stats: stat[]
}
export interface game {
  created_at: string
  external_events: external_event[]
  path: path[]
  result: result
  user_name: string
}
