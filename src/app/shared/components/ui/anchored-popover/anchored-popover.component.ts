import { NgTemplateOutlet } from '@angular/common'
import {
  ChangeDetectorRef,
  Component,
  ContentChild,
  DestroyRef,
  ElementRef,
  Input,
  Renderer2,
  ViewChild,
} from '@angular/core'
import { AnchoredPopoverContentDirective } from './anchored-popover-content.directive'

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

  @ViewChild('panel')
  set panel(element: ElementRef<HTMLElement> | undefined) {
    this.panelElement = element?.nativeElement
    if (element) {
      setTimeout(() => {
        const panel = element.nativeElement
        if (!panel.isConnected || !this.isOpen) return

        panel.showPopover()
        const preferredControl = this.initialFocusSelector
          ? panel.querySelector<HTMLElement>(this.initialFocusSelector)
          : null
        if (preferredControl) preferredControl.focus()
        else if (!panel.contains(document.activeElement)) {
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
    destroyRef: DestroyRef
  ) {
    destroyRef.onDestroy(() => this.stopListening?.())
  }

  open() {
    this.isOpen = true
    this.listenToDocument()
  }

  close() {
    const focusWasInside = this.panelElement?.contains(document.activeElement)
    this.pointerStart = undefined
    this.boardPanned = false
    this.isOpen = false
    this.stopListening?.()
    if (focusWasInside) this.focusTrigger()
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

    if (
      this.isOpen &&
      !event.composedPath().includes(this.elementRef.nativeElement)
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
