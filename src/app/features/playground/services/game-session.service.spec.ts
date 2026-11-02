import { TestBed } from '@angular/core/testing'
import { node } from 'src/app/core/interfaces/interfaces'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { GameSessionService } from './game-session.service'

const scene = (id: string, overrides: Partial<node> = {}): node => ({
  id, type: 'content', top: 0, left: 0, text: id, ...overrides,
})
const gold = (amount: string) => ({
  id: 'gold', action: 'alterStat' as const, type: 'stat' as const, target: 'stat_gold', amount,
})

describe('GameSessionService', () => {
  let session: GameSessionService
  let story: ActiveStoryService

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [GameSessionService] })
    story = TestBed.inject(ActiveStoryService)
    session = TestBed.inject(GameSessionService)
  })

  function load(nodes: node[], id = 'story') {
    story.load(id, 'Story', { nodes, entryPoint: { left: 0, top: 0, targetNodeId: nodes[0]?.id } })
    TestBed.flushEffects()
  }

  function edit(mutate: Parameters<ActiveStoryService['updateTree']>[0]) {
    story.updateTree(mutate)
    TestBed.flushEffects()
  }

  const stats = () => session.player().stats

  it('starts and restarts at the configured destination, including inside a group, without visiting the marker', () => {
    story.load('story', 'Story', {
      nodes: [scene('node_0'), scene('node_1', { groupId: 'node_2', events: [gold('3')] }), scene('node_2', { type: 'group' })],
      entryPoint: { left: 0, top: 0, targetNodeId: 'node_1' },
    })
    TestBed.flushEffects()
    expect(session.currentNodeId()).toBe('node_1')
    expect(session.visits().map(visit => visit.nodeId)).toEqual(['node_1'])
    expect(stats()).toEqual({ stat_gold: 3 })
    edit(draft => { draft.entryPoint!.targetNodeId = 'node_0' })
    expect(session.currentNodeId()).toBe('node_1')
    session.restart()
    expect(session.currentNodeId()).toBe('node_0')
    expect(stats()).toEqual({})
  })

  it('does not fall back to node_0 when disconnected and recovers when connected', () => {
    story.load('story', 'Story', { nodes: [scene('node_0'), scene('node_1')], entryPoint: { left: 0, top: 0 } })
    TestBed.flushEffects()
    expect(session.problem()).toBe('missingStart')
    expect(session.visits()).toEqual([])
    session.restart()
    expect(session.problem()).toBe('missingStart')
    edit(draft => { draft.entryPoint!.targetNodeId = 'node_1' })
    expect(session.problem()).toBeNull()
    expect(session.currentNodeId()).toBe('node_1')
    edit(draft => { delete draft.entryPoint!.targetNodeId })
    expect(session.currentNodeId()).toBe('node_1')
    session.restart()
    expect(session.problem()).toBe('missingStart')
    expect(session.visits()).toEqual([])
  })

  it('rejects locked answer selection without applying events or navigating', () => {
    load([
      scene('node_0', { answers: [{ id: 'locked', text: 'Buy',
        unavailableAnswerDisplay: 'locked', requirements: [{ target: 'stat_gold', type: 'stat', amount: 3 }],
        events: [gold('10')], join: [{ node: 'node_1' }],
      }] }), scene('node_1'),
    ])
    session.selectAnswer('locked')
    expect(session.currentNodeId()).toBe('node_0')
    expect(stats()).toEqual({})
    expect(session.visits()).toHaveSize(1)
  })

  it('also initializes anonymous stories', () => {
    load([scene('node_0')], '')
    expect(session.currentNodeId()).toBe('node_0')
  })

  it('reports invalid entry destinations rather than executing groups or falling back', () => {
    for (const targetNodeId of ['missing', 'node_2']) {
      story.load(targetNodeId, 'Story', {
        nodes: [scene('node_0'), scene('node_2', { type: 'group' })],
        entryPoint: { left: 0, top: 0, targetNodeId },
      })
      TestBed.flushEffects()
      expect(session.problem()).toBe('missingStart')
      expect(session.visits()).toEqual([])
    }
  })

  it('restores arrival state without repeating node or answer events and discards the old branch', () => {
    load([
      scene('node_0', { events: [gold('2')], answers: [
        { id: 'a', events: [gold('-1')], join: [{ node: 'node_1' }] },
        { id: 'b', join: [{ node: 'node_2' }] },
      ] }),
      scene('node_1', { events: [gold('5')] }), scene('node_2'),
    ])
    session.selectAnswer('a')
    expect(stats()).toEqual({ stat_gold: 6 })
    session.back()
    expect(stats()).toEqual({ stat_gold: 2 })
    session.selectAnswer('b')
    expect(session.visits().map(visit => visit.nodeId)).toEqual(['node_0', 'node_2'])
    expect(stats()).toEqual({ stat_gold: 2 })
  })

  it('restores free-text properties and conditions, including an input checkpoint', () => {
    load([
      scene('node_0', { type: 'text', userTextOptions: { property: 'name' }, join: [{ node: 'node_1' }] }),
      scene('node_1', { events: [{ id: 'key', action: 'alterCondition', type: 'condition', target: 'condition_key', amount: '1' }] }),
    ])
    session.continueFlow('Ada')
    expect(session.player().properties).toEqual({ name: 'Ada' })
    expect(session.player().conditions).toEqual(['condition_key'])
    session.back()
    expect(session.player().properties).toEqual({})
    expect(session.player().conditions).toEqual([])
  })

  it('keeps the current state after editing events, requirements and a previously followed connection', () => {
    load([scene('node_0', { answers: [{ id: 'a', join: [{ node: 'node_1' }] }] }), scene('node_1', { events: [gold('1')] })])
    session.selectAnswer('a')
    edit(draft => {
      draft.nodes[1].events = [gold('99')]
      draft.nodes[0].answers = []
    })
    expect(session.currentNodeId()).toBe('node_1')
    expect(session.visits()).toHaveSize(2)
    expect(stats()).toEqual({ stat_gold: 1 })
    session.back()
    expect(session.currentNodeId()).toBe('node_0')
  })

  it('selects answers added after arriving at the node', () => {
    load([scene('node_0'), scene('node_1')])
    edit(draft => { draft.nodes[0].answers = [{ id: 'new', text: 'New', join: [{ node: 'node_1' }] }] })
    session.selectAnswer('new')
    expect(session.currentNodeId()).toBe('node_1')
  })

  it('rewinds to the last existing node when the current node is removed', () => {
    load([
      scene('node_0', { answers: [{ id: 'a', join: [{ node: 'node_1' }] }] }),
      scene('node_1', { answers: [{ id: 'b', join: [{ node: 'node_2' }] }], events: [gold('1')] }),
      scene('node_2', { events: [gold('5')] }),
    ])
    session.selectAnswer('a')
    session.selectAnswer('b')
    edit(draft => { draft.nodes = draft.nodes.filter(storyNode => storyNode.id === 'node_0') })
    expect(session.currentNodeId()).toBe('node_0')
    expect(stats()).toEqual({})
  })

  it('cannot go back to visits whose node was removed', () => {
    load([
      scene('node_0', { answers: [{ id: 'a', join: [{ node: 'node_1' }] }] }),
      scene('node_1', { answers: [{ id: 'b', join: [{ node: 'node_2' }] }] }),
      scene('node_2'),
    ], 'removed')
    session.selectAnswer('a')
    session.selectAnswer('b')
    edit(draft => { draft.nodes = draft.nodes.filter(storyNode => storyNode.id !== 'node_1') })
    expect(session.canGoBack()).toBeTrue()
    session.back()
    expect(session.currentNodeId()).toBe('node_0')
    expect(session.canGoBack()).toBeFalse()
  })

  it('identifies repeated visits separately and does not reroll a random route on back', () => {
    const random = spyOn(Math, 'random').and.returnValue(0)
    load([scene('node_0', { answers: [{ id: 'a', join: [{ node: 'node_0' }, { node: 'node_1' }] }] }), scene('node_1')])
    session.selectAnswer('a')
    expect(session.visits()[0].id).not.toBe(session.visits()[1].id)
    const calls = random.calls.count()
    session.back()
    expect(random.calls.count()).toBe(calls)
    expect(session.currentNodeId()).toBe('node_0')
  })

  it('applies distributor events before selecting a route', () => {
    load([
      scene('node_0', { join: [{ node: 'node_1' }] }),
      scene('node_1', { type: 'distributor', events: [gold('2')],
        conditions: [{ id: 'r', rules: [{ ref: 'stat_gold', comparator: 'equalto', value: 2 }], join: [{ node: 'node_2' }] }],
        fallbackCondition: { id: 'fallback', join: [{ node: 'node_3' }] } }),
      scene('node_2', { type: 'end' }), scene('node_3'),
    ])
    expect(session.currentNodeId()).toBe('node_2')
    expect(session.visits().map(visit => visit.nodeId)).toEqual(['node_0', 'node_2'])
    session.back()
    expect(stats()).toEqual({})
  })

  it('stops at automatic joins while auto-advance is off and continues with the latest connection', () => {
    session.setAutoAdvance(false)
    load([scene('node_0', { join: [{ node: 'node_1' }], events: [gold('1')] }), scene('node_1'), scene('node_2')])
    expect(session.currentNodeId()).toBe('node_0')
    edit(draft => { draft.nodes[0].join = [{ node: 'node_2' }] })
    session.setAutoAdvance(true)
    expect(session.currentNodeId()).toBe('node_0')
    session.advance()
    expect(session.currentNodeId()).toBe('node_2')
    expect(session.visits().map(visit => visit.step)).toEqual([1, 1])
    expect(stats()).toEqual({ stat_gold: 1 })
  })

  it('clears player state on a story switch', () => {
    load([scene('node_0', { join: [{ node: 'node_1' }], events: [gold('5')] }), scene('node_1')])
    load([scene('node_0', { text: 'Other story' })], 'other')
    expect(session.visits()).toHaveSize(1)
    expect(session.visits()[0].scene.text).toBe('Other story')
    expect(stats()).toEqual({})
  })

  it('stops automatic cycles with a recoverable problem', () => {
    load([scene('node_0', { join: [{ node: 'node_0' }] })])
    expect(session.problem()).toBe('automaticLoop')
    expect(session.visits()).toHaveSize(256)
    session.back()
    expect(session.problem()).toBeNull()
  })

  it('handles dangling connections without losing the current node', () => {
    load([scene('node_0', { answers: [{ id: 'a', join: [{ node: 'missing' }] }] })])
    session.selectAnswer('a')
    expect(session.problem()).toBe('missingNode')
    expect(session.currentNodeId()).toBe('node_0')
  })
})
