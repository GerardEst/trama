import { TestBed } from '@angular/core/testing'
import { DatabaseService } from 'src/app/core/services/database.service'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { StoryMutationService } from 'src/app/shared/services/story-mutation.service'
import { StoryEditorService } from './story-editor.service'

class DatabaseStub {
  saveTreeToDB = jasmine.createSpy('saveTreeToDB').and.resolveTo(true)
}

describe('StoryEditorService', () => {
  let activeStory: ActiveStoryService
  let editor: StoryEditorService

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ActiveStoryService,
        StoryMutationService,
        StoryEditorService,
        { provide: DatabaseService, useClass: DatabaseStub },
      ],
    })

    activeStory = TestBed.inject(ActiveStoryService)
    editor = TestBed.inject(StoryEditorService)
    activeStory.load('story-1', 'Story', {
      nodes: [
        {
          id: 'node_0',
          top: 0,
          left: 0,
          type: 'content',
          text: 'Before',
          join: [{ node: 'node_1' }],
          answers: [
            {
              id: 'answer_0_0',
              join: [{ node: 'node_1', toAnswer: true }],
            },
          ],
        },
        {
          id: 'node_1',
          top: 100,
          left: 100,
          type: 'end',
        },
      ],
    })
  })

  it('replaces the tree instead of mutating the current snapshot', () => {
    const previousTree = activeStory.entireTree()

    editor.updateNodeText('node_0', 'After')

    expect(previousTree.nodes[0].text).toBe('Before')
    expect(activeStory.entireTree()).not.toBe(previousTree)
    expect(activeStory.entireTree().nodes[0].text).toBe('After')
  })

  it('removes references to a deleted node from every join origin', () => {
    editor.removeNode('node_1')

    const remainingNode = activeStory.entireTree().nodes[0]
    expect(activeStory.entireTree().nodes.map((node) => node.id)).toEqual([
      'node_0',
    ])
    expect(remainingNode.join).toEqual([])
    expect(remainingNode.answers?.[0].join).toEqual([])
  })

  it('creates a missing fallback condition when joining from it', () => {
    activeStory.load('story-1', 'Story', {
      nodes: [
        {
          id: 'node_0',
          top: 0,
          left: 0,
          type: 'distributor',
        },
        {
          id: 'node_1',
          top: 100,
          left: 100,
          type: 'end',
        },
      ],
    })

    editor.updateJoinOfOption('condition_0_fallback', 'node_1')

    expect(activeStory.entireTree().nodes[0].fallbackCondition).toEqual({
      id: 'condition_0_fallback',
      join: [{ node: 'node_1', toAnswer: false }],
    })
  })

  it('adds AND rules to a legacy route without changing its connection', () => {
    activeStory.load('story-1', 'Story', {
      nodes: [
        {
          id: 'node_0',
          top: 0,
          left: 0,
          type: 'distributor',
          conditions: [
            {
              id: 'condition_0_0',
              ref: 'stat_gold',
              comparator: 'morethan',
              value: 3,
              join: [{ node: 'node_1' }],
            },
          ],
        },
        { id: 'node_1', top: 0, left: 0, type: 'end' },
      ],
    })

    editor.addConditionRule('condition_0_0')
    editor.updateConditionValues(
      'condition_0_0',
      { ref: 'condition_key', comparator: 'equalto', value: 1 },
      1
    )

    expect(activeStory.entireTree().nodes[0].conditions?.[0]).toEqual({
      id: 'condition_0_0',
      join: [{ node: 'node_1' }],
      rules: [
        { ref: 'stat_gold', comparator: 'morethan', value: 3 },
        { ref: 'condition_key', comparator: 'equalto', value: 1 },
      ],
    })

    editor.removeConditionRule('condition_0_0', 0)
    expect(activeStory.entireTree().nodes[0].conditions?.[0].rules).toEqual([
      { ref: 'condition_key', comparator: 'equalto', value: 1 },
    ])
  })

  it('reorders routes while retaining their connections', () => {
    activeStory.load('story-1', 'Story', {
      nodes: [
        {
          id: 'node_0',
          top: 0,
          left: 0,
          type: 'distributor',
          conditions: [
            { id: 'condition_0_0', join: [{ node: 'node_1' }] },
            { id: 'condition_0_1', join: [{ node: 'node_2' }] },
          ],
        },
      ],
    })

    editor.moveCondition('node_0', 'condition_0_1', -1)

    expect(
      activeStory.entireTree().nodes[0].conditions?.map((route) => route.id)
    ).toEqual(['condition_0_1', 'condition_0_0'])
    expect(activeStory.entireTree().nodes[0].conditions?.[0].join).toEqual([
      { node: 'node_2' },
    ])
  })

  it('does not replace the tree for a duplicate join', () => {
    const currentTree = activeStory.entireTree()

    editor.updateJoinOfOption('node_0', 'node_1')

    expect(activeStory.entireTree()).toBe(currentTree)
    expect(activeStory.entireTree().nodes[0].join).toEqual([{ node: 'node_1' }])
  })
})
