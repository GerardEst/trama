import { Component, EventEmitter, Input, Output } from '@angular/core'

@Component({
  selector: 'polo-game-answer',
  standalone: true,
  templateUrl: './game-answer.component.html',
  styleUrl: './game-answer.component.css',
})
export class GameAnswerComponent {
  @Input() text = ''
  @Input() disabled = false
  @Input() selected = false
  @Output() chosen = new EventEmitter<void>()
}
