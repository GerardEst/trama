import { ComponentFixture, TestBed } from '@angular/core/testing'
import { event } from 'src/app/core/interfaces/interfaces'
import { StoryEditorService } from '../../../services/story-editor.service'
import { NodeEventsComponent } from './node-events.component'

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
    host.querySelector<HTMLButtonElement>('.node__addEventButton')!.click()
    fixture.detectChanges()
    await new Promise<void>((resolve) => setTimeout(resolve, 50))

    const panel = host.querySelector<HTMLElement>('.anchoredPopover__panel')!
    expect(panel.matches(':popover-open')).toBeTrue()
    expect(panel.querySelector('.addEvent')).not.toBeNull()
    expect(host.querySelector('.node__addEventButton')?.getAttribute('aria-expanded')).toBe('true')
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
