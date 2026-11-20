import { NgTemplateOutlet } from '@angular/common'
import {
  ChangeDetectorRef,
  Component,
  ContentChild,
  DestroyRef,
  ElementRef,
  Input,
  NgZone,
  Renderer2,
  ViewChild,
} from '@angular/core'
import { AnchoredPopoverContentDirective } from './anchored-popover-content.directive'
import { activeElementIn } from 'src/app/shared/utils/dom'
import { isMobileLayout } from 'src/app/core/constants'

/** Space between the trigger and the panel, and between the panel and the viewport edges. */
const TRIGGER_GAP = 12
const VIEWPORT_MARGIN = 16

/**
 * Beside the trigger, towards the end of the line, or before it when it does not fit; top-aligned
 * with it and kept inside the viewport. Takes the trigger's on-screen box, so a zoomed or panned
 * board, whose transform CSS anchor positioning ignores, still opens the panel next to it.
 */
export function placeBeside(
  trigger: Pick<DOMRect, 'top' | 'left' | 'right'>,
  panel: { width: number; height: number },
  viewport: { width: number; height: number }
): { top: number; left: number } {
  const maxLeft = viewport.width - VIEWPORT_MARGIN - panel.width
  let left = trigger.right + TRIGGER_GAP
  if (left > maxLeft) {
    const before = trigger.left - TRIGGER_GAP - panel.width
    left = before >= VIEWPORT_MARGIN ? before : Math.max(VIEWPORT_MARGIN, maxLeft)
  }
  const top = Math.max(VIEWPORT_MARGIN, Math.min(trigger.top, viewport.height - VIEWPORT_MARGIN - panel.height))
  return { top, left }
}

// Project a [popoverTrigger] button and an <ng-template poloPopoverContent>.
@Component({
  selector: 'polo-anchored-popover',
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './anchored-popover.component.html',
  styleUrl: './anchored-popover.component.css',
})
export class AnchoredPopoverComponent {
  // Editors with multi-step Escape behavior can dismiss themselves instead.
  @Input() closeOnEscape = true
  @Input() initialFocusSelector = ''

  @ContentChild(AnchoredPopoverContentDirective)
  popoverContent?: AnchoredPopoverContentDirective

  private panelElement?: HTMLElement
  private pointerStart?: { x: number; y: number }
  private boardPanned = false
  private stopListening?: () => void
  private trackingFrame?: number

  @ViewChild('panel')
  set panel(element: ElementRef<HTMLElement> | undefined) {
    this.panelElement = element?.nativeElement
    if (element) {
      setTimeout(() => {
        const panel = element.nativeElement
        if (!panel.isConnected || !this.isOpen) return

        panel.showPopover()
        this.trackTrigger(panel)
        const preferredControl = this.initialFocusSelector
          ? panel.querySelector<HTMLElement>(this.initialFocusSelector)
          : null
        if (preferredControl) preferredControl.focus()
        else if (!panel.contains(activeElementIn(panel))) {
          const firstControl = panel.querySelector<HTMLElement>(
            '[autofocus], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
          if (firstControl) firstControl.focus()
          else panel.focus()
        }
      })
    }
  }

  isOpen = false

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    private changeDetector: ChangeDetectorRef,
    private zone: NgZone,
    destroyRef: DestroyRef
  ) {
    destroyRef.onDestroy(() => {
      this.stopListening?.()
      this.stopTracking()
    })
  }

  open() {
    this.isOpen = true
    this.listenToDocument()
  }

  close() {
    const panel = this.panelElement
    const focusWasInside = panel ? panel.contains(activeElementIn(panel)) : false
    this.pointerStart = undefined
    this.boardPanned = false
    this.isOpen = false
    this.stopListening?.()
    this.stopTracking()
    if (focusWasInside) this.focusTrigger()
  }

