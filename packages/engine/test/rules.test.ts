import { describe, expect, it } from 'vitest'
import { applyEvents, distribute, meetsRequirements, PlayerState, StoryConditionRoute, StoryConditionRule, StoryEvent, StoryNode } from '../src'

const player = (state: Partial<PlayerState> = {}): PlayerState =>
  ({ properties: {}, stats: {}, conditions: [], ...state })
const stat = (target: string, amount: string): StoryEvent => ({ action: 'alterStat', type: 'stat', target, amount })
const condition = (target: string, amount: string): StoryEvent =>
  ({ action: 'alterCondition', type: 'condition', target, amount })
const route = (node: string, ...rules: StoryConditionRule[]): StoryConditionRoute => ({ rules, join: [{ node }] })

describe('meetsRequirements', () => {
  it('passes without requirements', () => {
    expect(meetsRequirements(player())).toBe(true)
    expect(meetsRequirements(player(), [])).toBe(true)
  })

  it('compares stats against a minimum, including a zero threshold', () => {
    const rich = player({ stats: { stat_gold: 5, stat_wood: 1 } })
    expect(meetsRequirements(rich, [{ target: 'stat_gold', type: 'stat', amount: 5 }])).toBe(true)
    expect(meetsRequirements(rich, [{ target: 'stat_gold', type: 'stat', amount: 6 }])).toBe(false)
    expect(meetsRequirements(rich, [{ target: 'stat_iron', type: 'stat', amount: 1 }])).toBe(false)
    expect(meetsRequirements(player(), [{ target: 'stat_iron', type: 'stat', amount: 0 }])).toBe(true)
  })

  it('never unlocks with an invalid threshold or a missing reference', () => {
    expect(meetsRequirements(player(), [{ target: 'stat_gold', type: 'stat', amount: NaN }])).toBe(false)
    expect(meetsRequirements(player(), [{ target: '', type: 'stat', amount: 0 }])).toBe(false)
  })

  it('checks conditions to have and not to have', () => {
    const keyed = player({ conditions: ['condition_key'] })
    expect(meetsRequirements(keyed, [{ target: 'condition_key', type: 'condition', amount: 1 }])).toBe(true)
    expect(meetsRequirements(keyed, [{ target: 'condition_key', type: 'condition', amount: 0 }])).toBe(false)
    expect(meetsRequirements(player(), [{ target: 'condition_key', type: 'condition', amount: 1 }])).toBe(false)
  })
})

describe('distribute', () => {
  const node = (conditions: StoryConditionRoute[], fallback?: string): StoryNode => ({
    id: 'd', type: 'distributor', conditions,
    ...(fallback ? { fallbackCondition: { join: [{ node: fallback }] } } : {}),
  })
  const gold = (amount: number) => player({ stats: { stat_gold: amount } })

  it('evaluates stat comparators and conditions', () => {
    expect(distribute(node([route('rich', { ref: 'stat_gold', comparator: 'morethan', value: 5 })]), gold(6)))
      .toEqual([{ node: 'rich' }])
    expect(distribute(node([route('poor', { ref: 'stat_gold', comparator: 'lessthan', value: 5 })]), gold(4)))
      .toEqual([{ node: 'poor' }])
    expect(distribute(node([route('none', { ref: 'stat_gold', comparator: 'equalto', value: 0 })]), player()))
      .toEqual([{ node: 'none' }])
    expect(distribute(node([route('key', { ref: 'condition_key', value: 1 })]), player({ conditions: ['condition_key'] })))
      .toEqual([{ node: 'key' }])
    expect(distribute(node([route('nokey', { ref: 'condition_key', value: 0 })]), player()))
      .toEqual([{ node: 'nokey' }])
  })

  it('requires every rule of a route and keeps the route order, with the fallback last', () => {
    const both = route('both', { ref: 'stat_gold', comparator: 'morethan', value: 5 }, { ref: 'condition_key', value: 1 })
    const goldOnly = route('gold', { ref: 'stat_gold', comparator: 'morethan', value: 5 })
    const keyed = player({ stats: { stat_gold: 10 }, conditions: ['condition_key'] })
    expect(distribute(node([both, goldOnly], 'fallback'), gold(10))).toEqual([{ node: 'gold' }])
    expect(distribute(node([both, goldOnly], 'fallback'), keyed)).toEqual([{ node: 'both' }])
    expect(distribute(node([goldOnly, both], 'fallback'), keyed)).toEqual([{ node: 'gold' }])
    expect(distribute(node([both, goldOnly], 'fallback'), gold(1))).toEqual([{ node: 'fallback' }])
  })

  it('returns nothing without a matching route or fallback, and ignores empty or unknown rules', () => {
    expect(distribute(node([]), player())).toEqual([])
    expect(distribute(node([route('x'), route('y', { ref: 'property_x', value: 1 })]), player())).toEqual([])
  })
})

describe('applyEvents', () => {
  it('adds, increments and removes stats, keeping fractions', () => {
    expect(applyEvents(player(), [stat('gold', '1.5')]).player.stats).toEqual({ gold: 1.5 })
    expect(applyEvents(player({ stats: { gold: 4 } }), [stat('gold', '2')]).player.stats).toEqual({ gold: 6 })
    expect(applyEvents(player({ stats: { gold: 5 } }), [stat('gold', '-5')]).player.stats).toEqual({})
    expect(applyEvents(player({ stats: { gold: 5 } }), [stat('gold', 'x')]).player.stats).toEqual({ gold: 5 })
  })

  it('adds conditions once and removes only the targeted one', () => {
    expect(applyEvents(player({ conditions: ['key'] }), [condition('key', '1')]).player.conditions).toEqual(['key'])
    expect(applyEvents(player({ conditions: ['key', 'other'] }), [condition('key', '0'), condition('missing', '0')]).player.conditions)
      .toEqual(['other'])
  })

  it('stores property values', () => {
    const event: StoryEvent = { action: 'alterProperty', type: 'property', target: 'property_name', amount: '', property: 'Ada' }
    expect(applyEvents(player(), [event]).player.properties).toEqual({ property_name: 'Ada' })
  })

  it('reports changes and never mutates the given state', () => {
    const before = player({ stats: { gold: 1 } })
    const { changes } = applyEvents(before, [stat('gold', '2'), condition('key', '1')])
    expect(before).toEqual(player({ stats: { gold: 1 } }))
    expect(changes).toEqual([
      { type: 'stat', ref: 'gold', before: 1, after: 3 },
      { type: 'condition', ref: 'key', before: false, after: true },
    ])
  })
})
