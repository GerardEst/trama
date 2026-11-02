import { describe, expect, it } from 'vitest'
import { createGame, GameEvent, loadStory, renderScene, restoreGame, StoryRequirement } from '../src'
import { token, tree } from './fixtures'

const texts = (game: ReturnType<typeof createGame>) => game.getState().activeVisits.map(visit => visit.scene.text)

describe('createGame', () => {
  it('waits for start and reports a missing start', () => {
    const game = createGame({ entryPoint: { left: 0 }, nodes: [{ id: 'node_0', type: 'content' }] })
    expect(game.getState().started).toBe(false)
    expect(game.start().problem).toBe('missingStart')
  })

  it('plays answers, applies their events and reaches the end', () => {
    const game = createGame(tree([
      { id: 'a', text: 'Start', answers: [{ id: 'go', text: 'Go', join: [{ node: 'b' }],
        events: [{ action: 'alterStat', type: 'stat', target: 'stat_gold', amount: '3' }] }] },
      { id: 'b', type: 'end', text: `Gold: ${token('stat', 'stat_gold')}` },
    ]))
    const events: GameEvent['type'][] = []
    game.subscribe(event => events.push(event.type))
    game.start()
    const state = game.choose('go')
    expect(state.ended).toBe(true)
    expect(state.player.stats).toEqual({ stat_gold: 3 })
    expect(state.current?.scene.text).toBe('Gold: 3')
    expect(state.previousVisits[0].selectedAnswerId).toBe('go')
    expect(events).toEqual(['node', 'state', 'change', 'answer', 'node', 'end', 'state'])
  })

  it('chains automatic joins and distributors into one step', () => {
    const game = createGame(tree([
      { id: 'a', text: 'One', join: [{ node: 'd' }],
        events: [{ action: 'alterCondition', type: 'condition', target: 'condition_lit', amount: '1' }] },
      { id: 'd', type: 'distributor', conditions: [
        { rules: [{ ref: 'condition_lit', value: 1 }, { ref: 'stat_x', comparator: 'lessthan', value: 1 }], join: [{ node: 'lit' }] },
      ], fallbackCondition: { join: [{ node: 'dark' }] } },
      { id: 'lit', text: 'Lit', answers: [] },
      { id: 'dark', text: 'Dark' },
    ]))
    game.start()
    expect(texts(game)).toEqual(['One', 'Lit'])
    expect(game.getState().activeVisits.map(visit => visit.step)).toEqual([1, 1])
  })

  it('uses the distributor fallback and stops at loops', () => {
    const fallback = createGame(tree([
      { id: 'd', type: 'distributor', conditions: [{ rules: [{ ref: 'stat_x', comparator: 'morethan', value: 0 }], join: [{ node: 'no' }] }],
        fallbackCondition: { join: [{ node: 'yes' }] } },
      { id: 'yes', text: 'Fallback' }, { id: 'no', text: 'Route' },
    ]))
    fallback.start()
    expect(texts(fallback)).toEqual(['Fallback'])

    const loop = createGame(tree([{ id: 'a', type: 'distributor', fallbackCondition: { join: [{ node: 'a' }] } }]))
    expect(loop.start().problem).toBe('automaticLoop')
  })

  it('reports joins to missing nodes', () => {
    const game = createGame(tree([{ id: 'a', answers: [{ id: 'x', text: 'X', join: [{ node: 'gone' }] }] }]))
    game.start()
    expect(game.choose('x').problem).toBe('missingNode')
  })

  it('picks random joins with the injected generator', () => {
    const story = tree([
      { id: 'a', join: [{ node: 'b' }, { node: 'c' }] }, { id: 'b', text: 'B' }, { id: 'c', text: 'C' },
    ])
    const low = createGame(story, { random: () => 0 })
    const high = createGame(story, { random: () => 0.99 })
    low.start()
    high.start()
    expect(texts(low).at(-1)).toBe('B')
    expect(texts(high).at(-1)).toBe('C')
  })

  it('asks for text input and stores it as a property', () => {
    const game = createGame(tree([
      { id: 'a', type: 'text', text: 'Name?', userTextOptions: { property: 'property_name' }, join: [{ node: 'b' }] },
      { id: 'b', type: 'end', text: `Bye ${token('property', 'property_name')}` },
    ]))
    const start = game.start()
    expect(start.current?.scene.input).toEqual({ property: 'property_name' })
    expect(start.activeVisits).toHaveLength(1)
    const state = game.submitText('Ada')
    expect(state.current?.scene.text).toBe('Bye Ada')
    expect(state.previousVisits[0].userResponse).toBe('Ada')
  })

  it('goes back restoring the player state without repeating events', () => {
    const game = createGame(tree([
      { id: 'a', answers: [{ id: 'buy', text: 'Buy', join: [{ node: 'b' }],
        events: [{ action: 'alterStat', type: 'stat', target: 'stat_gold', amount: '-5' }] }],
      events: [{ action: 'alterStat', type: 'stat', target: 'stat_gold', amount: '10' }] },
      { id: 'b', text: 'Bought' },
    ]))
    game.start()
    expect(game.choose('buy').player.stats).toEqual({ stat_gold: 5 })
    const back = game.back()
    expect(back.player.stats).toEqual({ stat_gold: 10 })
    expect(back.cursor).toBe(0)
    expect(back.visits).toHaveLength(2)
    expect(game.choose('buy').visits).toHaveLength(2)
  })

  it('saves and restores a playthrough', () => {
    const story = tree([
      { id: 'a', answers: [{ id: 'go', text: 'Go', join: [{ node: 'b' }] }] },
      { id: 'b', answers: [{ id: 'end', text: 'End', join: [{ node: 'c' }] }] },
      { id: 'c', type: 'end' },
    ])
    const game = createGame(story)
    game.start()
    game.choose('go')
    const restored = restoreGame(story, JSON.parse(JSON.stringify(game.save())))
    expect(restored.getState()).toEqual(game.getState())
    expect(restored.choose('end').ended).toBe(true)
  })

  it('does not let a state copy change the game', () => {
    const game = createGame(tree([{ id: 'a', text: 'A' }]))
    const state = game.start()
    state.player.stats['stat_gold'] = 99
    expect(game.getState().player.stats).toEqual({})
  })
})

