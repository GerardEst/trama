import { Component } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { AnchoredPopoverComponent } from './anchored-popover.component'
import { AnchoredPopoverContentDirective } from './anchored-popover-content.directive'

@Component({
  standalone: true,
  imports: [AnchoredPopoverComponent, AnchoredPopoverContentDirective],
  template: `
    <polo-anchored-popover #popover>
      <button
        popoverTrigger
        type="button"
        [attr.aria-expanded]="popover.isOpen"
        (click)="popover.open()"
      >Open</button>
      <ng-template poloPopoverContent>
        <section role="dialog">
          Dialog content
          <button type="button" (click)="popover.close()">Close</button>
        </section>
      </ng-template>
    </polo-anchored-popover>
  `,
})
class PopoverHostComponent {}

describe('AnchoredPopoverComponent', () => {
  let fixture: ComponentFixture<PopoverHostComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopoverHostComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(PopoverHostComponent)
    fixture.detectChanges()
    document.body.appendChild(fixture.nativeElement)
  })

  afterEach(() => fixture.nativeElement.remove())

  it('renders its content lazily in the top layer and closes on outside click', async () => {
    const host: HTMLElement = fixture.nativeElement
    const button = host.querySelector<HTMLButtonElement>('button')!
    expect(host.querySelector('[role="dialog"]')).toBeNull()

    button.click()
    fixture.detectChanges()
    await new Promise<void>((resolve) => setTimeout(resolve, 0))

    const panel = host.querySelector<HTMLElement>('.anchoredPopover__panel')!
    expect(panel.matches(':popover-open')).toBeTrue()
    expect(panel.querySelector('[role="dialog"]')?.textContent).toContain('Dialog content')
    expect(document.activeElement).toBe(panel.querySelector('button'))
    expect(button.getAttribute('aria-expanded')).toBe('true')

    const outside = document.createElement('button')
    document.body.appendChild(outside)
    outside.focus()
    outside.click()
    fixture.detectChanges()
    expect(host.querySelector('[role="dialog"]')).toBeNull()
    expect(button.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(outside)
    outside.remove()
  })

  it('stays open after dragging outside but closes on the next outside click', async () => {
    const host: HTMLElement = fixture.nativeElement
    host.querySelector<HTMLButtonElement>('[popoverTrigger]')!.click()
    fixture.detectChanges()
    await new Promise<void>((resolve) => setTimeout(resolve, 0))

    const board = document.createElement('div')
    document.body.appendChild(board)
    board.dispatchEvent(new PointerEvent('pointerdown', {
      bubbles: true, clientX: 20, clientY: 20, pointerId: 1,
    }))
    board.dispatchEvent(new PointerEvent('pointermove', {
      bubbles: true, clientX: 80, clientY: 50, pointerId: 1,
    }))
    board.dispatchEvent(new PointerEvent('pointerup', {
      bubbles: true, clientX: 80, clientY: 50, pointerId: 1,
    }))
    board.dispatchEvent(new MouseEvent('click', {
      bubbles: true, clientX: 80, clientY: 50,
    }))
    fixture.detectChanges()

    expect(host.querySelector('.anchoredPopover__panel')).not.toBeNull()

    board.dispatchEvent(new PointerEvent('pointerdown', {
      bubbles: true, clientX: 80, clientY: 50, pointerId: 1,
    }))
    board.dispatchEvent(new MouseEvent('click', {
      bubbles: true, clientX: 80, clientY: 50,
    }))
    fixture.detectChanges()

    expect(host.querySelector('.anchoredPopover__panel')).toBeNull()
    board.remove()
  })

  it('still closes on an outside click with slight pointer movement', async () => {
    const host: HTMLElement = fixture.nativeElement
    host.querySelector<HTMLButtonElement>('[popoverTrigger]')!.click()
    fixture.detectChanges()

    const outside = document.createElement('button')
    document.body.appendChild(outside)
    outside.dispatchEvent(new PointerEvent('pointerdown', {
      bubbles: true, clientX: 20, clientY: 20,
    }))
    outside.dispatchEvent(new MouseEvent('click', {
      bubbles: true, clientX: 22, clientY: 21,
    }))
    fixture.detectChanges()

    expect(host.querySelector('.anchoredPopover__panel')).toBeNull()
    outside.remove()
  })

  it('restores focus to the trigger after closing from inside', async () => {
    const host: HTMLElement = fixture.nativeElement
    const trigger = host.querySelector<HTMLButtonElement>('[popoverTrigger]')!
    trigger.click()
    fixture.detectChanges()
    await new Promise<void>((resolve) => setTimeout(resolve, 0))

    const closeButton = host.querySelector<HTMLButtonElement>('[role="dialog"] button')!
    expect(document.activeElement).toBe(closeButton)
    closeButton.click()
    fixture.detectChanges()

    expect(host.querySelector('[role="dialog"]')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })

  it('closes on Escape and restores focus to the trigger', async () => {
    const host: HTMLElement = fixture.nativeElement
    const button = host.querySelector<HTMLButtonElement>('button')!
    button.click()
    fixture.detectChanges()
    await new Promise<void>((resolve) => setTimeout(resolve, 0))

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    fixture.detectChanges()

    expect(host.querySelector('[role="dialog"]')).toBeNull()
    expect(document.activeElement).toBe(button)
  })

  it('configures four-way placement and a viewport-safe fallback', async () => {
    const host: HTMLElement = fixture.nativeElement
    const button = host.querySelector<HTMLButtonElement>('button')!
    button.click()
    fixture.detectChanges()
    await new Promise<void>((resolve) => setTimeout(resolve, 0))

    const panel = host.querySelector<HTMLElement>('.anchoredPopover__panel')!
    const style = getComputedStyle(panel)
    expect(style.getPropertyValue('position-anchor')).toBe('--context-popover')
    expect(style.getPropertyValue('position-try-fallbacks')).toBe(
      'flip-inline, flip-block, flip-inline flip-block'
    )
    expect(style.getPropertyValue('position-try-order')).toBe('most-height')
    expect(parseFloat(style.maxHeight)).toBeLessThan(window.innerHeight)
  })
})
