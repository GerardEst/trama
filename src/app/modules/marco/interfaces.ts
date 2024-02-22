export interface initial_parameters{
  guidebook: any,
  domPlace: string,
  player: Partial<player>,
  config: config
}

export interface player{
  name?: string,
  stats: Array<stat>,
  conditions: Array<condition>,
  [key: string]: any; // Basicament pot tenir qualsevol cosa que se li vulgui fotre
}

export interface config{
  title?: string,
  showLockedAnswers?: boolean,
  view?: string,
  sharing?: boolean
}

export interface guidebook{
  nodes: Array<node>
}

export interface node{
  id: string,
  top: string
  left: string
  answers?: Array<node_answer>,
  conditions?: Array<node_conditions>,
  fallbackCondition?: node_fallbackCondition,
  text?: string,
  type: 'content' | 'distributor' | 'end',
  share?: shareOptions,
  links?: link[]
}

export interface node_answer{
  id: string,
  join: Array<join>,
  text: string,
  events: Array<answer_event>
  requirements: Array<answer_requirement>
}

export interface node_conditions{
  id: string,
  join?: Array<join>,
  ref: string,
  comparator: string,
  value: string
}
export interface node_fallbackCondition{
  id: string,
  join?: Array<join>,
}
export interface answer_event{
  id: string,
  action: 'alterStat' | 'alterCondition',
  amount: string,
  target: string
}
export interface answer_requirement{
  id: string,
  type: 'stat' | 'condition',
  amount: number
}

export interface shareOptions{
  sharedText?: string
  sharePath?: boolean
}

export interface link{
  name: string,
  url: string
}

export interface stat{
  id: string,
  amount: number
}
export interface condition{
  id: string,
}
export interface join{
  node: string,
}
export interface externalEvent{
  name: 'leaveTab' | 'goBackToTab' | 'blurWindow' | 'focusWindow',
  time: number
}
