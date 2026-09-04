import { TestBed } from '@angular/core/testing'
import { Title } from '@angular/platform-browser'
import { ActiveStoryService } from './active-story.service'
import { ActiveStoryTitleService } from './active-story-title.service'

describe('ActiveStoryTitleService', () => {
  let activeStory: ActiveStoryService
  let title: jasmine.SpyObj<Title>

  beforeEach(() => {
    title = jasmine.createSpyObj<Title>('Title', ['setTitle'])

    TestBed.configureTestingModule({
      providers: [
        ActiveStoryService,
        ActiveStoryTitleService,
        { provide: Title, useValue: title },
      ],
    })

    activeStory = TestBed.inject(ActiveStoryService)
    TestBed.inject(ActiveStoryTitleService)
  })

  it('keeps the existing document title until a story name is available', () => {
    TestBed.flushEffects()
    expect(title.setTitle).not.toHaveBeenCalled()

    activeStory.load('story-1', 'Story title', { nodes: [] })
    TestBed.flushEffects()
    expect(title.setTitle).toHaveBeenCalledOnceWith('Story title')

    activeStory.reset()
    TestBed.flushEffects()
    expect(title.setTitle).toHaveBeenCalledTimes(1)
  })
})
