import { Component, EventEmitter, Input, Output } from '@angular/core'

@Component({
  selector: 'polo-toggle',
  standalone: true,
  imports: [],
  templateUrl: './toggle.component.html',
  styleUrl: './toggle.component.css',
})
export class ToggleComponent {
  @Input({ required: true }) label = ''
  @Input() checked = false
  @Input() disabled = false
  @Input() hideLabel = false

  @Output() checkedChange = new EventEmitter<boolean>()

  toggle() {
    if (this.disabled) return

    this.checked = !this.checked
    this.checkedChange.emit(this.checked)
  }
}
