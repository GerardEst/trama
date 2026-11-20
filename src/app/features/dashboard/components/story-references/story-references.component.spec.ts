import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'

import { StoryReferencesComponent } from './story-references.component'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { StoryReferencesService } from 'src/app/features/board/services/story-references.service'

describe('StoryReferencesComponent', () => {
  let fixture: ComponentFixture<StoryReferencesComponent>
  const host = () => fixture.nativeElement as HTMLElement
  const load = (tree: Parameters<ActiveStoryService['load']>[2]) => {
    TestBed.inject(ActiveStoryService).load('story-1', 'Story', tree)
    fixture.detectChanges()
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoryReferencesComponent],
      providers: [provideRouter([])],
    }).compileComponents()
    fixture = TestBed.createComponent(StoryReferencesComponent)
    fixture.detectChanges()
  })

  it('explains how references appear while the story has none', () => {
    load({ nodes: [] })
    expect(host().querySelector('.empty')?.textContent).toContain('No stats, conditions or properties yet')
    expect(host().querySelector('.refs')).toBeNull()
  })

  it('edits used and unused names through the shared name control', () => {
    const rename = spyOn(TestBed.inject(StoryReferencesService), 'rename')
    load({
      refs: {
        stat_1: { name: 'Courage', type: 'stat' },
        stat_2: { name: 'Luck', type: 'stat' },
      },
      nodes: [{
        id: 'node_0', top: 0, left: 0, type: 'content',
        events: [{ id: 'event_1', action: 'alterStat', type: 'stat', amount: '1', target: 'stat_1' }],
      }],
    })
    const inputs = host().querySelectorAll<HTMLInputElement>('.ref__names polo-editable-name input')
    expect(inputs.length).toBe(2)
    for (const input of Array.from(inputs)) {
      input.value += ' updated'
      input.dispatchEvent(new Event('change'))
    }
    expect(rename).toHaveBeenCalledWith('stat_1', 'Courage updated')
    expect(rename).toHaveBeenCalledWith('stat_2', 'Luck updated')
  })

  it('gives every kind of reference its icon, properties too', () => {
    load({
      refs: {
        stat_1: { name: 'Courage', type: 'stat' },
        condition_1: { name: 'Key', type: 'condition' },
        property_1: { name: 'Title', type: 'property' },
      },
      nodes: [],
    })
    document.body.appendChild(host())
    for (const type of ['stat', 'condition', 'property']) {
      const icon = host().querySelector<HTMLElement>(`.ref__type--${type}`)!
      expect(getComputedStyle(icon).backgroundImage).toContain('/assets/icons/')
    }
    host().remove()
  })

  it('deletes an unused reference from a labelled button', () => {
    const remove = spyOn(TestBed.inject(StoryReferencesService), 'delete')
    load({ refs: { stat_2: { name: 'Luck', type: 'stat' } }, nodes: [] })
    const button = host().querySelector<HTMLButtonElement>('button.ref__delete')!
    expect(button.getAttribute('aria-label')).toBe('Delete Luck')
    button.click()
    fixture.detectChanges()
    expect(remove).toHaveBeenCalledOnceWith('stat_2')
    expect(host().querySelector('.ref--unused')).toBeNull()
  })
})
