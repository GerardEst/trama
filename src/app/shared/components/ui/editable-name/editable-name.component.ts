import { Component, input, output } from '@angular/core'

@Component({
  selector: 'polo-editable-name',
  standalone: true,
  templateUrl: './editable-name.component.html',
  styleUrl: './editable-name.component.sass',
})
export class EditableNameComponent {
  readonly value = input('')
  readonly placeholder = input('')
  readonly label = input.required<string>()
  readonly valueChanged = output<string>()

  save(event: Event) {
    this.valueChanged.emit((event.target as HTMLInputElement).value)
  }
}
