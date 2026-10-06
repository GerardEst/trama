import { Component } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { AnchoredPopoverComponent } from '../anchored-popover/anchored-popover.component'
import { AnchoredPopoverContentDirective } from '../anchored-popover/anchored-popover-content.directive'
import { ContextualButtonComponent } from './contextual-button.component'

@Component({
  standalone: true,
  imports: [ContextualButtonComponent, AnchoredPopoverComponent, AnchoredPopoverContentDirective],
  template: `
    <polo-anchored-popover #popover>
      <polo-contextual-button
        popoverTrigger
        text="Add event"
        ariaHasPopup="dialog"
        [ariaExpanded]="popover.isOpen"
        (click)="popover.open()"
      />
      <ng-template poloPopoverContent>
        <section role="dialog">
          <button type="button" (click)="popover.close()">Close</button>
        </section>
      </ng-template>
    </polo-anchored-popover>
  `,
})
class ContextualPopoverHostComponent {}

describe('ContextualButtonComponent', () => {
  let fixture: ComponentFixture<ContextualButtonComponent>
  let button: HTMLButtonElement

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ContextualButtonComponent] }).compileComponents()
    fixture = TestBed.createComponent(ContextualButtonComponent)
    fixture.componentRef.setInput('title', 'Add event')
    fixture.componentRef.setInput('icon', '/assets/icons/plus.svg')
    fixture.detectChanges()
    button = fixture.nativeElement.querySelector('button')
  })

  it('labels its native button when only the decorative icon is shown', () => {
    expect(button.type).toBe('button')
    expect(button.getAttribute('aria-label')).toBe('Add event')
    expect(button.querySelector('img')?.alt).toBe('')
    expect(button.querySelector('span')).toBeNull()
    expect(button.hasAttribute('aria-expanded')).toBeFalse()
  })

  it('renders text and passes popover accessibility to the native button', () => {
    fixture.componentRef.setInput('text', 'Add event')
    fixture.componentRef.setInput('ariaLabel', 'Add event to this node')
    fixture.componentRef.setInput('ariaHasPopup', 'dialog')
    fixture.componentRef.setInput('ariaExpanded', false)
    fixture.detectChanges()
    expect(button.textContent).toContain('Add event')
    expect(button.getAttribute('aria-label')).toBe('Add event to this node')
    expect(button.getAttribute('aria-haspopup')).toBe('dialog')
    expect(button.getAttribute('aria-expanded')).toBe('false')
  })

  it('does not emit a native click when disabled', () => {
    const clicked = jasmine.createSpy('clicked')
    fixture.nativeElement.addEventListener('click', clicked)
    fixture.componentRef.setInput('disabled', true)
    fixture.detectChanges()
    button.click()
    expect(button.disabled).toBeTrue()
    expect(clicked).not.toHaveBeenCalled()
  })
})

describe('ContextualButtonComponent with an anchored popover', () => {
  let fixture: ComponentFixture<ContextualPopoverHostComponent>
  let trigger: HTMLButtonElement

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ContextualPopoverHostComponent] }).compileComponents()
    fixture = TestBed.createComponent(ContextualPopoverHostComponent)
    fixture.detectChanges()
    document.body.appendChild(fixture.nativeElement)
    trigger = fixture.nativeElement.querySelector('polo-contextual-button button')
    trigger.focus()
    trigger.click()
    fixture.detectChanges()
    await new Promise<void>(resolve => setTimeout(resolve, 0))
  })

  afterEach(() => fixture.nativeElement.remove())

  it('opens the dialog and returns focus to the native trigger when closed inside', () => {
    const close = fixture.nativeElement.querySelector('[role="dialog"] button') as HTMLButtonElement
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(document.activeElement).toBe(close)
    close.click()
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull()
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(trigger)
  })

  it('returns focus to the native trigger on Escape', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })
})
