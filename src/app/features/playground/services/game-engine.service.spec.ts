import { TestBed } from '@angular/core/testing'
import { GameEngineService } from './game-engine.service'
import { PlayerService } from './player.service'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import {
  answer_requirement,
  event,
  node,
} from 'src/app/core/interfaces/interfaces'

// Minimal builders so the intent of each test reads clearly.
const statRequirement = (
  target: string,
  amount: number
): answer_requirement => ({ target, type: 'stat', amount })

const conditionRequirement = (
  target: string,
  amount: number
): answer_requirement => ({ target, type: 'condition', amount })

const statEvent = (target: string, amount: string): event => ({
  id: 'e',
  action: 'alterStat',
  type: 'stat',
  amount,
  target,
})

const conditionEvent = (target: string, amount: string): event => ({
  id: 'e',
  action: 'alterCondition',
  type: 'condition',
  amount,
  target,
})

describe('GameEngineService', () => {
  let engine: GameEngineService
  let player: PlayerService

  // Controllable stand-ins for the story state the engine reads.
  let tree: any
  let refs: any

  const activeStoryStub = {
    entireTree: () => tree,
    storyRefs: () => refs,
  }

  beforeEach(() => {
    tree = { nodes: [] }
    refs = []

    TestBed.configureTestingModule({
      providers: [
        GameEngineService,
        PlayerService,
        { provide: ActiveStoryService, useValue: activeStoryStub },
      ],
    })

    engine = TestBed.inject(GameEngineService)
    player = TestBed.inject(PlayerService)
  })

  it('is created', () => {
    expect(engine).toBeTruthy()
  })

  describe('getRandomJoin', () => {
    it('returns the only join available', () => {
      const join = { node: 'node_1' }
      expect(engine.getRandomJoin([join])).toBe(join)
    })

    it('throws when there are no joins to choose from', () => {
      expect(() => engine.getRandomJoin([])).toThrowError(
        'Impossible to get a random join'
      )
    })
  })

  describe('playerHasAnswerRequirements', () => {
    it('passes when there are no requirements', () => {
      expect(
        engine.playerHasAnswerRequirements({}, [], [], [])
      ).toBeTrue()
    })

    it('passes a stat requirement when the player has enough', () => {
      const result = engine.playerHasAnswerRequirements(
        {},
        [{ id: 'gold', amount: 10 }],
        [],
        [statRequirement('gold', 5)]
      )
      expect(result).toBeTrue()
    })

    it('fails a stat requirement when the amount is below the threshold', () => {
      const result = engine.playerHasAnswerRequirements(
        {},
        [{ id: 'gold', amount: 3 }],
        [],
        [statRequirement('gold', 5)]
      )
      expect(result).toBeFalse()
    })

    it('fails a stat requirement when the player lacks the stat', () => {
      const result = engine.playerHasAnswerRequirements(
        {},
        [{ id: 'silver', amount: 10 }],
        [],
        [statRequirement('gold', 5)]
      )
      expect(result).toBeFalse()
    })

    it('passes a required condition the player holds', () => {
      const result = engine.playerHasAnswerRequirements(
        {},
        [],
        [{ id: 'hasKey' }],
        [conditionRequirement('hasKey', 1)]
      )
      expect(result).toBeTrue()
    })

    it('fails a required condition the player does not hold', () => {
      const result = engine.playerHasAnswerRequirements(
        {},
        [],
        [],
        [conditionRequirement('hasKey', 1)]
      )
      expect(result).toBeFalse()
    })

    it('fails a "must not have" condition the player holds', () => {
      const result = engine.playerHasAnswerRequirements(
        {},
        [],
        [{ id: 'hasKey' }],
        [conditionRequirement('hasKey', 0)]
      )
      expect(result).toBeFalse()
    })
  })

  describe('distributeNode', () => {
    const distributor = (overrides: Partial<node>): node => ({
      id: 'node_1',
      top: '0',
      left: '0',
      type: 'distributor',
      ...overrides,
    })

    it('follows a stat condition whose "morethan" comparator is met', () => {
      player.playerStats.set([{ id: 'stat_gold', amount: 10 }])
      const matchJoin = [{ node: 'node_rich' }]

      const result = engine.distributeNode(
        distributor({
          conditions: [
            {
              id: 'c1',
              ref: 'stat_gold',
              comparator: 'morethan',
              value: 5,
              join: matchJoin,
            },
          ],
        })
      )

      expect(result).toBe(matchJoin)
    })

    it('follows a condition requirement (value 1) the player holds', () => {
      player.playerConditions.set([{ id: 'condition_door' }])
      const matchJoin = [{ node: 'node_open' }]

      const result = engine.distributeNode(
        distributor({
          conditions: [
            {
              id: 'c1',
              ref: 'condition_door',
              comparator: 'equalto',
              value: 1,
              join: matchJoin,
            },
          ],
        })
      )

      expect(result).toBe(matchJoin)
    })

    it('falls back when no condition is met', () => {
      player.playerStats.set([{ id: 'stat_gold', amount: 1 }])
      const fallbackJoin = [{ node: 'node_poor' }]

      const result = engine.distributeNode(
        distributor({
          conditions: [
            {
              id: 'c1',
              ref: 'stat_gold',
              comparator: 'morethan',
              value: 5,
              join: [{ node: 'node_rich' }],
            },
          ],
          fallbackCondition: { id: 'fb', join: fallbackJoin },
        })
      )

      expect(result).toBe(fallbackJoin)
    })

    it('returns an empty array when nothing matches and there is no fallback', () => {
      const result = engine.distributeNode(distributor({}))
      expect(result).toEqual([])
    })
  })

  describe('applyEvents and player state mutation', () => {
    it('adds a new stat the player did not have', () => {
      engine.applyEvents([statEvent('gold', '3')])
      expect(player.playerStats()).toEqual([{ id: 'gold', amount: 3 }])
    })

    it('increments an existing stat', () => {
      player.playerStats.set([{ id: 'gold', amount: 4 }])
      engine.applyEvents([statEvent('gold', '2')])
      expect(player.playerStats()).toEqual([{ id: 'gold', amount: 6 }])
    })

    it('removes a stat once it drops to zero or below', () => {
      player.playerStats.set([{ id: 'gold', amount: 5 }])
      engine.applyEvents([statEvent('gold', '-5')])
      expect(player.playerStats()).toEqual([])
    })

    it('adds a condition the player did not have', () => {
      engine.applyEvents([conditionEvent('hasKey', '1')])
      expect(player.playerConditions()).toEqual([{ id: 'hasKey' }])
    })

    it('does not duplicate an existing condition', () => {
      player.playerConditions.set([{ id: 'hasKey' }])
      engine.applyEvents([conditionEvent('hasKey', '1')])
      expect(player.playerConditions()).toEqual([{ id: 'hasKey' }])
    })

    it('sets a player property via alterProperty', () => {
      engine.alterProperty('name', 'Bob')
      expect(player.playerProperties()).toEqual({ name: 'Bob' })
    })
  })

  describe('getTextWithFinalParameters', () => {
    it('interpolates a player property by name', () => {
      player.playerProperties.set({ name: 'Bob' })
      expect(engine.getTextWithFinalParameters('Hi #name')).toBe('Hi Bob')
    })

    it('interpolates a player stat amount', () => {
      player.playerStats.set([{ id: 'gold', amount: 7 }])
      expect(engine.getTextWithFinalParameters('You have #gold')).toBe(
        'You have 7'
      )
    })

    it('renders a dash for an unknown token', () => {
      expect(engine.getTextWithFinalParameters('Value: #missing')).toBe(
        'Value: -'
      )
    })

    it('expands a category block from the story refs', () => {
      refs = [{ id: 'stat_gold', name: 'gold', category: 'inventory' }]
      player.playerStats.set([{ id: 'stat_gold', amount: 9 }])
      expect(engine.getTextWithFinalParameters('[inventory]')).toContain(
        'Gold: 9'
      )
    })
  })
})
