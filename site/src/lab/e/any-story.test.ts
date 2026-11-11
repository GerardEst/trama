import { createGame, type StateChange } from '@trama-app/engine'
import { describe, expect, it } from 'vitest'
import { renderBook, renderGame, renderTerminal, viewOf, type AnyWords } from './any-render'
import { anyStory, KEY, TRUST } from './any-story'
import { eCopyFor } from './copy'

const LANGS = ['en', 'es', 'ca'] as const

function play(lang: (typeof LANGS)[number]) {
  const e = eCopyFor(lang)
  const story = anyStory(e)
  const words: AnyWords = { again: e.again, trust: e.anyTrust, key: e.anyKey, needs: e.anyNeeds, bookTrust: e.anyBookTrust, bookKey: e.anyBookKey }
  const game = createGame(story)
  let changes: StateChange[] = []
  game.subscribe(event => {
    if (event.type === 'change') changes.push(event.change)
  })
  game.start()
  return {
    e,
    words,
    game,
    choose(id: string) {
      changes = []
      game.choose(id)
      return viewOf(game.getState(), changes, story)
    },
    view: () => viewOf(game.getState(), changes, story),
  }
}

// What the example interfaces promise: the same story, and events each one can show.
describe.each(LANGS)('any interface in %s', lang => {
  it('the tower is locked until the stranger gives the key', () => {
    const story = play(lang)
    const tower = story.view().answers.find(answer => answer.id === 'tower')!
    expect(tower.locked).toBe(true)
    expect(tower.needs).toEqual([story.e.anyKey])

    const first = story.choose('help')
    expect(first.fresh).toBe(false)
    expect(first.changes).toEqual([{ ref: TRUST, name: story.e.anyTrust, type: 'stat', before: 0, after: 1 }])

    const second = story.choose('help')
    expect(second.page).toBe(story.e.anyGift)
    expect(second.changes.map(change => change.ref)).toEqual([TRUST, KEY])
    expect(second.hasKey).toBe(true)

    const back = story.choose('thank')
    expect(back.answers.map(answer => answer.id)).toEqual(['tower', 'leave'])
    expect(back.answers[0]!.locked).toBe(false)

    expect(story.choose('tower')).toMatchObject({ ended: true, page: story.e.anyTop })
  })

  it('each interface shows the same events its own way', () => {
    const story = play(lang)
    story.choose('help')
    const view = story.choose('help')
    expect(renderTerminal(view, story.words)).toContain(`${story.e.anyTrust} 1 → 2`)
    expect(renderBook(view, story.words)).toContain(story.e.anyBookKey)
    expect(renderGame(view, story.words)).toContain('ai-game-slot is-new')
  })

  it('locked answers cannot be chosen in any interface', () => {
    const story = play(lang)
    const view = story.view()
    for (const render of [renderTerminal, renderBook, renderGame]) {
      expect(render(view, story.words)).not.toContain('data-answer="tower"')
    }
  })
})
