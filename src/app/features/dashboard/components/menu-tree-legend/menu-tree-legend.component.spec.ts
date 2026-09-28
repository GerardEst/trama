import { ComponentFixture, TestBed } from '@angular/core/testing'

import { MenuTreeLegendComponent } from './menu-tree-legend.component'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { StoryReferencesService } from 'src/app/features/board/services/story-references.service'

describe('MenuTreeLegendComponent', () => {
  let component: MenuTreeLegendComponent
  let fixture: ComponentFixture<MenuTreeLegendComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuTreeLegendComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(MenuTreeLegendComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('edits used and unused stat names through the shared name control', () => {
    const activeStory = TestBed.inject(ActiveStoryService)
    const rename = spyOn(TestBed.inject(StoryReferencesService), 'rename')
    activeStory.load('story-1', 'Story', {
      refs: {
        stat_1: { name: 'Courage', type: 'stat' },
        stat_2: { name: 'Luck', type: 'stat' },
      },
      nodes: [{
        id: 'node_0', top: 0, left: 0, type: 'content',
        events: [{ id: 'event_1', action: 'alterStat', type: 'stat', amount: '1', target: 'stat_1' }],
      }],
    })
    fixture.detectChanges()
    const inputs = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLInputElement>('.tag__names polo-editable-name input')
    expect(inputs.length).toBe(2)
    for (const input of Array.from(inputs)) {
      input.value += ' updated'
      input.dispatchEvent(new Event('change'))
    }
    expect(rename).toHaveBeenCalledWith('stat_1', 'Courage updated')
    expect(rename).toHaveBeenCalledWith('stat_2', 'Luck updated')
  })

  it('only shows scrollbars when the legend content overflows', () => {
    const refs = fixture.nativeElement.querySelector('.legend__content__refs') as HTMLElement
    const styles = getComputedStyle(refs)

    expect(styles.overflowY).toBe('auto')
    expect(styles.overflowX).toBe('auto')
  })
})
