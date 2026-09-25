import { ComponentFixture, TestBed } from '@angular/core/testing'

import { NodeEventComponent } from './node-event.component'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'

describe('NodeEventComponent', () => {
  let component: NodeEventComponent
  let fixture: ComponentFixture<NodeEventComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NodeEventComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(NodeEventComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  afterEach(() => fixture.nativeElement.remove())

  it('shows the referenced name instead of the event target ID', () => {
    TestBed.inject(ActiveStoryService).load('story-1', 'Story', {
      refs: { condition_12: { name: 'Ancient key', type: 'condition' } },
      nodes: [],
    })
    component.type = 'condition'
    component.target = 'condition_12'
    component.amount = '1'
    fixture.detectChanges()

    const pill = fixture.nativeElement.querySelector('.node__event')
    expect(pill.textContent).toContain('Ancient key')
    expect(pill.textContent).not.toContain('12')
  })

  it('opens the Edit event dialog in an anchored popover', async () => {
    component.type = 'stat'
    component.target = 'stat_courage'
    component.amount = '3'
    fixture.detectChanges()

    const host: HTMLElement = fixture.nativeElement
    document.body.appendChild(host)
    const button = host.querySelector<HTMLButtonElement>('.node__event')!
    button.click()
    fixture.detectChanges()
    await new Promise<void>((resolve) => setTimeout(resolve, 50))

    const panel = host.querySelector<HTMLElement>('.anchoredPopover__panel')!
    expect(panel.matches(':popover-open')).toBeTrue()
    expect(panel.querySelector('[role="dialog"]')?.textContent).toContain(
      'Edit event'
    )
    expect(panel.querySelector('.addEvent__button--delete')).not.toBeNull()
    expect(button.getAttribute('aria-expanded')).toBe('true')
  })

  it('does not steal focus when clicking a control outside the editor', async () => {
    component.type = 'stat'
    component.target = 'stat_courage'
    component.amount = '3'
    fixture.detectChanges()

    const host: HTMLElement = fixture.nativeElement
    document.body.appendChild(host)
    host.querySelector<HTMLButtonElement>('.node__event')!.click()
    fixture.detectChanges()
    await new Promise<void>((resolve) => setTimeout(resolve, 50))

    const outside = document.createElement('button')
    document.body.appendChild(outside)
    outside.focus()
    outside.click()
    fixture.detectChanges()

    expect(host.querySelector('.anchoredPopover__panel')).toBeNull()
    expect(document.activeElement).toBe(outside)
    outside.remove()
  })

  it('keeps the editor open on Escape while confirming deletion', async () => {
    component.type = 'stat'
    component.target = 'stat_courage'
    component.amount = '3'
    fixture.detectChanges()

    const host: HTMLElement = fixture.nativeElement
    document.body.appendChild(host)
    const trigger = host.querySelector<HTMLButtonElement>('.node__event')!
    trigger.click()
    fixture.detectChanges()
    await new Promise<void>((resolve) => setTimeout(resolve, 50))

    host.querySelector<HTMLButtonElement>('.addEvent__button--delete')!.click()
    fixture.detectChanges()
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
    )
    fixture.detectChanges()

    expect(host.querySelector('.anchoredPopover__panel')).not.toBeNull()
    expect(host.querySelector('.addEvent__button--confirmDelete')).toBeNull()

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
    )
    fixture.detectChanges()
    expect(host.querySelector('.anchoredPopover__panel')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })
})
