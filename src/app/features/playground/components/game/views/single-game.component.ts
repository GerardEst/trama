import { ChangeDetectionStrategy, Component, input, output } from '@angular/core'
import { node_answer } from 'src/app/core/interfaces/interfaces'
import { PlayableNode, TextContinuation } from '../../../services/game-session.types'
import { GameStepComponent } from './game-step.component'

@Component({
  selector: 'polo-single-game',
  standalone: true,
  imports: [GameStepComponent],
  templateUrl: './single-game.component.html',
  styleUrl: './single-game.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SingleGameComponent {
  readonly nodes = input<PlayableNode[]>([])
  readonly answerSelected = output<node_answer>()
  readonly continued = output<TextContinuation>()
}
