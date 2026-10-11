import { Component, EventEmitter, Input, Output } from '@angular/core'

import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'

@Component({
  selector: 'polo-game-answer',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './game-answer.component.html',
  styleUrl: './game-answer.component.css',
})
export class GameAnswerComponent {
  @Input() locked = false
  @Input() missingRequirements: string[] = []
  @Input() text = ''
  @Input() disabled = false
  @Input() selected = false
  @Output() chosen = new EventEmitter<void>()
}
