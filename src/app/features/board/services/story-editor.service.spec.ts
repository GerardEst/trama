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

  it('does not replace the tree for a duplicate join', () => {
    const currentTree = activeStory.entireTree()

    editor.updateJoinOfOption('node_0', 'node_1')

    expect(activeStory.entireTree()).toBe(currentTree)
    expect(activeStory.entireTree().nodes[0].join).toEqual([{ node: 'node_1' }])
  })
})
