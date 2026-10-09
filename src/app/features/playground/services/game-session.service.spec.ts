import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing'
import { node } from 'src/app/core/interfaces/interfaces'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { GameEngineService } from './game-engine.service'
import { GameSessionService } from './game-session.service'
import { PlayerService } from './player.service'

const scene = (id: string, overrides: Partial<node> = {}): node => ({
  id, type: 'content', top: 0, left: 0, text: id, ...overrides,
})
const gold = (amount: string) => ({
  id: 'gold', action: 'alterStat' as const, type: 'stat' as const, target: 'stat_gold', amount,
})

describe('GameSessionService', () => {
  let session: GameSessionService
  let story: ActiveStoryService
  let player: PlayerService

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [GameSessionService, GameEngineService, PlayerService] })
    story = TestBed.inject(ActiveStoryService)
    player = TestBed.inject(PlayerService)
    session = TestBed.inject(GameSessionService)
  })

  function load(nodes: node[], id = 'story') {
    story.load(id, 'Story', { nodes })
    TestBed.flushEffects()
  }

  it('starts and restarts at the configured destination, including inside a group, without visiting the marker', () => {
    story.load('story', 'Story', {
      nodes: [scene('node_0'), scene('node_1', { groupId: 'node_2', events: [gold('3')] }), scene('node_2', { type: 'group' })],
      entryPoint: { left: 0, top: 0, targetNodeId: 'node_1' },
    })
    TestBed.flushEffects()
    expect(session.currentNodeId()).toBe('node_1')
    expect(session.visits().map(visit => visit.nodeId)).toEqual(['node_1'])
    expect(player.playerStats()).toEqual([{ id: 'stat_gold', amount: 3 }])
    story.updateTree(draft => { draft.entryPoint!.targetNodeId = 'node_0' })
    TestBed.flushEffects()
    expect(session.currentNodeId()).toBe('node_1')
    session.restart()
    expect(session.currentNodeId()).toBe('node_0')
    expect(player.playerStats()).toEqual([])
  })

  it('does not fall back to node_0 when disconnected and recovers when connected', () => {
    story.load('story', 'Story', { nodes: [scene('node_0'), scene('node_1')], entryPoint: { left: 0, top: 0 } })
    TestBed.flushEffects()
    expect(session.problem()).toBe('missingStart')
    expect(session.visits()).toEqual([])
    session.restart()
    expect(session.problem()).toBe('missingStart')
    story.updateTree(draft => { draft.entryPoint!.targetNodeId = 'node_1' })
    TestBed.flushEffects()
    expect(session.problem()).toBeNull()
    expect(session.currentNodeId()).toBe('node_1')
    story.updateTree(draft => { delete draft.entryPoint!.targetNodeId })
    TestBed.flushEffects()
    expect(session.currentNodeId()).toBe('node_1')
    session.restart()
    expect(session.problem()).toBe('missingStart')
    expect(session.visits()).toEqual([])
  })

  it('also initializes anonymous stories such as the landing demo', () => {
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
    session.selectAnswer(story.entireTree().nodes[0].answers![0])
    expect(player.playerStats()).toEqual([{ id: 'stat_gold', amount: 6 }])
    session.back()
    expect(player.playerStats()).toEqual([{ id: 'stat_gold', amount: 2 }])
    session.selectAnswer(story.entireTree().nodes[0].answers![1])
    expect(session.visits().map(visit => visit.nodeId)).toEqual(['node_0', 'node_2'])
    expect(player.playerStats()).toEqual([{ id: 'stat_gold', amount: 2 }])
  })

  it('restores free-text properties and conditions, including an input checkpoint', () => {
    load([
      scene('node_0', { type: 'text', userTextOptions: { property: 'name' }, join: [{ node: 'node_1' }] }),
      scene('node_1', { events: [{ id: 'key', action: 'alterCondition', type: 'condition', target: 'condition_key', amount: '1' }] }),
    ])
    session.continueFlow({ property: 'name', value: 'Ada', join: [{ node: 'node_1' }] })
    expect(player.playerProperties()).toEqual({ name: 'Ada' })
    expect(player.playerConditions()).toEqual([{ id: 'condition_key' }])
    session.back()
    expect(player.playerProperties()).toEqual({})
    expect(player.playerConditions()).toEqual([])
  })

  it('keeps the current state after editing events, requirements and a previously followed connection', () => {
    load([scene('node_0', { answers: [{ id: 'a', join: [{ node: 'node_1' }] }] }), scene('node_1', { events: [gold('1')] })])
    session.selectAnswer(story.entireTree().nodes[0].answers![0])
    story.updateTree(draft => {
      draft.nodes[1].events = [gold('99')]
      draft.nodes[0].answers = []
    })
    TestBed.flushEffects()
    expect(session.currentNodeId()).toBe('node_1')
    expect(session.visits()).toHaveSize(2)
    expect(player.playerStats()).toEqual([{ id: 'stat_gold', amount: 1 }])
    session.back()
    expect(session.currentNodeId()).toBe('node_0')
  })

  it('rewinds to the last existing node when the current node is removed', () => {
    load([
      scene('node_0', { answers: [{ id: 'a', join: [{ node: 'node_1' }] }] }),
      scene('node_1', { answers: [{ id: 'b', join: [{ node: 'node_2' }] }], events: [gold('1')] }),
      scene('node_2', { events: [gold('5')] }),
    ])
    session.selectAnswer(story.entireTree().nodes[0].answers![0])
    session.selectAnswer(story.entireTree().nodes[1].answers![0])
    story.updateTree(draft => { draft.nodes = draft.nodes.filter(node => node.id === 'node_0') })
    TestBed.flushEffects()
    expect(session.currentNodeId()).toBe('node_0')
    expect(player.playerStats()).toEqual([])
  })

  it('identifies repeated visits separately and does not reroll a random route on back', () => {
    const random = spyOn(Math, 'random').and.returnValue(0)
    load([scene('node_0', { answers: [{ id: 'a', join: [{ node: 'node_0' }, { node: 'node_1' }] }] }), scene('node_1')])
    session.selectAnswer(story.entireTree().nodes[0].answers![0])
    expect(session.visits()[0].id).not.toBe(session.visits()[1].id)
    const calls = random.calls.count()
    session.back()
    expect(random.calls.count()).toBe(calls)
    expect(session.currentNodeId()).toBe('node_0')
  })

  it('applies distributor events before selecting a route', fakeAsync(() => {
    load([
      scene('node_0', { join: [{ node: 'node_1' }] }),
      scene('node_1', { type: 'distributor', events: [gold('2')],
        conditions: [{ id: 'r', ref: 'stat_gold', comparator: 'equalto', value: 2, join: [{ node: 'node_2' }] }],
        fallbackCondition: { id: 'fallback', join: [{ node: 'node_3' }] } }),
      scene('node_2', { type: 'end' }), scene('node_3'),
    ])
    tick()
    expect(session.currentNodeId()).toBe('node_2')
    expect(session.activeNodes().map(node => node.id)).toEqual(['node_0', 'node_2'])
    session.back()
    expect(player.playerStats()).toEqual([])
    flush()
  }))

  it('cancels a scheduled automatic transition on back', fakeAsync(() => {
    load([scene('node_0', { answers: [{ id: 'a', join: [{ node: 'node_1' }] }] }),
      scene('node_1', { join: [{ node: 'node_2' }] }), scene('node_2')])
    session.selectAnswer(story.entireTree().nodes[0].answers![0])
    session.back()
    tick()
    expect(session.currentNodeId()).toBe('node_0')
    expect(session.cursor()).toBe(0)
  }))

  it('uses a changed automatic connection without replaying arrival events', fakeAsync(() => {
    load([scene('node_0', { join: [{ node: 'node_1' }], events: [gold('1')] }), scene('node_1'), scene('node_2')])
    story.updateTree(draft => { draft.nodes[0].join = [{ node: 'node_2' }] })
    TestBed.flushEffects()
    tick()
    expect(session.currentNodeId()).toBe('node_2')
    expect(player.playerStats()).toEqual([{ id: 'stat_gold', amount: 1 }])
  }))

  it('cancels old transitions and clears player state on a story switch', fakeAsync(() => {
    load([scene('node_0', { join: [{ node: 'node_1' }], events: [gold('5')] }), scene('node_1')])
    load([scene('node_0', { text: 'Other story' })], 'other')
    tick()
    expect(session.visits()).toHaveSize(1)
    expect(session.activeNodes()[0].text).toBe('Other story')
    expect(player.playerStats()).toEqual([])
  }))

  it('stops automatic cycles with a recoverable problem', fakeAsync(() => {
    load([scene('node_0', { join: [{ node: 'node_0' }] })])
    tick()
    expect(session.problem()).toBe('automaticLoop')
    expect(session.visits()).toHaveSize(256)
    session.back()
    expect(session.problem()).toBeNull()
  }))

  it('handles dangling connections without losing the current node', () => {
    load([scene('node_0', { answers: [{ id: 'a', join: [{ node: 'missing' }] }] })])
    session.selectAnswer(story.entireTree().nodes[0].answers![0])
    expect(session.problem()).toBe('missingNode')
    expect(session.currentNodeId()).toBe('node_0')
  })
})
