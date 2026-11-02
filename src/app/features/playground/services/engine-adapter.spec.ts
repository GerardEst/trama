import { TestBed } from '@angular/core/testing'
import { loadStory, renderScene, StoryRequirement, StoryTree } from '@trama/engine'
import { node } from 'src/app/core/interfaces/interfaces'
import { I18nService } from 'src/app/core/i18n/i18n.service'
import { sceneToPlayableNode } from './engine-adapter'

describe('sceneToPlayableNode', () => {
  let i18n: I18nService
  beforeEach(() => { i18n = TestBed.inject(I18nService) })

  const condition = (target: string, amount: number): StoryRequirement => ({ target, type: 'condition', amount })
  function render(storyTree: StoryTree, player = { properties: {}, stats: {}, conditions: [] as string[] }) {
    const story = loadStory(storyTree)
    const scene = renderScene(story, 'node_0', { node: 'node_0' }, player)!
    return sceneToPlayableNode(scene, story.node('node_0') as unknown as node, i18n, { key: 7 })
  }

  it('inherits the story display, supports exceptions and only explains unmet requirements', () => {
    const storyTree: StoryTree = {
      unavailableAnswerDisplay: 'requirements',
      refs: { gold: { name: 'Gold', type: 'stat' }, key: { name: 'Bronze key', type: 'condition' } },
      nodes: [{ id: 'node_0', type: 'content', answers: [
        { id: 'inherited', text: 'Enter', join: [{ node: 'node_0' }],
          requirements: [{ target: 'gold', type: 'stat', amount: 3 }, condition('key', 1)] },
        { id: 'hidden', text: 'Secret', unavailableAnswerDisplay: 'hidden', requirements: [condition('key', 1)] },
        { id: 'locked', text: 'Door', unavailableAnswerDisplay: 'locked', requirements: [condition('key', 1)] },
      ] }],
    }
    const locked = render(storyTree, { properties: {}, stats: { gold: 5 }, conditions: [] })
    expect(locked.key).toBe(7)
    expect(locked.answers?.map(answer => answer.id)).toEqual(['inherited', 'locked'])
    expect(locked.answers?.[0].locked).toBeTrue()
    expect(locked.answers?.[0].join).toEqual([{ node: 'node_0' }])
    expect(locked.answers?.[0].missingRequirements).toEqual(['Requires: Bronze key'])
    expect(locked.answers?.[1].missingRequirements).toEqual([])
    const unlocked = render(storyTree, { properties: {}, stats: { gold: 5 }, conditions: ['key'] })
    expect(unlocked.answers).toHaveSize(3)
    expect(unlocked.answers?.every(answer => !answer.locked && !answer.missingRequirements?.length)).toBeTrue()
  })

  it('explains stat and absent-condition requirements without leaking missing reference IDs', () => {
    const rendered = render({
      unavailableAnswerDisplay: 'requirements',
      refs: { gold: { name: 'Gold', type: 'stat' }, curse: { name: 'Curse', type: 'condition' } },
      nodes: [{ id: 'node_0', type: 'content', answers: [{ id: 'a', text: 'Go', requirements: [
        { target: 'gold', type: 'stat', amount: 3 }, condition('curse', 0), condition('secret_internal_id', 1),
      ] }] }],
    }, { properties: {}, stats: {}, conditions: ['curse'] })
    expect(rendered.answers?.[0].missingRequirements).toEqual([
      'Requires Gold: at least 3 (you have 0)', 'Requires not having: Curse', 'A requirement is not met',
    ])
  })

  it('keeps the authored node fields the views read and the jump to answers', () => {
    const story = loadStory({ nodes: [{ id: 'node_0', type: 'text', text: 'Name?', userTextOptions: { property: 'name' },
      join: [{ node: 'node_0' }], answers: [{ id: 'a', text: 'A', join: [{ node: 'node_0' }] }] }] })
    const scene = renderScene(story, 'node_0', { node: 'node_0', toAnswer: true }, { properties: {}, stats: {}, conditions: [] })!
    const playable = sceneToPlayableNode(scene, story.node('node_0') as unknown as node, i18n)
    expect(playable).toEqual(jasmine.objectContaining({
      id: 'node_0', type: 'text', userTextOptions: { property: 'name' }, join: [{ node: 'node_0' }], jumpToAnswers: true,
    }))
  })
})
