export interface initial_parameters{
  guidebook: any,
  domPlace: string,
  player: any,
  config: any
}

export interface config{
  showLockedAnswers?: boolean,
  view?: string
}

export interface guidebook{
  nodes: Array<any>
}

export interface node_event{
  action: 'alterStat' | 'alterCondition' | 'win' | 'end',
  amount: string, // per ara ha de ser string perque ve del json stringified i tot son strings
  target: string
}
