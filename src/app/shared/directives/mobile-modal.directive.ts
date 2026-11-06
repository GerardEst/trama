import { DestroyRef, Directive, ElementRef, afterNextRender, effect, inject, output, signal, untracked } from '@angular/core'
import { ViewportService } from 'src/app/core/services/viewport.service'

/**
 * Shows an in-place menu as a centered modal on phones. The board is a scaled,
 * panned element, so a floating menu there is tiny and often off screen; the
 * top layer escapes that transform. Desktop keeps the element where it is, and
 * the menu switches if the viewport crosses the breakpoint while it is open.
 * Put it only on elements that are rendered while open, close them on
 * `mobileModalDismiss` (a tap outside the menu), and drop any inline
 * position on phones, since the modal is centered by `.mobileModal`.
 */
@Directive({
  selector: '[poloMobileModal]',
  standalone: true,
  host: {
    // Keep board gestures (pan, node drag) from starting inside the menu.
    '(touchstart)': '$event.stopPropagation()',
  },
})
export class MobileModalDirective {
  readonly mobileModalDismiss = output<void>()
  private readonly panel = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement
  private backdrop?: HTMLElement

  constructor() {
    const viewport = inject(ViewportService)
    const rendered = signal(false)
    afterNextRender(() => rendered.set(true))
    effect(() => {
      const mobile = viewport.mobile()
      if (!rendered()) return
      untracked(() => mobile ? this.show() : this.hide())
    })
    inject(DestroyRef).onDestroy(() => this.hide())
  }

  private show() {
    const panel = this.panel
    if (this.backdrop || !panel.isConnected || typeof panel.showPopover !== 'function') return
    // A popover's ::backdrop lets taps through to the board, so block them with a real
    // element opened just before the menu, which stacks it right below.
    const backdrop = document.createElement('div')
    backdrop.className = 'mobileModal__backdrop'
    backdrop.setAttribute('popover', 'manual')
    backdrop.setAttribute('aria-hidden', 'true')
    backdrop.addEventListener('click', () => this.mobileModalDismiss.emit())
    document.body.appendChild(backdrop)
    backdrop.showPopover()
    this.backdrop = backdrop

    panel.setAttribute('popover', 'manual')
    panel.classList.add('mobileModal')
    panel.showPopover()
  }

  private hide() {
    if (!this.backdrop) return
    this.backdrop.remove()
    this.backdrop = undefined
    if (this.panel.matches(':popover-open')) this.panel.hidePopover()
    this.panel.removeAttribute('popover')
    this.panel.classList.remove('mobileModal')
  }
}