describe('answers', () => {
  const needsKey: StoryRequirement = { target: 'condition_key', type: 'condition', amount: 1 }
  const needsGold: StoryRequirement = { target: 'stat_gold', type: 'stat', amount: 2 }
  const story = (display?: 'hidden' | 'locked' | 'requirements') => tree([{
    id: 'a', text: 'Doors', answers: [
      { id: 'open', text: '<p>Open</p>', join: [{ node: 'b' }] },
      { id: 'key', text: 'Use key', join: [{ node: 'b' }], requirements: [needsKey] },
      { id: 'pay', text: 'Pay', join: [{ node: 'b' }], requirements: [needsGold], unavailableAnswerDisplay: 'requirements' },
      { id: 'wip', text: 'Unfinished' },
      { id: 'empty', text: '<p></p>' },
    ],
  }, { id: 'b', text: 'Through' }], {
    refs: { stat_gold: { name: 'gold', type: 'stat' } },
    ...(display ? { unavailableAnswerDisplay: display } : {}),
  })

  it('hides locked answers by default, honours exceptions and drops empty placeholders', () => {
    const answers = createGame(story()).start().current!.scene.answers
    expect(answers.map(answer => answer.id)).toEqual(['open', 'pay', 'wip'])
    expect(answers[0].text).toBe('Open')
    expect(answers[1]).toMatchObject({ locked: true, display: 'requirements',
      missing: [{ ref: 'stat_gold', name: 'gold', type: 'stat', required: 2, current: 0 }] })
    expect(answers[2]).toMatchObject({ connected: false, locked: false })
  })

  it('shows locked answers when the story asks for it', () => {
    const answers = createGame(story('locked')).start().current!.scene.answers
    expect(answers.find(answer => answer.id === 'key')).toMatchObject({ locked: true, display: 'locked',
      missing: [{ ref: 'condition_key', name: undefined, type: 'condition', required: 1, current: 0 }] })
  })

  it('ignores locked, unconnected and unknown answers', () => {
    const game = createGame(story('locked'))
    game.start()
    for (const id of ['key', 'pay', 'wip', 'nope']) expect(game.choose(id).cursor).toBe(0)
    expect(game.choose('open').cursor).toBe(1)
  })

  it('skips the passage only when the target has answers', () => {
    const game = createGame(tree([
      { id: 'a', answers: [{ id: 'x', text: 'X', join: [{ node: 'b', toAnswer: true }] },
        { id: 'y', text: 'Y', join: [{ node: 'c', toAnswer: true }] }] },
      { id: 'b', text: 'B', answers: [{ id: 'z', text: 'Z', join: [{ node: 'a' }] }] },
      { id: 'c', text: 'C' },
    ]))
    game.start()
    expect(game.choose('x').current?.scene.skipText).toBe(true)
    game.back()
    expect(game.choose('y').current?.scene.skipText).toBe(false)
  })
})

