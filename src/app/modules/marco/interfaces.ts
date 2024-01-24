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
  showLockedAnswers?: boolean,
  view?: string
}

export interface guidebook{
  nodes: Array<node>
}

export interface node{
  id: string,
  left: number,
  top: number,
  answers: Array<node_answer>,
  text: string
}

export interface node_answer{
  id: string,
  join: Array<join>,
  text: string,
  events: Array<answer_event>
  requirements: Array<answer_requirement>
}

export interface answer_event{
  id: string,
  action: 'alterStat' | 'alterCondition' | 'win' | 'end',
  amount: string,
  target: string
}
export interface answer_requirement{
  id: string,
  type: 'stat' | 'condition',
  amount: string
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
