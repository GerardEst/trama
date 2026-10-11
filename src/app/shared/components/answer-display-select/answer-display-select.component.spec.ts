import { TestBed } from '@angular/core/testing'
import { ActiveStoryService } from '../../services/active-story.service'
import { AnswerDisplaySelectComponent } from './answer-display-select.component'

describe('AnswerDisplaySelectComponent', () => {
  it('shows the effective inherited value and emits overrides or inheritance', () => {
    const fixture = TestBed.createComponent(AnswerDisplaySelectComponent)
    const story = TestBed.inject(ActiveStoryService)
    story.load('story', 'Story', { unavailableAnswerDisplay: 'locked' })
    fixture.componentRef.setInput('inherit', true)
    fixture.detectChanges()
    const select: HTMLSelectElement = fixture.nativeElement.querySelector('select')
    expect(select.value).toBe('inherit')
    expect(select.selectedOptions[0].textContent).toContain('Show locked')
    story.updateTree(tree => { tree.unavailableAnswerDisplay = 'requirements' })
    fixture.detectChanges()
    expect(select.selectedOptions[0].textContent).toContain('Show locked with requirements')
    const changed = jasmine.createSpy('changed')
    fixture.componentInstance.changed.subscribe(changed)
    select.value = 'hidden'
    select.dispatchEvent(new Event('change'))
    expect(changed).toHaveBeenCalledWith('hidden')
    select.value = 'inherit'
    select.dispatchEvent(new Event('change'))
    expect(changed).toHaveBeenCalledWith(undefined)
  })

  it('defaults old stories to hidden and omits inheritance for the story selector', () => {
    const fixture = TestBed.createComponent(AnswerDisplaySelectComponent)
    fixture.detectChanges()
    const select: HTMLSelectElement = fixture.nativeElement.querySelector('select')
    expect(select.value).toBe('hidden')
    expect(select.options.length).toBe(3)
  })
})
