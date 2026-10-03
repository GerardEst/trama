import { Directive, ElementRef, Injector, OnDestroy, afterNextRender, inject, output } from '@angular/core'
import { SortableDragFeedback } from './sortable-drag-feedback'

export interface SortableMove {
  id: string
  toIndex: number
}

/** Model-independent sorting. Items use data-sortable-id; buttons use data-sortable-handle.
 * Pointer coordinates and item bounds are both viewport-relative, including under CSS zoom/transforms.
 * Only a completed drop emits a move; Escape, pointercancel and lost capture leave the model untouched.
 */
@Directive({
  selector: '[poloSortableList]',
  standalone: true,
  host: {
    '(pointerdown)': 'start($event)',
    '(pointermove)': 'move($event)',
    '(pointerup)': 'finish($event)',
    '(pointercancel)': 'cancel()',
    '(lostpointercapture)': 'cancel()',
    '(keydown)': 'key($event)',
  },
})
export class SortableListDirective implements OnDestroy {
  readonly sorted = output<SortableMove>()
  readonly sorting = output<boolean>()
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement
  private readonly injector = inject(Injector)
  private drag?: { pointerId: number; item: HTMLElement; startX: number; startY: number; toIndex: number; moved: boolean }
  private feedback?: SortableDragFeedback

  private items(): HTMLElement[] {
    return Array.from(this.element.children).filter((child): child is HTMLElement =>
      child instanceof HTMLElement && child.hasAttribute('data-sortable-id'))
  }

  private handleItem(target: EventTarget | null): HTMLElement | undefined {
    if (!(target instanceof Element)) return undefined
    const handle = target.closest('[data-sortable-handle]')
    const item = handle?.closest<HTMLElement>('[data-sortable-id]')
    return item?.parentElement === this.element ? item : undefined
  }

  start(event: PointerEvent) {
    const item = this.handleItem(event.target)
    if (!item || event.button !== 0 || !event.isPrimary || this.drag) return
    event.stopPropagation()
    event.preventDefault()
    const handle = (event.target as HTMLElement).closest<HTMLElement>('[data-sortable-handle]')
    handle?.focus()
    this.drag = { pointerId: event.pointerId, item, startX: event.clientX, startY: event.clientY, toIndex: this.items().indexOf(item), moved: false }
    this.sorting.emit(true)
    this.element.setPointerCapture(event.pointerId)
  }

  move(event: PointerEvent) {
    const drag = this.drag
    if (!drag || event.pointerId !== drag.pointerId) return
    event.stopPropagation()
    if (!drag.moved) {
      if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 5) return
      this.feedback = new SortableDragFeedback(drag.item, { x: drag.startX, y: drag.startY })
      drag.moved = true
      drag.item.setAttribute('data-sortable-dragging', '')
    }
    this.feedback?.move({ x: event.clientX, y: event.clientY })
    this.feedback?.hideInsertion()
    // Dropping outside this list is a cancellation, never a transfer to another node.
    const bounds = this.element.getBoundingClientRect()
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
      drag.toIndex = this.items().indexOf(drag.item)
      return
    }
    const others = this.items().filter(item => item !== drag.item)
    const index = others.findIndex(item => {
      const rect = item.getBoundingClientRect()
      return event.clientY < rect.top + rect.height / 2
    })
    drag.toIndex = index < 0 ? others.length : index
    if (drag.toIndex === this.items().indexOf(drag.item)) return
    const target = others[index < 0 ? others.length - 1 : index]
    if (target) this.feedback?.showInsertion(this.items(), target, index < 0)
  }

  finish(event: PointerEvent) {
    if (!this.drag || event.pointerId !== this.drag.pointerId) return
    this.move(event)
    const { item, toIndex, moved } = this.drag
    const changed = moved && toIndex !== this.items().indexOf(item)
    this.cancel()
    if (changed) this.emitMove(item, toIndex)
  }

  key(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.drag) {
      event.stopPropagation()
      event.preventDefault()
      this.cancel()
      return
    }
    const item = this.handleItem(event.target)
    if (!item || this.drag || !['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return
    event.stopPropagation()
    event.preventDefault()
    const items = this.items()
    const index = items.indexOf(item)
    const toIndex = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : index + (event.key === 'ArrowUp' ? -1 : 1)
    if (toIndex >= 0 && toIndex < items.length && toIndex !== index) {
      this.emitMove(item, toIndex)
    }
  }

  private emitMove(item: HTMLElement, toIndex: number) {
    const handle = item.querySelector<HTMLElement>('[data-sortable-handle]')
    // Moving an existing DOM node can still lose native focus (notably in WebKit).
    afterNextRender(() => {
      if (handle?.isConnected) handle.focus({ preventScroll: true })
    }, { injector: this.injector })
    this.sorted.emit({ id: item.dataset['sortableId']!, toIndex })
  }

  cancel() {
    const drag = this.drag
    if (!drag) return
    this.drag = undefined
    drag.item.removeAttribute('data-sortable-dragging')
    this.feedback?.destroy()
    this.feedback = undefined
    if (this.element.hasPointerCapture(drag.pointerId)) this.element.releasePointerCapture(drag.pointerId)
    this.sorting.emit(false)
  }

  ngOnDestroy() { this.cancel() }
}
