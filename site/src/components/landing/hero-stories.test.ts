import { createGame, type GameState, type StoryTree } from '@trama-app/engine'
import { describe, expect, it } from 'vitest'
import { heroStories, OPENING_STORY } from './hero-stories'

const LANGS = ['en', 'es', 'ca'] as const

/** Plays a story through the given answers and returns where it stopped. */
function play(tree: StoryTree, answers: string[]) {
  let state!: GameState
  const game = createGame(tree)
  game.subscribe(event => {
    if (event.type === 'state') state = event.state
  })
  game.start()
  for (const answer of answers) game.choose(answer)
  const visit = state.activeVisits.at(-1)!
  return { type: visit.scene.type, text: visit.scene.text ?? '', player: state.player }
}

const ending = (tree: StoryTree, id: string) => tree.nodes!.find(node => node.id === id)!.text!

describe.each(LANGS)('the hero stories in %s', lang => {
  const [threshold, lighthouse, oasis] = heroStories(lang)

  it('puts the example story first and opens on the dark lighthouse in the middle, each with its own landscape', () => {
    expect(threshold!.id).toBe('threshold')
    expect(lighthouse!.id).toBe(OPENING_STORY)
    expect(lighthouse!.scene).toBe('coast')
    expect(new Set(heroStories(lang).map(story => story.scene)).size).toBe(3)
  })

  it('lighthouse: every way of warning the ship reaches an ending', () => {
    const tree = lighthouse!.tree
    expect(play(tree, ['harbour', 'row']).text).toBe(ending(tree, 'rowed'))
    expect(play(tree, ['run', 'fire']).text).toBe(ending(tree, 'burned'))
    const lit = play(tree, ['harbour', 'together', 'oil', 'light'])
    expect(lit.type).toBe('end')
    expect(lit.text).toBe(ending(tree, 'lit'))
    expect(lit.player.stats['stat_companions']).toBe(1)
    expect(lit.player.conditions).toContain('condition_oil')
  })

  it('oasis: what the reader picked up decides the ending, with no question asked', () => {
    const tree = oasis!.tree
    expect(play(tree, ['steps', 'map']).text).toBe(ending(tree, 'tower'))
    expect(play(tree, ['stars', 'fill']).text).toBe(ending(tree, 'palms'))
    expect(play(tree, ['stars', 'onwards']).text).toBe(ending(tree, 'lost'))
    expect(play(tree, ['steps', 'leave']).text).toBe(ending(tree, 'lost'))
  })
})
