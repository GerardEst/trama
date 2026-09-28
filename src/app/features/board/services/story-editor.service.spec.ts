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

  it('groups nodes without rewriting links, then ungroups them', () => {
    const save = TestBed.inject(DatabaseService).saveTreeToDB as jasmine.Spy
    activeStory.load('story-1', 'Story', {
      nodes: [
        { id: 'node_0', type: 'content', top: 0, left: 0, join: [{ node: 'node_1' }] },
        { id: 'node_1', type: 'content', top: 20, left: 30, join: [{ node: 'node_2' }] },
        { id: 'node_2', type: 'end', top: 40, left: 50 },
      ],
    })
    const groupId = editor.groupNodes(new Set(['node_1', 'node_2']))
    const nodes = activeStory.entireTree().nodes

    expect(groupId).toBe('node_3')
    expect(nodes.find((storyNode) => storyNode.id === groupId)).toEqual({
      id: 'node_3', type: 'group', text: 'Group', top: 20, left: 30,
      groupId: undefined,
    })
    expect(nodes.find((storyNode) => storyNode.id === 'node_1')?.groupId).toBe(groupId)
    expect(nodes.find((storyNode) => storyNode.id === 'node_0')?.join).toEqual([{ node: 'node_1' }])
    expect(save).toHaveBeenCalledTimes(1)

    editor.ungroupNodes(groupId!)
    expect(activeStory.entireTree().nodes).toHaveSize(3)
    expect(activeStory.entireTree().nodes[1].groupId).toBeUndefined()
    expect(activeStory.entireTree().nodes[0].join).toEqual([{ node: 'node_1' }])
  })

  it('does not group the starting node or nodes from different levels', () => {
    const before = activeStory.entireTree()
    expect(editor.groupNodes(new Set(['node_0', 'node_1']))).toBeUndefined()
    expect(activeStory.entireTree()).toBe(before)
  })

  it('moves group descendants with the group and dissolves a deleted group', () => {
    activeStory.load('story-1', 'Story', {
      nodes: [
        { id: 'node_0', type: 'content', top: 0, left: 0 },
        { id: 'node_1', type: 'content', top: 20, left: 30 },
        { id: 'node_2', type: 'end', top: 40, left: 50 },
      ],
    })
    const groupId = editor.groupNodes(new Set(['node_1', 'node_2']))!
    editor.updateNodePosition(groupId, 130, 120)
    expect(activeStory.entireTree().nodes[1].left).toBe(130)
    expect(activeStory.entireTree().nodes[2].top).toBe(140)

    editor.removeNode(groupId)
    expect(activeStory.entireTree().nodes.map((storyNode) => storyNode.id)).toEqual([
      'node_0', 'node_1', 'node_2',
    ])
    expect(activeStory.entireTree().nodes[1].groupId).toBeUndefined()
  })

  it('persists a visual frame without changing graph membership or links', () => {
    const save = TestBed.inject(DatabaseService).saveTreeToDB as jasmine.Spy
    const frameId = editor.frameNodes(new Set(['node_0', 'node_1']))!
    expect(frameId).toBeTruthy()
    expect(activeStory.entireTree().frames).toEqual([{
      id: frameId, name: 'Frame', nodeIds: ['node_0', 'node_1'], groupId: undefined,
    }])
    expect(activeStory.entireTree().nodes[0].join).toEqual([{ node: 'node_1' }])
    expect(activeStory.entireTree().nodes[0].groupId).toBeUndefined()
    expect(save.calls.mostRecent().args[1].frames[0].id).toBe(frameId)

    editor.renameFrame(frameId, '  Chapter 1  ')
    expect(activeStory.entireTree().frames?.[0].name).toBe('Chapter 1')
    editor.removeFrame(frameId)
    expect(activeStory.entireTree().frames).toEqual([])
    expect(activeStory.entireTree().nodes).toHaveSize(2)
  })

  it('reassigns frame members and cleans up empty frames when nodes are removed', () => {
    const first = editor.frameNodes(new Set(['node_0', 'node_1']))!
    activeStory.load('story-1', 'Story', {
      ...activeStory.entireTree(),
      nodes: [...activeStory.entireTree().nodes, { id: 'node_2', type: 'end', left: 200, top: 0 }],
    })
    const second = editor.frameNodes(new Set(['node_1', 'node_2']))!
    expect(activeStory.entireTree().frames?.find((frame) => frame.id === first)?.nodeIds).toEqual(['node_0'])
    editor.removeNode('node_1')
    expect(activeStory.entireTree().frames?.find((frame) => frame.id === second)?.nodeIds).toEqual(['node_2'])
    editor.removeNode('node_2')
    expect(activeStory.entireTree().frames?.map((frame) => frame.id)).toEqual([first])
  })

  it('keeps frames on their board level when nodes are grouped or ungrouped', () => {
    activeStory.load('nested', 'Story', {
      nodes: [
        { id: 'node_0', type: 'content', left: 0, top: 0 },
        { id: 'node_1', type: 'content', left: 100, top: 0 },
        { id: 'node_2', type: 'content', left: 300, top: 0 },
      ],
    })
    editor.frameNodes(new Set(['node_1', 'node_2']))
    const groupId = editor.groupNodes(new Set(['node_1', 'node_2']))!
    expect(activeStory.entireTree().frames).toEqual([])
    const inside = editor.frameNodes(new Set(['node_1', 'node_2']), groupId)!
    expect(activeStory.entireTree().frames?.[0].groupId).toBe(groupId)
    expect(editor.frameNodes(new Set(['node_0', 'node_1']))).toBeUndefined()
    editor.ungroupNodes(groupId)
    expect(activeStory.entireTree().frames).toEqual([])
    expect(activeStory.entireTree().nodes.find((node) => node.id === 'node_1')?.groupId).toBeUndefined()
    expect(inside).toBeTruthy()
  })

  it('moves nodes into a frame with their positions in one save and transfers membership', async () => {
    activeStory.load('story-1', 'Story', {
      nodes: [
        { id: 'node_0', type: 'content', top: 0, left: 0 },
        { id: 'node_1', type: 'content', top: 10, left: 10 },
        { id: 'node_2', type: 'end', top: 20, left: 20 },
        { id: 'node_3', type: 'end', top: 30, left: 30 },
      ],
    })
    const first = editor.frameNodes(new Set(['node_0', 'node_3']))!
    const second = editor.frameNodes(new Set(['node_1', 'node_2']))!
    const save = TestBed.inject(DatabaseService).saveTreeToDB as jasmine.Spy
    await new Promise<void>((resolve) => setTimeout(resolve, 0))
    const before = save.calls.count()
    editor.updateNodePositions(new Map([['node_3', { x: 50, y: 60 }]]), {
      frameId: second, nodeIds: new Set(['node_3']),
    })
    expect(save.calls.count()).toBe(before + 1)
    expect(save.calls.mostRecent().args[1].frames.find(
      (frame: { id: string }) => frame.id === second
    ).nodeIds).toEqual(['node_1', 'node_2', 'node_3'])
    expect(activeStory.entireTree().frames?.find((frame) => frame.id === first)?.nodeIds).toEqual(['node_0'])
    expect(activeStory.entireTree().frames?.find((frame) => frame.id === second)?.nodeIds).toEqual(['node_1', 'node_2', 'node_3'])
    expect(activeStory.entireTree().nodes[3].left).toBe(50)

    editor.updateNodePositions(new Map([['node_0', { x: 70, y: 80 }]]), {
      frameId: second, nodeIds: new Set(['node_0']),
    })
    expect(activeStory.entireTree().frames?.some((frame) => frame.id === first)).toBeFalse()
    expect(activeStory.entireTree().frames?.[0].nodeIds).toEqual(['node_1', 'node_2', 'node_3', 'node_0'])
  })

  it('does not add a node from another board level to a frame', () => {
    activeStory.load('story-1', 'Story', {
      nodes: [
        { id: 'node_0', type: 'content', top: 0, left: 0 },
        { id: 'node_1', type: 'group', top: 0, left: 100 },
        { id: 'node_2', type: 'content', top: 20, left: 20, groupId: 'node_1' },
        { id: 'node_3', type: 'end', top: 30, left: 30 },
      ],
    })
    editor.frameNodes(new Set(['node_0', 'node_3']))
    const frameId = activeStory.entireTree().frames![0].id
    editor.updateNodePositions(new Map([['node_2', { x: 40, y: 50 }]]), {
      frameId, nodeIds: new Set(['node_2']),
    })
    expect(activeStory.entireTree().frames?.[0].nodeIds).toEqual(['node_0', 'node_3'])
    expect(activeStory.entireTree().nodes[2].left).toBe(40)
  })

  it('updates several node positions in one tree change and queued save', () => {
    const save = TestBed.inject(DatabaseService).saveTreeToDB as jasmine.Spy
    const previousTree = activeStory.entireTree()

    editor.updateNodePositions(new Map([
      ['node_0', { x: 25, y: -10 }],
      ['node_1', { x: 125, y: 90 }],
    ]))

    expect(activeStory.entireTree()).not.toBe(previousTree)
    expect(
      activeStory.entireTree().nodes.map((node) => [node.left, node.top])
    ).toEqual([[25, -10], [125, 90]])
    expect(save).toHaveBeenCalledTimes(1)
    expect(
      save.calls.mostRecent().args[1].nodes.map(
        (node: { left: number; top: number }) => [node.left, node.top]
      )
    ).toEqual([[25, -10], [125, 90]])
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
