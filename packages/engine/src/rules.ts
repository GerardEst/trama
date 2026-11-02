import {
  MissingRequirement,
  PlayerState,
  StateChange,
  Story,
  StoryConditionRule,
  StoryEvent,
  StoryJoin,
  StoryNode,
  StoryRequirement,
} from './types'

export function emptyPlayer(): PlayerState {
  return { properties: {}, stats: {}, conditions: [] }
}

export function meetsRequirement(player: PlayerState, requirement: StoryRequirement): boolean {
  const ref = requirement.target
  const required = Number(requirement.amount)
  if (!ref || !Number.isFinite(required)) return false
  if (requirement.type === 'stat') return (player.stats[ref] ?? 0) >= required
  if (requirement.type === 'condition') return (required === 1) === player.conditions.includes(ref)
  return true
}

export function meetsRequirements(player: PlayerState, requirements: readonly StoryRequirement[] = []) {
  return requirements.every(requirement => meetsRequirement(player, requirement))
}

export function missingRequirements(
  story: Story, player: PlayerState, requirements: readonly StoryRequirement[] = []
): MissingRequirement[] {
  return requirements.filter(requirement => !meetsRequirement(player, requirement)).map(requirement => {
    const ref = requirement.target
    return {
      ref,
      name: story.refs[ref]?.name,
      type: requirement.type,
      required: Number(requirement.amount),
      current: requirement.type === 'stat'
        ? player.stats[ref] ?? 0
        : player.conditions.includes(ref) ? 1 : 0,
    }
  })
}

/** Joins of the first distributor route whose rules all match, else the fallback. */
export function distribute(node: StoryNode, player: PlayerState): readonly StoryJoin[] {
  for (const route of node.conditions ?? []) {
    const rules = route.rules ?? []
    if (rules.length > 0 && rules.every(rule => matchesRule(rule, player))) return route.join ?? []
  }
  return node.fallbackCondition?.join ?? []
}

export function matchesRule(rule: StoryConditionRule, player: PlayerState): boolean {
  if (!rule.ref) return false
  const required = Number(rule.value ?? 0)
  const type = rule.ref.split('_')[0]
  if (type === 'stat') {
    const amount = player.stats[rule.ref] ?? 0
    return (rule.comparator === 'equalto' && amount === required) ||
      (rule.comparator === 'lessthan' && amount < required) ||
      (rule.comparator === 'morethan' && amount > required)
  }
  if (type === 'condition') {
    const has = player.conditions.includes(rule.ref)
    return (required === 1 && has) || (required === 0 && !has)
  }
  return false
}

/** Applies events to a copy of the player state and reports what changed. */
export function applyEvents(player: PlayerState, events: readonly StoryEvent[] = []) {
  const next: PlayerState = structuredClone(player)
  const changes: StateChange[] = []
  for (const event of events) {
    if (event.action === 'alterProperty') {
      changes.push(setProperty(next, event.target, event.property ?? ''))
    } else if (event.action === 'alterStat') {
      const amount = Number(event.amount)
      if (!Number.isFinite(amount)) continue
      const before = next.stats[event.target]
      const after = (before ?? 0) + amount
      // Stats never go below zero; zero means the player does not have it.
      if (after <= 0) delete next.stats[event.target]
      else next.stats[event.target] = after
      changes.push({ type: 'stat', ref: event.target, before: before ?? 0, after: Math.max(after, 0) })
    } else if (event.action === 'alterCondition') {
      const before = next.conditions.includes(event.target)
      const after = Number(event.amount) === 1
      if (after && !before) next.conditions.push(event.target)
      if (!after) next.conditions = next.conditions.filter(condition => condition !== event.target)
      changes.push({ type: 'condition', ref: event.target, before, after })
    }
  }
  return { player: next, changes }
}

export function setProperty(player: PlayerState, property: string, value: string): StateChange {
  const before = player.properties[property]
  player.properties[property] = value
  return { type: 'property', ref: property, before, after: value }
}
