import { ComponentFixture, TestBed } from '@angular/core/testing'
import { event } from 'src/app/core/interfaces/interfaces'
import { StoryEditorService } from '../../../services/story-editor.service'
import { NodeEventsComponent } from './node-events.component'
import { ContextHelpService } from 'src/app/shared/context-help/context-help.service'

describe('NodeEventsComponent', () => {
  let component: NodeEventsComponent
  let fixture: ComponentFixture<NodeEventsComponent>
  let storyEditor: jasmine.SpyObj<StoryEditorService>

  const conditionEvent: event = {
    id: 'event_1',
    target: 'condition_1',
    type: 'condition',
    amount: '1',
    action: 'alterCondition',
  }

  beforeEach(async () => {
    storyEditor = jasmine.createSpyObj<StoryEditorService>(
      'StoryEditorService',
      ['saveNodeEvents', 'saveAnswerEvents']
    )
    await TestBed.configureTestingModule({
      imports: [NodeEventsComponent],
      providers: [{ provide: StoryEditorService, useValue: storyEditor }],
    }).compileComponents()

    fixture = TestBed.createComponent(NodeEventsComponent)
    component = fixture.componentInstance
    component.nodeId = 'node_1'
    fixture.detectChanges()
  })

  afterEach(() => fixture.nativeElement.remove())

  it('opens the Add event panel as an anchored popover', async () => {
    const host: HTMLElement = fixture.nativeElement
    document.body.appendChild(host)
    host.querySelector<HTMLButtonElement>('polo-contextual-button button')!.click()
    fixture.detectChanges()
    await new Promise<void>((resolve) => setTimeout(resolve, 50))

    const panel = host.querySelector<HTMLElement>('.anchoredPopover__panel')!
    expect(panel.matches(':popover-open')).toBeTrue()
    expect(panel.querySelector('.addEvent')).not.toBeNull()
    expect(host.querySelector('polo-contextual-button button')?.getAttribute('aria-expanded')).toBe('true')
  })

  it('explains Add event without opening the editor or changing story data', async () => {
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
      expect(popup.querySelector('strong')?.textContent).toBe('Events')
      expect(popup.querySelector('a')?.getAttribute('href')).toBe('/docs/features#events')
      expect(host.querySelector('.addEvent')).toBeNull()
      expect(host.querySelector('polo-contextual-button button')?.getAttribute('aria-expanded')).toBe('false')
      expect(storyEditor.saveNodeEvents).not.toHaveBeenCalled()
      expect(storyEditor.saveAnswerEvents).not.toHaveBeenCalled()

      help.setEnabled(false)
      fixture.detectChanges()
      expect(action.querySelector('polo-context-help button')).toBeNull()
      expect(action.querySelector('.contextHelp__panel')).toBeNull()
      action.querySelector<HTMLButtonElement>('.contextualButton > button')!.click()
      fixture.detectChanges()
      await new Promise<void>(resolve => setTimeout(resolve, 0))
      expect(host.querySelector('.addEvent')).not.toBeNull()
    } finally {
      if (previous === null) localStorage.removeItem(key)
      else localStorage.setItem(key, previous)
    }
  })

  it('lets the selector dropdown extend beyond the editor without scrolling the popover', async () => {
    const host: HTMLElement = fixture.nativeElement
    document.body.appendChild(host)
    host.querySelector<HTMLButtonElement>('polo-contextual-button button')!.click()
    fixture.detectChanges()
    await new Promise<void>((resolve) => setTimeout(resolve, 0))

    const selector = host.querySelector<HTMLElement>('polo-selector')!
    selector.style.cssText = 'position: fixed; bottom: 1rem; left: 1rem; width: 25rem'
    selector.querySelector<HTMLButtonElement>('.selector')!.click()
    fixture.detectChanges()

    const panel = host.querySelector<HTMLElement>('.anchoredPopover__panel')!
    const dropdown = selector.querySelector<HTMLElement>('.selector__popover')!
    expect(dropdown.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      selector.querySelector('.selector')!.getBoundingClientRect().top
    )
    expect(getComputedStyle(panel).overflow).toBe('visible')
    expect(getComputedStyle(dropdown.querySelector('.dropdown__options')!).overflowY).toBe('auto')
  })

  it('keeps the confirmation open when the clicked button is replaced', () => {
    component.events = [conditionEvent]
    fixture.detectChanges()
    const host: HTMLElement = fixture.nativeElement
    host.querySelector<HTMLButtonElement>('button.node__event')!.click()
    fixture.detectChanges()

    // The opening click is observed by the popup's document listener in the app.
    host.querySelector<HTMLElement>('.addEvent__header')!.click()
    const deleteButton = host.querySelector<HTMLButtonElement>(
      '.addEvent__button--delete'
    )!
    // Change detection can remove the clicked button before the click reaches document.
    deleteButton.addEventListener('click', () => fixture.detectChanges())
    deleteButton.click()
    fixture.detectChanges()

    expect(host.textContent).toContain('Delete this event?')
    expect(
      host.querySelector('.addEvent__button--confirmDelete')
    ).not.toBeNull()
    expect(storyEditor.saveNodeEvents).not.toHaveBeenCalled()
  })

  it('still closes the editor when clicking outside', () => {
    component.events = [conditionEvent]
    fixture.detectChanges()
    const host: HTMLElement = fixture.nativeElement
    host.querySelector<HTMLButtonElement>('button.node__event')!.click()
    fixture.detectChanges()
    host.querySelector<HTMLElement>('.addEvent__header')!.click()

    document.body.click()
    fixture.detectChanges()

    expect(host.querySelector('.addEvent')).toBeNull()
    expect(storyEditor.saveNodeEvents).not.toHaveBeenCalled()
  })

  it('deletes a node event through the editor and persists it', () => {
    component.events = [conditionEvent]
    fixture.detectChanges()
    const host: HTMLElement = fixture.nativeElement
    host.querySelector<HTMLButtonElement>('button.node__event')!.click()
    fixture.detectChanges()
    host.querySelector<HTMLButtonElement>('.addEvent__button--delete')!.click()
    fixture.detectChanges()
    host
      .querySelector<HTMLButtonElement>('.addEvent__button--confirmDelete')!
      .click()
    fixture.detectChanges()

    expect(host.querySelector('button.node__event')).toBeNull()
    expect(storyEditor.saveNodeEvents).toHaveBeenCalledWith('node_1', [])
  })

  it('deletes a node event and persists the empty list', () => {
    component.events = [conditionEvent]
    component.deleteEvent(conditionEvent)

    expect(component.events).toEqual([])
    expect(storyEditor.saveNodeEvents).toHaveBeenCalledWith('node_1', [])
  })

  it('replaces the original event when its target or type changes', () => {
    component.events = [conditionEvent]
    component.saveEvent({
      ...conditionEvent,
      previousTarget: 'condition_1',
      target: 'stat_2',
      type: 'stat',
      amount: '-2',
    })

    expect(component.events).toEqual([
      {
        id: 'event_1',
        target: 'stat_2',
        type: 'stat',
        amount: '-2',
        action: 'alterStat',
        property: undefined,
      },
    ])
    expect(storyEditor.saveNodeEvents).toHaveBeenCalledWith(
      'node_1',
      component.events
    )
  })

  it('saves property events with the action the game engine handles', () => {
    component.answerId = 'answer_1_1'
    component.nodeId = undefined
    component.saveEvent({
      ...conditionEvent,
      target: 'property_1',
      type: 'property',
      property: 'Alice',
    })

    expect(component.events[0].action).toBe('alterProperty')
    expect(storyEditor.saveAnswerEvents).toHaveBeenCalledWith(
      'answer_1_1',
      component.events
    )
  })
})
