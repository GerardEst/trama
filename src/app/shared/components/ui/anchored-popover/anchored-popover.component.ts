import { NgTemplateOutlet } from '@angular/common'
import {
  Component,
  ContentChild,
  ElementRef,
  HostListener,
  Input,
  ViewChild,
} from '@angular/core'
import { AnchoredPopoverContentDirective } from './anchored-popover-content.directive'

// Project a [popoverTrigger] button and an <ng-template poloPopoverContent>.
@Component({
  selector: 'polo-anchored-popover',
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './anchored-popover.component.html',
  styleUrl: './anchored-popover.component.sass',
})
export class AnchoredPopoverComponent {
  // Editors with multi-step Escape behavior can dismiss themselves instead.
  @Input() closeOnEscape = true

  @ContentChild(AnchoredPopoverContentDirective)
  popoverContent?: AnchoredPopoverContentDirective

  private panelElement?: HTMLElement
  private pointerStart?: { x: number; y: number }
  private boardPanned = false

  @ViewChild('panel')
  set panel(element: ElementRef<HTMLElement> | undefined) {
    this.panelElement = element?.nativeElement
    if (element) {
      setTimeout(() => {
        const panel = element.nativeElement
        if (!panel.isConnected || !this.isOpen) return

        panel.showPopover()
        if (!panel.contains(document.activeElement)) {
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

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  open() {
    this.isOpen = true
  }

  close() {
    const focusWasInside = this.panelElement?.contains(document.activeElement)
    this.pointerStart = undefined
    this.boardPanned = false
    this.isOpen = false
    if (focusWasInside) this.focusTrigger()
  }

  private focusTrigger() {
    this.elementRef.nativeElement
      .querySelector<HTMLElement>('[popoverTrigger]')
      ?.focus()
  }

  @HostListener('document:pointerdown', ['$event'])
  onPointerDown(event: PointerEvent) {
    if (this.isOpen) {
      this.boardPanned = false
      this.pointerStart = { x: event.clientX, y: event.clientY }
    }
  }

  @HostListener('document:poloBoardPanStart')
  onBoardPanStart() {
    if (this.isOpen) this.boardPanned = true
  }

  @HostListener('document:pointercancel')
  onPointerCancel() {
    this.pointerStart = undefined
  }

  @HostListener('document:keydown')
  onKeyDown() {
    this.pointerStart = undefined
    this.boardPanned = false
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
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

  @HostListener('document:keydown.escape')
  onEscape() {
    if (!this.isOpen || !this.closeOnEscape) return

    this.close()
    this.focusTrigger()
  }
}
