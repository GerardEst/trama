import { applyEvents, distribute, loadStory, PlayerState, renderScene, StoryJoin } from '@trama/engine'
import { buildExampleStory, EXAMPLE_STORY_COPY } from './exampleStory'

const emptyPlayer = (): PlayerState => ({ properties: {}, stats: {}, conditions: [] })

describe('The Last Threshold demo', () => {
  for (const [lang, copy] of Object.entries(EXAMPLE_STORY_COPY)) {
    it(`finishes every available ${lang} path in four short rich-text scenes without dead ends or unresolved variables`, () => {
      const exampleStory = buildExampleStory(copy)
      const story = loadStory(exampleStory)
      const reached = new Set<string>()
      const endings = new Set<string>()

      const visit = (joins: readonly StoryJoin[], scenes: number, depth: number, words: number, before: PlayerState) => {
        // A broken join or cycle must fail rather than hang the test.
        if (!joins.length || depth > exampleStory.nodes.length) {
          throw new Error('The demo has a dead end or a cycle')
        }
        for (const next of joins) {
          const activeNode = story.node(next.node)!
          reached.add(activeNode.id)
          const player = applyEvents(before, activeNode.events).player

          if (activeNode.type === 'distributor') {
            visit(distribute(activeNode, player), scenes, depth + 1, words, player)
          } else {
            const rendered = renderScene(story, activeNode.id, next, player)!
            const document = new DOMParser().parseFromString(rendered.text, 'text/html')
            const text = document.body.textContent ?? ''
            const totalWords = words + text.trim().split(/\s+/).length
            expect(document.querySelectorAll('p').length).toBeGreaterThanOrEqual(2)
            expect(document.querySelectorAll('strong, em').length).toBeGreaterThan(0)
            expect(document.querySelectorAll('[data-trama-variable]').length).toBe(0)
            expect(rendered.text).not.toMatch(/#(?:property|stat|condition)_/)
            expect(rendered.text).not.toContain(' -')
            if (activeNode.id === 'node_8' || activeNode.id === 'node_9' || activeNode.id === 'node_10') {
              expect(text).toContain(player.properties['property_title'])
            }
            if (activeNode.type === 'end') {
              expect(scenes + 1).toBe(4)
              expect(totalWords).toBeLessThanOrEqual(240)
              if (activeNode.id !== 'node_14') {
                expect(text).toContain(player.properties['property_deed'])
              }
              endings.add(activeNode.id)
            } else {
              expect(rendered.answers.length).toBeGreaterThan(0)
              expect(rendered.answers.length).toBeLessThanOrEqual(3)
              for (const answer of rendered.answers) {
                const source = activeNode.answers!.find(candidate => candidate.id === answer.id)!
                visit(source.join ?? [], scenes + 1, depth + 1, totalWords, applyEvents(player, source.events).player)
              }
            }
          }
        }
      }

      visit([{ node: 'node_0' }], 0, 0, 0, emptyPlayer())
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
        const story = loadStory(buildExampleStory(copy))
        let player = applyEvents(emptyPlayer(), story.node('node_0')!.events).player
        const path = story.node('node_0')!.answers?.[route.path]
        player = applyEvents(player, path?.events).player
        const obstacle = story.node(path?.join?.[0]?.node ?? '')!
        player = applyEvents(player, obstacle.events).player
        const choice = obstacle.answers?.[route.choice]
        player = applyEvents(player, choice?.events).player
        const distributor = story.node(choice?.join?.[0]?.node ?? '')!
        player = applyEvents(player, distributor.events).player

        expect(distributor.type).toBe('distributor')
        expect(player.conditions).toEqual(route.condition ? [route.condition] : [])
        expect(distribute(distributor, player)).toEqual([{ node: route.encounter }])
      }
    })
  }
})
