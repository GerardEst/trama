import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core'
import { join, node_answer } from 'src/app/core/interfaces/interfaces'
import { GameAnswerComponent } from '../game-answer/game-answer.component'
import { GameTextInputComponent } from '../game-text-input/game-text-input.component'
import { GameEndActionsComponent } from '../game-end-actions/game-end-actions.component'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'

@Component({
  selector: 'polo-game-node',
  standalone: true,
  imports: [GameAnswerComponent, GameTextInputComponent, GameEndActionsComponent],
  templateUrl: './game-node.component.html',
  styleUrl: './game-node.component.sass',
})
export class GameNodeComponent {
  @ViewChild('node') node!: ElementRef<HTMLElement>
  @Input() data!: any
  @Input() disabled = false
  @Output() onSelectAnswer = new EventEmitter<node_answer>()
  @Output() onContinue = new EventEmitter<{ property: string; value: string; join?: join[] }>()

  constructor(public activeStory: ActiveStoryService) {}

  chooseAnswer(answer: node_answer) {
    if (this.disabled) return
    this.data.selectedAnswerId = answer.id
    this.onSelectAnswer.emit(answer)
  }

  continue(value: string) {
    if (this.disabled) return
    this.data.userResponse = value
    this.onContinue.emit({
      property: this.data.userTextOptions?.property ?? '',
      value,
      join: this.data.join,
    })
  }

  getNativeElement(): HTMLElement {
    return this.node?.nativeElement
  }
}