  /**
   * Keeps the open panel beside its trigger while the board pans or zooms and while its content
   * grows. Only one panel is open at a time, and the frames run outside Angular and stop on close.
   */
  private trackTrigger(panel: HTMLElement) {
    this.stopTracking()
    const trigger = this.elementRef.nativeElement.querySelector<HTMLElement>('.anchoredPopover__trigger')
    if (!trigger) return
    let placed = ''
    const place = () => {
      // Phones open it as a centred modal, laid out by its CSS.
      if (isMobileLayout()) return
      const { top, left } = placeBeside(
        trigger.getBoundingClientRect(),
        { width: panel.offsetWidth, height: panel.offsetHeight },
        { width: window.innerWidth, height: window.innerHeight }
      )
      const position = `${Math.round(top)},${Math.round(left)}`
      if (position === placed) return
      placed = position
      panel.style.setProperty('--anchored-popover-top', `${Math.round(top)}px`)
      panel.style.setProperty('--anchored-popover-left', `${Math.round(left)}px`)
    }
    place()
    this.zone.runOutsideAngular(() => {
      const follow = () => {
        if (!panel.isConnected) return this.stopTracking()
        place()
        this.trackingFrame = requestAnimationFrame(follow)
      }
      this.trackingFrame = requestAnimationFrame(follow)
    })
  }

  private stopTracking() {
    if (this.trackingFrame !== undefined) cancelAnimationFrame(this.trackingFrame)
    this.trackingFrame = undefined
  }

  // A board renders hundreds of closed popovers. Permanent document listeners
  // would run change detection once per popover on every click and keypress,
  // and every handler is a no-op while closed.
  private listenToDocument() {
    if (this.stopListening) return
    // Like a HostListener, mark OnPush ancestors so a dismissal re-renders them.
    const listen = <T extends Event>(eventName: string, handler: (event: T) => void) =>
      this.renderer.listen('document', eventName, (event: T) => {
        handler(event)
        this.changeDetector.markForCheck()
      })
    const listeners = [
      listen('pointerdown', (event: PointerEvent) => this.onPointerDown(event)),
      listen('poloBoardPanStart', () => this.onBoardPanStart()),
      listen('pointercancel', () => this.onPointerCancel()),
      listen('keydown', () => this.onKeyDown()),
      listen('click', (event: MouseEvent) => this.onDocumentClick(event)),
      listen('keydown.escape', () => this.onEscape()),
    ]
    this.stopListening = () => {
      listeners.forEach((stop) => stop())
      this.stopListening = undefined
    }
  }

  private focusTrigger() {
    const trigger = this.elementRef.nativeElement.querySelector<HTMLElement>('[popoverTrigger]')
    // A projected button component exposes its native control inside the host.
    const control = trigger?.querySelector<HTMLButtonElement>('button:not([disabled])') ?? trigger
    control?.focus()
  }

  private onPointerDown(event: PointerEvent) {
    if (this.isOpen) {
      this.boardPanned = false
      this.pointerStart = { x: event.clientX, y: event.clientY }
    }
  }

  private onBoardPanStart() {
    if (this.isOpen) this.boardPanned = true
  }

  private onPointerCancel() {
    this.pointerStart = undefined
  }

  private onKeyDown() {
    this.pointerStart = undefined
    this.boardPanned = false
  }

  private onDocumentClick(event: MouseEvent) {
    const start = this.pointerStart
    const boardPanned = this.boardPanned
    this.pointerStart = undefined
    this.boardPanned = false
    // Panzoom can swallow the initial pointer event, so use its panstart signal too.
    if (
      boardPanned ||
      (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 5)
    ) return

    // A click on the panel itself landed on its empty area or, on phones, its backdrop.
    if (
      this.isOpen &&
      (event.target === this.panelElement ||
        !event.composedPath().includes(this.elementRef.nativeElement))
    ) {
      this.close()
    }
  }

  private onEscape() {
    if (!this.isOpen || !this.closeOnEscape) return

    this.close()
    this.focusTrigger()
  }
}
