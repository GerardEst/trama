import { ComponentFixture, TestBed } from '@angular/core/testing'

import { StoryEditorService } from '../../../services/story-editor.service'
import { NodeRequirementsComponent } from './node-requirements.component'
import { ContextHelpService } from 'src/app/shared/context-help/context-help.service'

describe('NodeRequirementsComponent', () => {
  let component: NodeRequirementsComponent
  let fixture: ComponentFixture<NodeRequirementsComponent>
  let storyEditor: jasmine.SpyObj<StoryEditorService>

  beforeEach(async () => {
    storyEditor = jasmine.createSpyObj<StoryEditorService>(
      'StoryEditorService',
      ['saveAnswerRequirements']
    )

    await TestBed.configureTestingModule({
      imports: [NodeRequirementsComponent],
      providers: [{ provide: StoryEditorService, useValue: storyEditor }],
    }).compileComponents()

    fixture = TestBed.createComponent(NodeRequirementsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  afterEach(() => fixture.nativeElement.remove())

  it('opens the Add requirement panel as an anchored popover', async () => {
    const host: HTMLElement = fixture.nativeElement
    document.body.appendChild(host)
    host.querySelector<HTMLButtonElement>('polo-contextual-button button')!.click()
    fixture.detectChanges()
    await new Promise<void>((resolve) => setTimeout(resolve, 50))

    const panel = host.querySelector<HTMLElement>('.anchoredPopover__panel')!
    expect(panel.matches(':popover-open')).toBeTrue()
    expect(panel.querySelector('.addRequirement')).not.toBeNull()
    expect(host.querySelector('polo-contextual-button button')?.getAttribute('aria-expanded')).toBe('true')
  })

  it('explains Add requirement without opening the editor or changing story data', async () => {
    const key = 'polo-context-help'
    const previous = localStorage.getItem(key)
    const help = TestBed.inject(ContextHelpService)
    const host = fixture.nativeElement as HTMLElement
    document.body.appendChild(host)
    try {
      help.setEnabled(true)
      fixture.detectChanges()
      const action = host.querySelector('polo-contextual-button')!
      const surface = action.querySelector('.contextualButton')!
      expect(getComputedStyle(surface).alignItems).toBe('center')
      expect(surface.querySelector('polo-context-help')).not.toBeNull()
      expect(action.querySelector('button button')).toBeNull()
      action.querySelector<HTMLButtonElement>('polo-context-help button')!.click()
      fixture.detectChanges()
      await new Promise<void>(resolve => setTimeout(resolve, 0))
      const popup = action.querySelector<HTMLElement>('.contextHelp__panel')!
      expect(popup.matches(':popover-open')).toBeTrue()
      expect(popup.querySelector('strong')?.textContent).toBe('Requirements')
      expect(popup.querySelector('a')?.getAttribute('href')).toBe('/docs/features#requirements')
      expect(host.querySelector('.addRequirement')).toBeNull()
      expect(host.querySelector('polo-contextual-button button')?.getAttribute('aria-expanded')).toBe('false')
      expect(storyEditor.saveAnswerRequirements).not.toHaveBeenCalled()

      help.setEnabled(false)
      fixture.detectChanges()
      expect(action.querySelector('polo-context-help button')).toBeNull()
      expect(action.querySelector('.contextHelp__panel')).toBeNull()
      action.querySelector<HTMLButtonElement>('.contextualButton > button')!.click()
      fixture.detectChanges()
      await new Promise<void>(resolve => setTimeout(resolve, 0))
      expect(host.querySelector('.addRequirement')).not.toBeNull()
    } finally {
      if (previous === null) localStorage.removeItem(key)
      else localStorage.setItem(key, previous)
    }
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('deletes a legacy requirement and persists the empty list', () => {
    component.answerId = 'answer_0_0'
    component.requirements = [
      { id: 'condition_1', type: 'condition', amount: 1 },
    ]

    component.deleteRequirement('condition_1')

    expect(component.requirements).toEqual([])
    expect(storyEditor.saveAnswerRequirements).toHaveBeenCalledWith(
      'answer_0_0',
      []
    )
  })

  it('updates rather than duplicates a requirement on the same target', () => {
    component.requirements = [{ target: 'stat_1', type: 'stat', amount: 1 }]

    component.saveRequirement({ target: 'stat_1', type: 'stat', amount: '3' })

    expect(component.requirements).toEqual([
      { target: 'stat_1', type: 'stat', amount: 3 },
    ])
  })

  it('replaces a legacy id-only requirement when it is edited', () => {
    component.answerId = 'answer_0_0'
    component.requirements = [{ id: 'stat_1', type: 'stat', amount: 1 }]

    component.saveRequirement({
      target: 'stat_2',
      previousValue: 'stat_1',
      type: 'stat',
      amount: '2',
    })

    expect(component.requirements).toEqual([
      { target: 'stat_2', type: 'stat', amount: 2 },
    ])
    expect(storyEditor.saveAnswerRequirements).toHaveBeenCalledWith(
      'answer_0_0',
      component.requirements
    )
  })
})
