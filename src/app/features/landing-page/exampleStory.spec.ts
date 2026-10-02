import { join } from 'src/app/core/interfaces/interfaces'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { GameEngineService } from '../playground/services/game-engine.service'
import { PlayerService } from '../playground/services/player.service'
import { buildExampleStory, EXAMPLE_STORY_COPY } from './exampleStory'

describe('The Last Threshold demo', () => {
  for (const [lang, copy] of Object.entries(EXAMPLE_STORY_COPY)) {
    it(`finishes every available ${lang} path in five scenes without dead ends or unresolved variables`, () => {
      const exampleStory = buildExampleStory(copy)
      const story = new ActiveStoryService()
      const player = new PlayerService()
      const engine = new GameEngineService(player, story)
      story.load('', copy.title, exampleStory)
      const reached = new Set<string>()
      const endings = new Set<string>()

      const visit = (joins: join[], scenes: number, depth: number) => {
        // A broken join or cycle must fail rather than hang the test.
        if (!joins.length || depth > exampleStory.nodes.length) {
          throw new Error('The demo has a dead end or a cycle')
        }
        for (const next of joins) {
          const properties = structuredClone(player.playerProperties())
          const stats = structuredClone(player.playerStats())
          const conditions = structuredClone(player.playerConditions())
          const activeNode = engine.buildNextNodeFromJoin(next)
          reached.add(activeNode.id)
          engine.applyEvents(activeNode.events ?? [])

          if (activeNode.type === 'distributor') {
            visit(engine.distributeNode(activeNode), scenes, depth + 1)
          } else {
            engine.filterAvailableAnswers(activeNode)
            const rendered = engine.interpolateNodeTexts(activeNode)
            expect(rendered.text).not.toMatch(/#(?:property|stat|condition)_/)
            expect(rendered.text).not.toContain(' -')
            if (activeNode.type === 'end') {
              expect(scenes + 1).toBe(5)
              endings.add(activeNode.id)
            } else {
              expect(rendered.answers.length).toBeGreaterThan(0)
              expect(rendered.answers.length).toBeLessThanOrEqual(3)
              const answerState = {
                properties: structuredClone(player.playerProperties()),
                stats: structuredClone(player.playerStats()),
                conditions: structuredClone(player.playerConditions()),
              }
              for (const answer of rendered.answers) {
                player.playerProperties.set(
                  structuredClone(answerState.properties)
                )
                player.playerStats.set(structuredClone(answerState.stats))
                player.playerConditions.set(
                  structuredClone(answerState.conditions)
                )
                engine.applyEvents(answer.events ?? [])
                visit(answer.join ?? [], scenes + 1, depth + 1)
              }
            }
          }
          player.playerProperties.set(properties)
          player.playerStats.set(stats)
          player.playerConditions.set(conditions)
        }
      }

      visit([{ node: 'node_0' }], 0, 0)
      expect(exampleStory.nodes.length).toBe(15)
      expect(reached.size).toBe(exampleStory.nodes.length)
      expect(endings.size).toBe(3)
    })
  }
})
