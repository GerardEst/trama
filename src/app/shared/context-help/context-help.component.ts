import { DOCUMENT } from '@angular/common'
import {
  Component,
  computed,
  ElementRef,
  inject,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core'
import { I18nService } from 'src/app/core/i18n/i18n.service'
import { ContextHelpService } from './context-help.service'
import { CONTEXT_HELP_TOPICS, ContextHelpTopic } from './context-help.topics'

let nextHelpId = 0

@Component({
  selector: 'polo-context-help',
  standalone: true,
  templateUrl: './context-help.component.html',
  styleUrl: './context-help.component.css',
  host: {
    '[class.contextHelp--disabled]': '!help.enabled()',
    '(pointerdown)': '$event.stopPropagation()',
    '(mousedown)': '$event.stopPropagation()',
    '(touchstart)': '$event.stopPropagation()',
    '(click)': '$event.stopPropagation()',
  },
})
export class ContextHelpComponent implements OnDestroy {
  @Input({ required: true }) topic!: ContextHelpTopic

  readonly help = inject(ContextHelpService)
  readonly i18n = inject(I18nService)
  readonly id = `context-help-${nextHelpId++}`
  readonly isOpen = computed(() => this.help.enabled() && this.help.activeId() === this.id)
  private readonly document = inject(DOCUMENT)
  private triggerElement?: HTMLButtonElement
  private panelElement?: HTMLElement
  private openTimer?: ReturnType<typeof setTimeout>
  private closeTimer?: ReturnType<typeof setTimeout>
  private renderTimer?: ReturnType<typeof setTimeout>
  private listeners?: AbortController
  private observer?: ResizeObserver
  private focused = false
  private hovered = false
  private pinned = false

  get copy() {
    return CONTEXT_HELP_TOPICS[this.topic]
  }

  @ViewChild('trigger')
  set trigger(element: ElementRef<HTMLButtonElement> | undefined) {
    this.triggerElement = element?.nativeElement
    if (!element) {
      this.cancelTimers()
      this.focused = false
      this.hovered = false
      this.pinned = false
    }
  }

  @ViewChild('panel')
  set panel(element: ElementRef<HTMLElement> | undefined) {
    this.cleanupPanel()
    this.panelElement = element?.nativeElement
    if (!element) {
      this.pinned = false
      return
    }

    // Wait until Angular has attached the conditional view to the document.
    this.renderTimer = setTimeout(() => {
      const panel = element.nativeElement
      if (!panel.isConnected || !this.isOpen()) return

      // The top layer escapes clipped/zoomed board containers without moving focus.
      panel.showPopover()
      this.positionPanel()
      this.listenWhileOpen()
      this.observer = new ResizeObserver(() => this.positionPanel())
      this.observer.observe(panel)
    })
  }

  onPointerEnter(event: PointerEvent) {
    if (event.pointerType === 'touch') return
    this.hovered = true
    this.cancelTimers()
    if (!this.isOpen()) {
      this.openTimer = setTimeout(() => this.help.open(this.id), 250)
    }
  }

  onPointerLeave() {
    this.hovered = false
    this.scheduleClose()
  }

  onFocus() {
    this.focused = true
    this.cancelTimers()
    this.help.open(this.id)
  }

  onBlur() {
    this.focused = false
    this.scheduleClose()
  }

  onClick() {
    // Focus/hover may already have opened the help: the first click pins it.
    if (this.pinned) this.close()
    else {
      this.pinned = true
      this.cancelTimers()
      this.help.open(this.id)
    }
  }

  onPanelEnter() {
    this.hovered = true
    this.cancelTimers()
  }

  close(restoreFocus = false) {
    // Restore before closing: the trigger's focus handler would otherwise reopen help.
    if (restoreFocus && this.panelElement?.contains(this.document.activeElement)) {
      this.triggerElement?.focus()
    }
    this.pinned = false
    this.cancelTimers()
    this.help.close(this.id)
  }

  ngOnDestroy() {
    this.close()
    this.cleanupPanel()
  }

  private scheduleClose() {
    this.cancelTimers()
    if (!this.pinned && !this.focused && !this.hovered) {
      // Keep the panel reachable across the small gap next to the question mark.
      this.closeTimer = setTimeout(() => this.close(), 180)
    }
  }

  private cancelTimers() {
    clearTimeout(this.openTimer)
    clearTimeout(this.closeTimer)
    this.openTimer = undefined
    this.closeTimer = undefined
  }

  private cleanupPanel() {
    clearTimeout(this.renderTimer)
    this.listeners?.abort()
    this.observer?.disconnect()
    this.listeners = undefined
    this.observer = undefined
    if (this.panelElement?.isConnected && this.panelElement.matches(':popover-open')) {
      this.panelElement.hidePopover()
    }
  }

  private listenWhileOpen() {
    const controller = new AbortController()
    this.listeners = controller
    const options = { capture: true, signal: controller.signal }
    this.document.addEventListener('pointerdown', (event) => {
      const path = event.composedPath()
      if (!path.includes(this.triggerElement!) && !path.includes(this.panelElement!)) this.close()
    }, options)
    this.document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return
      // Dismiss help first, not the surrounding editor/dialog.
      event.stopImmediatePropagation()
      event.preventDefault()
      this.close(true)
    }, options)
    this.document.addEventListener('scroll', () => this.positionPanel(), options)
    this.document.addEventListener('wheel', (event) => {
      if (!event.composedPath().includes(this.panelElement!)) this.close()
    }, options)
    this.document.addEventListener('poloBoardPanStart', () => this.close(), options)
    this.document.defaultView?.addEventListener('resize', () => this.positionPanel(), options)
  }

  private positionPanel() {
    const panel = this.panelElement
    const trigger = this.triggerElement
    const viewport = this.document.defaultView
    if (!panel || !trigger || !viewport || !this.isOpen()) return

    const anchor = trigger.getBoundingClientRect()
    const margin = 12
    const gap = 6
    const width = panel.offsetWidth
    const height = panel.offsetHeight
    const below = anchor.bottom + gap
    const top = below + height <= viewport.innerHeight - margin
      ? below
      : anchor.top - height - gap
    const left = Math.max(margin, Math.min(anchor.left, viewport.innerWidth - width - margin))
    panel.style.left = `${left}px`
    panel.style.top = `${Math.max(margin, Math.min(top, viewport.innerHeight - height - margin))}px`
  }
}
