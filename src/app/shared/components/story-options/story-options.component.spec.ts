import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { StoryOptionsComponent } from './story-options.component'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'

describe('StoryOptionsComponent', () => {
  it('shows each on-off option as a switch with its state and a line about what it does', async () => {
    await TestBed.configureTestingModule({
      imports: [StoryOptionsComponent],
      providers: [provideRouter([])],
    }).compileComponents()
    const activeStory = TestBed.inject(ActiveStoryService)
    activeStory.load('story-1', 'The island', { nodes: [] })
    activeStory.patchConfiguration({ tracking: true, cumulativeMode: false, tapLink: true })
    const fixture = TestBed.createComponent(StoryOptionsComponent)
    fixture.detectChanges()
    const host = fixture.nativeElement as HTMLElement
    const switches = Array.from(host.querySelectorAll<HTMLButtonElement>('button[role="switch"]'))
    expect(switches.map((item) => [item.getAttribute('aria-label'), item.getAttribute('aria-checked')])).toEqual([
      ['Enable tracking', 'true'],
      ['Cumulative mode', 'false'],
      ['Hide Trama link', 'false'],
    ])
    const hints = Array.from(host.querySelectorAll('.option__hint')).map((hint) => hint.textContent?.trim())
    expect(hints.length).toBe(4)
    expect(hints[0]).toContain('statistics')
    expect(hints[2]).toContain('earlier passages')
  })
})
