import { Component, DestroyRef, NgZone, inject, input, output } from '@angular/core'

@Component({
  selector: 'polo-editable-name',
  standalone: true,
  templateUrl: './editable-name.component.html',
  styleUrl: './editable-name.component.css',
})
export class EditableNameComponent {
  readonly value = input('')
  readonly placeholder = input('')
  readonly label = input.required<string>()
  readonly valueChanged = output<string>()
  readonly dragHandle = input(false)

  editing = false
  private pointerStart?: { id: number; x: number; y: number }
  private moved = false
  private stopTracking?: () => void
  private readonly zone = inject(NgZone)

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stopTracking?.())
  }

  onPointerDown(event: PointerEvent) {
    if (!this.dragHandle() || this.editing || (event.pointerType === 'mouse' && event.button !== 0)) {
      event.stopPropagation()
      return
    }
    this.pointerStart = { id: event.pointerId, x: event.clientX, y: event.clientY }
    this.moved = false
    this.trackPointer()
  }

  // Every board node has a name, so permanent document listeners would run
  // change detection once per node on every pointer move. Listen only while
  // pressed, and outside Angular: the tracked state is never rendered.
  private trackPointer() {
    this.stopTracking?.()
    const move = (event: PointerEvent) => this.onPointerMove(event)
    const up = (event: PointerEvent) => this.onPointerUp(event)
    const cancel = (event: PointerEvent) => this.onPointerCancel(event)
    this.zone.runOutsideAngular(() => {
      document.addEventListener('pointermove', move)
      document.addEventListener('pointerup', up)
      document.addEventListener('pointercancel', cancel)
    })
    this.stopTracking = () => {
      document.removeEventListener('pointermove', move)
      document.removeEventListener('pointerup', up)
      document.removeEventListener('pointercancel', cancel)
      this.stopTracking = undefined
    }
  }

  onMouseDown(event: MouseEvent) {
    if (!this.dragHandle() || this.editing || event.button !== 0) event.stopPropagation()
    else event.preventDefault() // Keep the input unfocused while CDK starts dragging from the header.
  }

  onTouchStart(event: TouchEvent) {
    if (!this.dragHandle() || this.editing) event.stopPropagation()
  }

  private onPointerMove(event: PointerEvent) {
    if (this.pointerStart?.id !== event.pointerId) return
    if (Math.hypot(event.clientX - this.pointerStart.x, event.clientY - this.pointerStart.y) > 5) {
      this.moved = true
    }
  }

  private onPointerUp(event: PointerEvent) {
    if (this.pointerStart?.id !== event.pointerId) return
    this.stopTracking?.()
    // A click follows pointerup; retain the movement result until it has fired.
    setTimeout(() => {
      if (this.pointerStart?.id === event.pointerId) {
        this.pointerStart = undefined
        this.moved = false
      }
    }, 0)
  }

  private onPointerCancel(event: PointerEvent) {
    if (this.pointerStart?.id === event.pointerId) {
      this.stopTracking?.()
      this.pointerStart = undefined
      this.moved = false
    }
  }

  onClick(event: MouseEvent) {
    if (!this.dragHandle()) return
    if (!this.moved) {
      this.editing = true
      const input = event.target as HTMLInputElement
      input.focus()
    }
    this.pointerStart = undefined
  }

  onFocus() {
    // Keyboard navigation can still enter the name directly.
    if (this.dragHandle() && !this.pointerStart && !this.moved) this.editing = true
  }

  onBlur() {
    this.editing = false
    this.pointerStart = undefined
    this.moved = false
  }

  save(event: Event) {
    this.valueChanged.emit((event.target as HTMLInputElement).value)
  }
}
