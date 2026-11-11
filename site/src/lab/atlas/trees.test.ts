import { createGame, type GameState, type StoryTree } from '@trama-app/engine'
import { describe, expect, it, vi } from 'vitest'
import { atlasFor } from './index'
import { liveTree } from './trees'

vi.mock('astro:i18n', () => ({ getRelativeLocaleUrl: () => '/' }))

const LANGS = ['en', 'es', 'ca'] as const

function play(tree: StoryTree, options?: { random: () => number }) {
  let state!: GameState
  const game = createGame(tree, options)
  game.subscribe(event => {
    if (event.type === 'state') state = event.state
  })
  game.start()
  const visit = () => state.activeVisits[state.activeVisits.length - 1]!
  return {
    game,
    answers: () => visit().scene.answers,
    passage: () => visit().scene.text ?? '',
    type: () => visit().scene.type,
    choose: (id: string) => game.choose(id),
  }
}

// The promises the page makes about each example, in every language.
describe.each(LANGS)('live examples in %s', lang => {
  const live = atlasFor(lang).live

  it('scene: each answer leads to its own scene', () => {
    const story = play(liveTree('scene', lang))
    story.choose('river')
    expect(story.passage()).toContain(live.riverEnd)
  })

  it('connections: returning to the answers skips the passage', () => {
    const story = play(liveTree('connections', lang))
    expect(story.passage()).not.toBe('')
    story.choose('buy')
    expect(story.game.getState().player.stats['stat_lamps']).toBe(1)
    const last = story.game.getState().activeVisits.at(-1)!
    expect(last.scene.skipText).toBe(true)
    expect(last.scene.answers.map(answer => answer.id)).toEqual(['buy', 'leave'])
  })

  it('random: the same choice reaches either ending', () => {
    const low = play(liveTree('random', lang), { random: () => 0 })
    low.choose('coin')
    const high = play(liveTree('random', lang), { random: () => 0.99 })
    high.choose('coin')
    expect(low.passage()).toContain(live.headsEnd)
    expect(high.passage()).toContain(live.tailsEnd)
  })

  it('events: choices change the state and the key is taken once', () => {
    const story = play(liveTree('events', lang))
    story.choose('help')
    story.choose('help')
    story.choose('key')
    const state = story.game.getState()
    expect(state.player.stats['stat_trust']).toBe(2)
    expect(state.player.conditions).toContain('condition_key')
    expect(story.answers().map(answer => answer.id)).not.toContain('key')
  })

  it('requirements: the door is locked, says why, and opens with the key', () => {
    const story = play(liveTree('requirements', lang))
    const locked = story.answers().find(answer => answer.id === 'open')!
    expect(locked.locked).toBe(true)
    expect(locked.display).toBe('requirements')
    story.choose('key')
    expect(story.answers().find(answer => answer.id === 'open')!.locked).toBe(false)
    story.choose('open')
    expect(story.passage()).toContain(live.doorEnd)
  })

  it('distributors: the past picks the ending, with no question', () => {
    const kind = play(liveTree('distributors', lang))
    kind.choose('help')
    expect(kind.passage()).toContain(live.guardOpen)
    const cold = play(liveTree('distributors', lang))
    cold.choose('ignore')
    expect(cold.passage()).toContain(live.guardShut)
  })

  it('input: what the reader types appears in the next scene', () => {
    const story = play(liveTree('input', lang))
    expect(story.type()).toBe('text')
    story.game.submitText('Morgan')
    expect(story.passage()).toContain('Morgan')
  })
})
