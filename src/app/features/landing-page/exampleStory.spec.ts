import { join } from 'src/app/core/interfaces/interfaces'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { GameEngineService } from '../playground/services/game-engine.service'
import { PlayerService } from '../playground/services/player.service'
import { buildExampleStory, EXAMPLE_STORY_COPY } from './exampleStory'

describe('The Last Threshold demo', () => {
  for (const [lang, copy] of Object.entries(EXAMPLE_STORY_COPY)) {
    it(`finishes every available ${lang} path in four short rich-text scenes without dead ends or unresolved variables`, () => {
      const exampleStory = buildExampleStory(copy)
      const story = new ActiveStoryService()
      const player = new PlayerService()
      const engine = new GameEngineService(player, story)
      story.load('', copy.title, exampleStory)
      const reached = new Set<string>()
      const endings = new Set<string>()

      const visit = (joins: join[], scenes: number, depth: number, words: number) => {
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
            visit(engine.distributeNode(activeNode), scenes, depth + 1, words)
          } else {
            engine.filterAvailableAnswers(activeNode)
            const rendered = engine.interpolateNodeTexts(activeNode)
            const document = new DOMParser().parseFromString(rendered.text, 'text/html')
            const text = document.body.textContent ?? ''
            const totalWords = words + text.trim().split(/\s+/).length
            expect(document.querySelectorAll('p').length).toBeGreaterThanOrEqual(2)
            expect(document.querySelectorAll('strong, em').length).toBeGreaterThan(0)
            expect(document.querySelectorAll('[data-trama-variable]').length).toBe(0)
            expect(rendered.text).not.toMatch(/#(?:property|stat|condition)_/)
            expect(rendered.text).not.toContain(' -')
            if (activeNode.id === 'node_8' || activeNode.id === 'node_9' || activeNode.id === 'node_10') {
              expect(text).toContain(player.playerProperties()['property_title'])
            }
            if (activeNode.type === 'end') {
              expect(scenes + 1).toBe(4)
              expect(totalWords).toBeLessThanOrEqual(240)
              if (activeNode.id !== 'node_14') {
                expect(text).toContain(player.playerProperties()['property_deed'])
              }
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
                visit(answer.join ?? [], scenes + 1, depth + 1, totalWords)
              }
            }
          }
          player.playerProperties.set(properties)
          player.playerStats.set(stats)
          player.playerConditions.set(conditions)
        }
      }

      visit([{ node: 'node_0' }], 0, 0, 0)
      expect(exampleStory.nodes.length).toBe(12)
      expect(reached.size).toBe(exampleStory.nodes.length)
      expect(endings.size).toBe(3)
    })

    it(`remembers each ${lang} obstacle choice before the encounter`, () => {
      const routes = [
        { path: 0, choice: 0, encounter: 'node_8', condition: 'condition_spirit' },
        { path: 0, choice: 1, encounter: 'node_10', condition: undefined },
        { path: 1, choice: 0, encounter: 'node_9', condition: 'condition_sigil' },
        { path: 1, choice: 1, encounter: 'node_8', condition: 'condition_spirit' },
        { path: 2, choice: 0, encounter: 'node_9', condition: 'condition_sigil' },
        { path: 2, choice: 1, encounter: 'node_10', condition: undefined },
      ]
      for (const route of routes) {
        const story = new ActiveStoryService()
        const player = new PlayerService()
        const engine = new GameEngineService(player, story)
        story.load('', copy.title, buildExampleStory(copy))
        const entry = engine.buildNextNodeFromJoin({ node: 'node_0' })
        const path = entry.answers?.[route.path]
        engine.applyEvents(path?.events ?? [])
        const obstacle = engine.buildNextNodeFromJoin(path?.join?.[0] ?? { node: '' })
        const choice = obstacle.answers?.[route.choice]
        engine.applyEvents(choice?.events ?? [])
        const distributor = engine.buildNextNodeFromJoin(choice?.join?.[0] ?? { node: '' })

        expect(distributor.type).toBe('distributor')
        expect(player.playerConditions().map(condition => condition.id)).toEqual(
          route.condition ? [route.condition] : []
        )
        expect(engine.distributeNode(distributor)).toEqual([{ node: route.encounter }])
      }
    })
  }
})
