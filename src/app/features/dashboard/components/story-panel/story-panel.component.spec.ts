import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'

import { StoryPanelComponent } from './story-panel.component'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { StatisticsService } from 'src/app/shared/services/statistics.service'

describe('StoryPanelComponent', () => {
  let component: StoryPanelComponent
  let fixture: ComponentFixture<StoryPanelComponent>
  const host = () => fixture.nativeElement as HTMLElement

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoryPanelComponent],
      providers: [provideRouter([])],
    }).compileComponents()
    spyOn(TestBed.inject(StatisticsService), 'getGamesOf').and.resolveTo([])

    fixture = TestBed.createComponent(StoryPanelComponent)
    component = fixture.componentInstance
    TestBed.inject(ActiveStoryService).load('story-1', 'The island', {
      refs: { stat_1: { name: 'Courage', type: 'stat' } },
      nodes: [],
    })
    fixture.detectChanges()
  })

  it('waits off the board, out of reach, until the board controls open it, and slides back out', () => {
    const panel = host().querySelector<HTMLElement>('#story-panel')!
    // Kept in the page so it can slide out, but neither focusable nor clickable while closed.
    expect(panel.classList).toContain('panel--closed')
    expect(panel.inert).toBeTrue()
    fixture.componentRef.setInput('open', true)
    fixture.detectChanges()
    expect(panel.classList).not.toContain('panel--closed')
    expect(panel.inert).toBeFalse()
    expect(panel.getAttribute('aria-label')).toBe('Project panel')
    fixture.componentRef.setInput('open', false)
    fixture.detectChanges()
    expect(panel.classList).toContain('panel--closed')
    expect(getComputedStyle(panel).transitionProperty).toContain('translate')
  })

  it('shows the project of the open story, for now only the story itself', () => {
    fixture.componentRef.setInput('open', true)
    fixture.detectChanges()
    const project = host().querySelector<HTMLElement>('[aria-labelledby="story-panel-project-title"]')!
    expect(project.querySelector('[aria-current="true"]')?.textContent).toContain('The island')
    // Adding stories, characters and locations is not possible yet.
    expect(project.querySelector<HTMLButtonElement>('button.item')!.disabled).toBeTrue()
    expect(Array.from(project.querySelectorAll('.item--soon')).map((item) => item.textContent?.replace(/\s+/g, ' ').trim()))
      .toEqual(['Characters Coming soon', 'Locations Coming soon'])
  })

  it('lists what this story holds: its references, and the games played on demand', () => {
    fixture.componentRef.setInput('open', true)
    fixture.detectChanges()
    const story = host().querySelector<HTMLElement>('[aria-labelledby="story-panel-story-title"]')!
    expect(story.querySelector('h2')?.textContent).toContain('This story')
    expect(story.querySelector<HTMLInputElement>('polo-story-references polo-editable-name input')?.value).toBe('Courage')

    const [references, activity] = Array.from(story.querySelectorAll<HTMLButtonElement>('.tab'))
    expect(references.getAttribute('aria-pressed')).toBe('true')
    // Player activity needs no paid plan.
    expect(activity.disabled).toBeFalse()
    activity.click()
    fixture.detectChanges()
    expect(activity.getAttribute('aria-pressed')).toBe('true')
    expect(story.querySelector('polo-stadistics-layer')).not.toBeNull()
    expect(story.querySelector('polo-story-references')).toBeNull()
  })

  it('asks to close from its own button', () => {
    fixture.componentRef.setInput('open', true)
    fixture.detectChanges()
    const closed = spyOn(component.closed, 'emit')
    host().querySelector<HTMLButtonElement>('button.close')!.click()
    expect(closed).toHaveBeenCalledTimes(1)
  })

  it('leaves the history and the story actions to the toolbars around the board', () => {
    expect(Array.from(host().querySelectorAll('button')).some((button) => /Undo|Redo|Story options|Share/.test(button.textContent ?? ''))).toBeFalse()
  })
})
