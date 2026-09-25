import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'

import { ConditionComponent } from './condition.component'
import { BoardAnchorRegistryService } from '../../services/board-anchor-registry.service'
import { StoryEditorService } from '../../services/story-editor.service'

describe('ConditionComponent', () => {
  let component: ConditionComponent
  let fixture: ComponentFixture<ConditionComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConditionComponent],
      providers: [
        BoardAnchorRegistryService,
        {
          provide: ActiveStoryService,
          useValue: { entireTree: () => ({ refs: {} }) },
        },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(ConditionComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('shows multiple AND rules with one join and adds rules within the route', () => {
    fixture.componentRef.setInput('conditionId', 'condition_1_0')
    fixture.componentRef.setInput('rules', [
      { ref: 'stat_gold', comparator: 'morethan', value: 4 },
      { ref: 'condition_key', comparator: 'equalto', value: 1 },
    ])
    const addRule = spyOn(TestBed.inject(StoryEditorService), 'addConditionRule')
    fixture.detectChanges()

    const element = fixture.nativeElement as HTMLElement
    expect(element.querySelectorAll('.condition__rule').length).toBe(2)
    expect(element.querySelector('.condition__and')?.textContent).toContain('AND')
    expect(element.querySelectorAll('[data-board-origin]').length).toBe(1)
    expect(element.querySelector('[data-board-origin]')?.getAttribute('data-board-origin'))
      .toBe('condition_1_0')

    const addButton = Array.from(element.querySelectorAll('button')).find(
      (button) => button.textContent?.includes('Add AND rule')
    )
    addButton?.click()
    expect(addRule).toHaveBeenCalledOnceWith('condition_1_0')
  })
})
