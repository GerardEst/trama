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

  const activeStoryStub = {
    entireTree: () => tree,
  }

  beforeEach(() => {
    tree = { nodes: [], refs: {}, categories: [] }

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

    it('returns one of the available joins', () => {
      const joins = [{ node: 'node_1' }, { node: 'node_2' }]

      expect(joins).toContain(engine.getRandomJoin(joins))
    })

    it('throws when there are no joins to choose from', () => {
      expect(() => engine.getRandomJoin([])).toThrow(
        new Error('Impossible to get a random join')
      )
    })
  })

  describe('buildNextNodeFromJoin', () => {
    const answer = (
      id: string,
      text: string,
      requirements: answer_requirement[] = []
    ) => ({
      id,
      text,
      requirements,
      events: [],
      join: [],
    })

    it('builds a playable node without mutating the stored story', () => {
      player.playerProperties.set({ name: 'Ada' })
      player.playerStats.set([{ id: 'gold', amount: 5 }])
      tree.nodes = [
        {
          id: 'node_1',
          top: '10',
          left: '20',
          type: 'content',
          text: 'Hello #name',
          answers: [
            answer('available', 'Spend #gold', [statRequirement('gold', 5)]),
            answer('locked', 'Need a key', [conditionRequirement('hasKey', 1)]),
          ],
        },
      ]
      const storedNode = structuredClone(tree.nodes[0])

      const playable = engine.buildNextNodeFromJoin({
        node: 'node_1',
        toAnswer: true,
      })
      engine.filterAvailableAnswers(playable)
      const result: any = engine.interpolateNodeTexts(playable)

      expect(result).toEqual(
        jasmine.objectContaining({
          id: 'node_1',
          text: 'Hello Ada',
          jumpToAnswers: true,
        })
      )
      expect(result.answers.map((item: any) => item.id)).toEqual(['available'])
      expect(result.answers[0].text).toBe('Spend 5')
      expect(typeof result.key).toBe('number')
      expect(tree.nodes[0]).toEqual(storedNode)
      expect(result).not.toBe(tree.nodes[0])
    })

    it('throws when the joined node does not exist', () => {
      expect(() =>
        engine.buildNextNodeFromJoin({ node: 'missing-node' })
      ).toThrowError('Next node not found')
    })
  })

  describe('playerHasAnswerRequirements', () => {
    it('passes when there are no requirements', () => {
      expect(engine.playerHasAnswerRequirements({}, [], [], [])).toBe(true)
    })

    it('passes a stat requirement when the player has enough', () => {
      const result = engine.playerHasAnswerRequirements(
        {},
        [{ id: 'gold', amount: 10 }],
        [],
        [statRequirement('gold', 5)]
      )
      expect(result).toBe(true)
    })

    it('fails a stat requirement when the amount is below the threshold', () => {
      const result = engine.playerHasAnswerRequirements(
        {},
        [{ id: 'gold', amount: 3 }],
        [],
        [statRequirement('gold', 5)]
      )
      expect(result).toBe(false)
    })

    it('accepts a zero threshold when the player has no stat', () => {
      expect(
        engine.playerHasAnswerRequirements(
          {},
          [],
          [],
          [statRequirement('gold', 0)]
        )
      ).toBe(true)
    })

    it('rejects an invalid threshold rather than unlocking an answer', () => {
      expect(
        engine.playerHasAnswerRequirements(
          {},
          [],
          [],
          [statRequirement('gold', NaN)]
        )
      ).toBe(false)
    })

    it('fails a stat requirement when the player lacks the stat', () => {
      const result = engine.playerHasAnswerRequirements(
        {},
        [{ id: 'silver', amount: 10 }],
        [],
        [statRequirement('gold', 5)]
      )
      expect(result).toBe(false)
    })

    it('supports the id field used by legacy stat requirements', () => {
      const result = engine.playerHasAnswerRequirements(
        {},
        [{ id: 'stat_4', amount: 1 }],
        [],
        [{ id: 'stat_4', type: 'stat', amount: 1 }]
      )
      expect(result).toBe(true)
    })

    it('checks the required stat without rejecting unrelated lower stats', () => {
      const result = engine.playerHasAnswerRequirements(
        {},
        [
          { id: 'gold', amount: 10 },
          { id: 'health', amount: 1 },
        ],
        [],
        [statRequirement('gold', 5)]
      )
      expect(result).toBe(true)
    })

    it('passes a required condition the player holds', () => {
      const result = engine.playerHasAnswerRequirements(
        {},
        [],
        [{ id: 'hasKey' }],
        [conditionRequirement('hasKey', 1)]
      )
      expect(result).toBe(true)
    })

    it('fails a required condition the player does not hold', () => {
      const result = engine.playerHasAnswerRequirements(
        {},
        [],
        [],
        [conditionRequirement('hasKey', 1)]
      )
      expect(result).toBe(false)
    })

    it('supports the id field used by legacy condition requirements', () => {
      const result = engine.playerHasAnswerRequirements(
        {},
        [],
        [{ id: 'hasKey' }],
        [{ id: 'hasKey', type: 'condition', amount: 1 }]
      )
      expect(result).toBe(true)
    })

    it('fails a "must not have" condition the player holds', () => {
      const result = engine.playerHasAnswerRequirements(
        {},
        [],
        [{ id: 'hasKey' }],
        [conditionRequirement('hasKey', 0)]
      )
      expect(result).toBe(false)
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

    it('requires every rule in a route and tries the next route in order', () => {
      player.playerStats.set([{ id: 'stat_gold', amount: 10 }])
      const nextJoin = [{ node: 'node_second' }]

      const result = engine.distributeNode(
        distributor({
          conditions: [
            {
              id: 'condition_1_0',
              join: [{ node: 'node_first' }],
              rules: [
                { ref: 'stat_gold', comparator: 'morethan', value: 5 },
                { ref: 'condition_key', comparator: 'equalto', value: 1 },
              ],
            },
            {
              id: 'condition_1_1',
              ref: 'stat_gold',
              comparator: 'morethan',
              value: 5,
              join: nextJoin,
            },
          ],
        })
      )

      expect(result).toBe(nextJoin)
    })

    it('selects the first route when all of its rules match', () => {
      player.playerStats.set([{ id: 'stat_gold', amount: 10 }])
      player.playerConditions.set([{ id: 'condition_key' }])
      const firstJoin = [{ node: 'node_first' }]

      const result = engine.distributeNode(
        distributor({
          conditions: [
            {
              id: 'condition_1_0',
              join: firstJoin,
              rules: [
                { ref: 'stat_gold', comparator: 'morethan', value: 5 },
                { ref: 'condition_key', comparator: 'equalto', value: 1 },
              ],
            },
            {
              id: 'condition_1_1',
              ref: 'stat_gold',
              comparator: 'morethan',
              value: 5,
              join: [{ node: 'node_second' }],
            },
          ],
        })
      )

      expect(result).toBe(firstJoin)
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

    it('preserves fractional stat amounts accepted by the editor', () => {
      engine.applyEvents([statEvent('gold', '1.5')])
      expect(player.playerStats()).toEqual([{ id: 'gold', amount: 1.5 }])
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

    it('removes a condition at index zero without removing an unrelated one', () => {
      player.playerConditions.set([{ id: 'hasKey' }, { id: 'other' }])
      engine.applyEvents([conditionEvent('hasKey', '0')])
      expect(player.playerConditions()).toEqual([{ id: 'other' }])
      engine.applyEvents([conditionEvent('missing', '0')])
      expect(player.playerConditions()).toEqual([{ id: 'other' }])
    })

    it('applies property events, including ones saved with the legacy action', () => {
      engine.applyEvents([
        {
          id: 'event_1',
          target: 'property_name',
          type: 'property',
          amount: '',
          property: 'Ada',
          action: 'alterCondition',
        },
      ])
      expect(player.playerProperties()).toEqual({ property_name: 'Ada' })
    })

    it('checks answers against node events after they are applied', () => {
      const storyNode: node = {
        id: 'node_1',
        type: 'content',
        top: 0,
        left: 0,
        events: [conditionEvent('hasKey', '1')],
        answers: [
          { id: 'yes', requirements: [conditionRequirement('hasKey', 1)] },
          { id: 'no', requirements: [conditionRequirement('hasKey', 0)] },
        ],
      }
      tree.nodes = [storyNode]
      const playable = engine.buildNextNodeFromJoin({ node: 'node_1' })
      engine.applyEvents(playable.events ?? [])
      engine.filterAvailableAnswers(playable)
      expect(playable.answers?.map((answer) => answer.id)).toEqual(['yes'])
      expect(
        engine.interpolateNodeTexts({ ...playable, text: '#hasKey' }).text
      ).toBe('true')
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
      tree.refs = {
        stat_gold: { name: 'gold', type: 'stat', category: 'inventory' },
      }
      player.playerStats.set([{ id: 'stat_gold', amount: 9 }])
      expect(engine.getTextWithFinalParameters('[inventory]')).toContain(
        'Gold: 9'
      )
    })
  })
})
