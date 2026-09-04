import { TestBed } from '@angular/core/testing'
import { ActiveStoryService } from './active-story.service'

describe('ActiveStoryService', () => {
  let service: ActiveStoryService

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ActiveStoryService],
    })

    service = TestBed.inject(ActiveStoryService)
  })

  it('normalizes and exposes the active story', () => {
    service.load('story-1', 'A story', {
      nodes: [
        {
          id: 'node_0',
          top: 0,
          left: 0,
          type: 'content',
        },
      ],
    })

    expect(service.storyId()).toBe('story-1')
    expect(service.storyName()).toBe('A story')
    expect(service.entireTree()).toEqual({
      nodes: [
        {
          id: 'node_0',
          top: 0,
          left: 0,
          type: 'content',
        },
      ],
      refs: {},
      categories: [],
    })
    expect(Object.isFrozen(service.entireTree())).toBeTrue()
    expect(Object.isFrozen(service.entireTree().nodes)).toBeTrue()
  })

  it('does not freeze or retain caller-owned tree objects', () => {
    const storyTree = {
      nodes: [
        {
          id: 'node_0',
          top: 0,
          left: 0,
          type: 'content' as const,
          text: 'Original',
        },
      ],
    }

    service.load('story-1', 'Story', storyTree)
    storyTree.nodes[0].text = 'Changed outside the store'

    expect(Object.isFrozen(storyTree)).toBeFalse()
    expect(Object.isFrozen(storyTree.nodes)).toBeFalse()
    expect(service.entireTree().nodes[0].text).toBe('Original')
  })

  it('derives reference usages from the tree', () => {
    service.load('story-1', 'Story', {
      refs: {
        stat_1: { name: 'Gold', type: 'stat' },
        condition_1: { name: 'Has key', type: 'condition' },
      },
      nodes: [
        {
          id: 'node_0',
          top: 0,
          left: 0,
          type: 'content',
          events: [
            {
              id: 'event_1',
              action: 'alterCondition',
              type: 'condition',
              amount: '1',
              target: 'condition_1',
            },
          ],
          answers: [
            {
              id: 'answer_0_0',
              requirements: [{ target: 'stat_1', type: 'stat', amount: 2 }],
            },
          ],
        },
      ],
    })

    expect(service.referenceUsages()).toEqual([
      jasmine.objectContaining({
        id: 'condition_1',
        node: 'node_0',
        on: 'event',
      }),
      jasmine.objectContaining({
        id: 'stat_1',
        node: 'node_0',
        answer: 'answer_0_0',
        on: 'requirement',
      }),
    ])
  })

  it('updates configuration without mutating the previous value', () => {
    const previousConfiguration = service.storyConfiguration()

    service.patchConfiguration({
      sharing: true,
      footer: { text: 'Read more' },
    })

    expect(service.storyConfiguration()).not.toBe(previousConfiguration)
    expect(previousConfiguration.sharing).toBeFalse()
    expect(service.storyConfiguration().sharing).toBeTrue()
    expect(service.storyConfiguration().footer.text).toBe('Read more')
  })
})
