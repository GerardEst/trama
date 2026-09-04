import { TestBed } from '@angular/core/testing'
import { DatabaseService } from 'src/app/core/services/database.service'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { StoryMutationService } from 'src/app/shared/services/story-mutation.service'
import { StoryReferencesService } from './story-references.service'

class DatabaseStub {
  saveTreeToDB = jasmine.createSpy('saveTreeToDB').and.resolveTo(true)
}

describe('StoryReferencesService', () => {
  let activeStory: ActiveStoryService
  let references: StoryReferencesService

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ActiveStoryService,
        StoryMutationService,
        StoryReferencesService,
        { provide: DatabaseService, useClass: DatabaseStub },
      ],
    })

    activeStory = TestBed.inject(ActiveStoryService)
    references = TestBed.inject(StoryReferencesService)
    activeStory.load('story-1', 'Story', { nodes: [] })
  })

  it('creates a typed reference without mutating the previous tree', () => {
    const previousTree = activeStory.entireTree()

    const createdRef = references.create('Gold', 'stat')

    expect(createdRef).toEqual({ id: 'stat_0', name: 'Gold', type: 'stat' })
    expect(previousTree.refs).toEqual({})
    expect(activeStory.entireTree().refs['stat_0']).toEqual({
      name: 'Gold',
      type: 'stat',
    })
  })

  it('does not create duplicate references of the same name and type', () => {
    references.create('Gold', 'stat')
    const currentTree = activeStory.entireTree()

    const duplicate = references.create('Gold', 'stat')

    expect(duplicate).toBeUndefined()
    expect(activeStory.entireTree()).toBe(currentTree)
  })

  it('creates each category only once', () => {
    references.createCategory('Inventory')
    references.createCategory('Inventory')

    expect(references.getCategories()).toEqual([
      { id: 'Inventory', name: 'Inventory' },
    ])
  })
})
