import { Component, HostListener, input, output } from '@angular/core'

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

  onPointerDown(event: PointerEvent) {
    if (!this.dragHandle() || this.editing || (event.pointerType === 'mouse' && event.button !== 0)) {
      event.stopPropagation()
      return
    }
    this.pointerStart = { id: event.pointerId, x: event.clientX, y: event.clientY }
    this.moved = false
  }

  onMouseDown(event: MouseEvent) {
    if (!this.dragHandle() || this.editing || event.button !== 0) event.stopPropagation()
    else event.preventDefault() // Keep the input unfocused while CDK starts dragging from the header.
  }

  onTouchStart(event: TouchEvent) {
    if (!this.dragHandle() || this.editing) event.stopPropagation()
  }

  @HostListener('document:pointermove', ['$event'])
  onPointerMove(event: PointerEvent) {
    if (this.pointerStart?.id !== event.pointerId) return
    if (Math.hypot(event.clientX - this.pointerStart.x, event.clientY - this.pointerStart.y) > 5) {
      this.moved = true
    }
  }

  @HostListener('document:pointerup', ['$event'])
  onPointerUp(event: PointerEvent) {
    if (this.pointerStart?.id !== event.pointerId) return
    // A click follows pointerup; retain the movement result until it has fired.
    setTimeout(() => {
      if (this.pointerStart?.id === event.pointerId) {
        this.pointerStart = undefined
        this.moved = false
      }
    }, 0)
  }

  @HostListener('document:pointercancel', ['$event'])
  onPointerCancel(event: PointerEvent) {
    if (this.pointerStart?.id === event.pointerId) {
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