describe('scenes', () => {
  it('drops disconnected placeholders, keeps unfinished answers with text and hides unmet disconnected ones', () => {
    const game = createGame(tree([{ id: 'a', join: [{ node: 'b' }, { node: 'b' }], answers: [
      { id: 'empty', text: '', join: [] }, { id: 'br', text: '<p><br></p>' }, { id: 'nbsp', text: '<p>&nbsp;</p>' },
      { id: 'named', text: '<p>ccc</p>' },
      { id: 'locked', text: 'Need a key', requirements: [{ target: 'condition_key', type: 'condition', amount: 1 }] },
    ] }, { id: 'b', text: 'B' }]), { autoAdvance: false })
    expect(game.start().current?.scene.answers.map(answer => answer.id)).toEqual(['named'])
  })

  it('checks answers after the arrival events and prepares answer HTML once', () => {
    const game = createGame(tree([{ id: 'a', text: token('condition', 'condition_key'),
      events: [{ action: 'alterCondition', type: 'condition', target: 'condition_key', amount: '1' }],
      answers: [
        { id: 'yes', text: '<p>Hi <span data-trama-variable="" data-kind="condition" data-key="condition_key">#k</span></p><p>Go</p>',
          join: [{ node: 'a' }], requirements: [{ target: 'condition_key', type: 'condition', amount: 1 }] },
        { id: 'no', text: 'No', join: [{ node: 'a' }], requirements: [{ target: 'condition_key', type: 'condition', amount: 0 }] },
      ] }]))
    const scene = game.start().current!.scene
    expect(scene.text).toBe('true')
    expect(scene.answers.map(answer => [answer.id, answer.text])).toEqual([['yes', 'Hi true<br>Go']])
  })

  it('renders a node for any state without moving the game', () => {
    const story = loadStory(tree([{ id: 'a', text: `Gold ${token('stat', 'stat_gold')}`, image: { path: 'x.png' } }]))
    const player = { properties: {}, stats: { stat_gold: 3 }, conditions: [] }
    expect(renderScene(story, 'a', { node: 'a' }, player, { imageUrl: path => `/img/${path}` }))
      .toMatchObject({ text: 'Gold 3', image: { path: 'x.png', url: '/img/x.png' } })
    expect(renderScene(story, 'missing', { node: 'missing' }, player)).toBeUndefined()
  })

  it('never enters groups, but enters nodes inside them', () => {
    const game = createGame(tree([
      { id: 'a', answers: [{ id: 'in', text: 'In', join: [{ node: 'inner' }] }, { id: 'g', text: 'G', join: [{ node: 'group' }] }] },
      { id: 'inner', text: 'Inner', groupId: 'group' }, { id: 'group', type: 'group' },
    ]))
    game.start()
    expect(game.choose('g').problem).toBe('missingNode')
    expect(game.choose('in').current?.nodeId).toBe('inner')
  })
})

