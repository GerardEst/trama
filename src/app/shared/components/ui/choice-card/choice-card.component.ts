import { Component, EventEmitter, Input, Output } from '@angular/core'

@Component({
  selector: 'polo-choice-card',
  standalone: true,
  imports: [],
  templateUrl: './choice-card.component.html',
  styleUrl: './choice-card.component.sass',
})
export class ChoiceCardComponent {
  @Input() icon?: string
  @Input() label: string = ''
  @Input() description: string = ''
  @Input() selected: boolean = false
  @Input() disabled: boolean = false

  @Output() chosen = new EventEmitter<void>()
}
