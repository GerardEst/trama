import { By } from '@angular/platform-browser'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { NodeAddEventComponent } from '../context-menus/node-add-event/node-add-event.component'
import { NodeAddRequirementComponent } from '../context-menus/node-add-requirement/node-add-requirement.component'
import { ComponentFixture, DeferBlockState, TestBed } from '@angular/core/testing'
import { StoryEditorService } from '../../../services/story-editor.service'

import { AnswerComponent } from './answer.component'
import { BoardAnchorRegistryService } from '../../../services/board-anchor-registry.service'
import { PanzoomService } from '../../../services/panzoom.service'

describe('AnswerComponent', () => {
  let component: AnswerComponent
  let fixture: ComponentFixture<AnswerComponent>

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AnswerComponent],
      providers: [
        BoardAnchorRegistryService,
        PanzoomService,
        {
          provide: StoryEditorService,
          useValue: {
            updateAnswerText: () => undefined,
            upsertAnswerRequirement: () => undefined,
            upsertAnswerEvent: () => undefined,
            saveAnswerDisplay: () => undefined,
          },
        },
      ],
    })
    fixture = TestBed.createComponent(AnswerComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  afterEach(() => fixture.nativeElement.remove())

  const host = (): HTMLElement => fixture.nativeElement
  const trigger = (): HTMLButtonElement => host().querySelector('.answer__menuTrigger')!
  function openMenu() {
    document.body.appendChild(host())
    trigger().click()
    fixture.detectChanges()
  }
  function choose(label: string) {
    const item = Array.from(host().querySelectorAll<HTMLButtonElement>('[role="menuitem"]'))
      .find(button => button.textContent?.includes(label))!
    item.click()
    fixture.detectChanges()
  }
  function addReferences() {
    TestBed.inject(ActiveStoryService).load('story', 'Story', {
      refs: { stat_gold: { name: 'Gold', type: 'stat' } },
    })
    fixture.componentRef.setInput('answerId', 'answer_2_0')
  }

  it('shows only text and the options trigger for an answer without logic', () => {
    expect(host().querySelector('polo-node-add-event')).toBeNull()
    expect(host().querySelector('polo-node-add-requirement')).toBeNull()
    expect(host().querySelector('polo-answer-display-select')).toBeNull()
    expect(host().querySelector('polo-contextual-button')).toBeNull()
    expect(host().querySelector('.richTextField__button')).toBeNull()
    expect(getComputedStyle(host().querySelector('polo-node-events')!).display).toBe('none')
    expect(getComputedStyle(host().querySelector('polo-node-requirements')!).display).toBe('none')
    expect(trigger().getAttribute('aria-label')).toBe('Answer options')
  })

  it('opens the menu with keyboard navigation and returns focus on Escape', async () => {
    openMenu()
    await new Promise<void>(resolve => setTimeout(resolve, 0))
    const items = Array.from(host().querySelectorAll<HTMLButtonElement>('[role="menuitem"]'))
    expect(document.activeElement).toBe(items[0])
    expect(trigger().getAttribute('aria-expanded')).toBe('true')
    items[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    expect(document.activeElement).toBe(items[1])
    items[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }))
    expect(document.activeElement).toBe(items[items.length - 1])
    items[items.length - 1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }))
    expect(document.activeElement).toBe(items[0])
    items[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    fixture.detectChanges()
    expect(host().querySelector('[role="menu"]')).toBeNull()
    expect(document.activeElement).toBe(trigger())
  })

  it('adds requirements and events through the menu using the existing persistence logic', () => {
    addReferences()
    const editor = TestBed.inject(StoryEditorService)
    const saveRequirement = spyOn(editor, 'upsertAnswerRequirement')
    const saveEvent = spyOn(editor, 'upsertAnswerEvent')
    fixture.detectChanges()
    openMenu()
    choose('Add requirement')
    expect(host().querySelector('[role="menu"]')).toBeNull()
    const requirement = fixture.debugElement.query(By.directive(NodeAddRequirementComponent)).componentInstance as NodeAddRequirementComponent
    requirement.target = 'stat_gold'
    requirement.amount = 3
    requirement.saveRequirement()
    fixture.detectChanges()
    expect(saveRequirement).toHaveBeenCalledOnceWith('answer_2_0', { target: 'stat_gold', type: 'stat', amount: 3 })
    expect(host().querySelector('.anchoredPopover__panel')).toBeNull()
    openMenu()
    choose('Add event')
    const event = fixture.debugElement.query(By.directive(NodeAddEventComponent)).componentInstance as NodeAddEventComponent
    event.target = 'stat_gold'
    event.amount = 2
    event.saveEvent()
    fixture.detectChanges()
    expect(saveEvent).toHaveBeenCalledOnceWith('answer_2_0', { target: 'stat_gold', previousTarget: undefined, type: 'stat', amount: 2, property: undefined })
    expect(host().querySelector('.anchoredPopover__panel')).toBeNull()
  })

  for (const [action, selector] of [
    ['Add event', '.addEvent'],
    ['Add requirement', '.addRequirement'],
  ]) {
    it(`includes the ${action} editor in the anchored popover layout`, async () => {
      openMenu()
      choose(action)
      await new Promise<void>(resolve => setTimeout(resolve, 0))
      const panel = host().querySelector<HTMLElement>('.anchoredPopover__panel')!
      const editor = panel.querySelector<HTMLElement>(selector)!
      expect(getComputedStyle(editor).position).toBe('relative')
      expect(panel.getBoundingClientRect().height).toBeGreaterThan(0)
      expect(editor.getBoundingClientRect().width).toBeCloseTo(panel.getBoundingClientRect().width, 1)
    })
  }

  it('keeps existing pills directly editable without exposing add buttons', () => {
    addReferences()
    fixture.componentRef.setInput('requirements', [{ target: 'stat_gold', type: 'stat', amount: 3 }])
    fixture.componentRef.setInput('events', [{ id: 'gold', target: 'stat_gold', type: 'stat', amount: '2', action: 'alterStat' }])
    fixture.detectChanges()
    document.body.appendChild(host())
    expect(host().querySelector('polo-contextual-button')).toBeNull()
    host().querySelector<HTMLButtonElement>('.node__requirement')!.click()
    fixture.detectChanges()
    expect(host().querySelector('.addRequirement')).not.toBeNull()
    expect(host().querySelector('[role="menu"]')).toBeNull()
    fixture.debugElement.query(By.directive(NodeAddRequirementComponent)).componentInstance.onClose.emit()
    fixture.detectChanges()
    host().querySelector<HTMLButtonElement>('.node__event')!.click()
    fixture.detectChanges()
    expect(host().querySelector('.addEvent')).not.toBeNull()
  })

  it('keeps display unavailable without requirements and configures inheritance in a secondary panel', async () => {
    openMenu()
    const item = host().querySelector<HTMLButtonElement>('[aria-disabled="true"]')!
    expect(item.title).toContain('Add a requirement')
    choose('Display')
    expect(host().querySelector('polo-answer-display-select')).toBeNull()
    component.optionsPopover.close()
    fixture.componentRef.setInput('answerId', 'answer_2_0')
    fixture.componentRef.setInput('requirements', [{ target: 'stat_gold', type: 'stat', amount: 3 }])
    const save = spyOn(TestBed.inject(StoryEditorService), 'saveAnswerDisplay')
    openMenu()
    choose('Display')
    fixture.detectChanges()
    await new Promise<void>(resolve => setTimeout(resolve, 0))
    const select = host().querySelector<HTMLSelectElement>('select')!
    expect(select.value).toBe('inherit')
    expect(document.activeElement).toBe(select)
    select.value = 'locked'
    select.dispatchEvent(new Event('change'))
    fixture.detectChanges()
    expect(save).toHaveBeenCalledOnceWith('answer_2_0', 'locked')
    expect(host().querySelector('polo-answer-display-select')).toBeNull()
  })

  it('deletes only from the menu and closes it before notifying the node', () => {
    fixture.componentRef.setInput('answerId', 'answer_2_0')
    fixture.detectChanges()
    const remove = spyOn(component.onRemoveAnswer, 'emit')
    openMenu()
    choose('Delete answer')
    expect(remove).toHaveBeenCalledOnceWith('answer_2_0')
    expect(component.optionsPopover.isOpen).toBeFalse()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('offers focus editing for answer text', async () => {
    const editor = TestBed.inject(StoryEditorService)
    const save = spyOn(editor, 'updateAnswerText')
    fixture.componentRef.setInput('answerId', 'answer_2_0')
    fixture.detectChanges()
    const host = fixture.nativeElement as HTMLElement
    fixture.componentRef.setInput('text', 'Original answer')
    fixture.detectChanges()
    const preview = host.querySelector('.richTextField__preview') as HTMLElement
    expect(preview.textContent).toBe('Original answer')
    expect(host.querySelector('.richTextField__button')).toBeNull()
    openMenu()
    const focusButton = Array.from(host.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'))
      .find(button => button.textContent?.includes('Focus on Answer text'))!
    expect(focusButton.title).toContain('Focus on Answer text')
    expect(focusButton.querySelector('img')?.getAttribute('src')).toBe('/assets/icons/maximize.svg')
    focusButton.click()
    expect(component.optionsPopover.isOpen).toBeFalse()
    fixture.detectChanges()
    const [block] = await fixture.getDeferBlocks()
    await block.render(DeferBlockState.Complete)
    fixture.detectChanges()

    const dialog = host.querySelector('dialog') as HTMLDialogElement
    const content = dialog.querySelector('[contenteditable]') as HTMLElement
    expect(content.textContent).toBe('Original answer')
    content.textContent = 'New answer'
    content.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }))
    const closed = new Promise<void>((resolve) => dialog.addEventListener('close', () => resolve(), { once: true }))
    dialog.close()
    await closed
    expect(save).toHaveBeenCalledOnceWith('answer_2_0', '<p>New answer</p>')
  })
})