describe('manual advance', () => {
  const chain = tree([
    { id: 'a', text: 'A', join: [{ node: 'b' }] },
    { id: 'b', text: 'B', join: [{ node: 'c' }] },
    { id: 'c', type: 'end', text: 'C' },
  ])

  it('stops at every node and advances within the same step', () => {
    const game = createGame(chain, { autoAdvance: false })
    expect(game.start().current?.nodeId).toBe('a')
    const state = game.advance()
    expect(state.current?.nodeId).toBe('b')
    expect(state.activeVisits.map(visit => visit.nodeId)).toEqual(['a', 'b'])
    expect(game.advance().ended).toBe(true)
    expect(game.advance().visits).toHaveLength(3)
  })

  it('applies a new setting to later moves only', () => {
    const game = createGame(chain, { autoAdvance: false })
    game.start()
    game.setAutoAdvance(true)
    expect(game.getState().current?.nodeId).toBe('a')
    expect(game.advance().current?.nodeId).toBe('c')
  })

  it('does not advance text nodes, which wait for input', () => {
    const game = createGame(tree([{ id: 'a', type: 'text', userTextOptions: { property: 'p' }, join: [{ node: 'b' }] }, { id: 'b' }]))
    game.start()
    expect(game.advance().cursor).toBe(0)
  })
})

describe('updateStory', () => {
  const nodes = [
    { id: 'a', answers: [{ id: 'go', text: 'Go', join: [{ node: 'b' }] }] },
    { id: 'b', answers: [{ id: 'on', text: 'On', join: [{ node: 'c' }] }],
      events: [{ action: 'alterStat' as const, type: 'stat' as const, target: 'stat_gold', amount: '1' }] },
    { id: 'c', events: [{ action: 'alterStat' as const, type: 'stat' as const, target: 'stat_gold', amount: '5' }] },
  ]

  it('keeps the playthrough and uses edited joins and answers from then on', () => {
    const game = createGame(tree(nodes))
    game.start()
    game.updateStory(tree([{ ...nodes[0], answers: [{ id: 'new', text: 'New', join: [{ node: 'c' }] }] }, nodes[1], nodes[2]]))
    expect(game.getState().visits).toHaveLength(1)
    const state = game.choose('new')
    expect(state.current?.nodeId).toBe('c')
    expect(state.player.stats).toEqual({ stat_gold: 5 })
  })

  it('does not replay events when arrival events change', () => {
    const game = createGame(tree(nodes))
    game.start()
    game.choose('go')
    game.updateStory(tree([nodes[0], { ...nodes[1], events: [] }, nodes[2]]))
    expect(game.getState().player.stats).toEqual({ stat_gold: 1 })
  })

  it('rewinds to the last existing visit when the current node is removed, or restarts', () => {
    const game = createGame(tree(nodes))
    game.start()
    game.choose('go')
    game.choose('on')
    const events: string[] = []
    game.subscribe(event => events.push(event.type))
    game.updateStory(tree([nodes[0], nodes[1]]))
    expect(game.getState()).toMatchObject({ cursor: 1, current: { nodeId: 'b' }, player: { stats: { stat_gold: 1 } } })
    expect(events).toEqual(['state'])
    game.updateStory(tree([{ id: 'z', text: 'Z' }]))
    expect(game.getState().current?.nodeId).toBe('z')
  })

  it('emits nothing while the current node still exists', () => {
    const game = createGame(tree(nodes))
    game.start()
    const events: string[] = []
    game.subscribe(event => events.push(event.type))
    game.updateStory(tree(nodes.map(node => ({ ...node, text: 'edited' }))))
    expect(events).toEqual([])
  })

  it('skips removed visits when going back', () => {
    const game = createGame(tree(nodes))
    game.start()
    game.choose('go')
    game.choose('on')
    game.updateStory(tree([nodes[0], nodes[2]]))
    const state = game.getState()
    expect(state.current?.nodeId).toBe('c')
    expect(state.canGoBack).toBe(true)
    expect(game.goTo(1).cursor).toBe(2)
    expect(game.back().current?.nodeId).toBe('a')
    expect(game.getState().canGoBack).toBe(false)
  })
})
