import { ChangeDetectionStrategy, Component, input, output } from '@angular/core'
import { node_answer } from 'src/app/core/interfaces/interfaces'
import { PlayableNode, TextContinuation } from '../../../services/game-session.types'
import { GameStepComponent } from './game-step.component'

@Component({
  selector: 'polo-cumulative-game',
  standalone: true,
  imports: [GameStepComponent],
  templateUrl: './cumulative-game.component.html',
  styleUrl: './cumulative-game.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CumulativeGameComponent {
  readonly nodes = input<PlayableNode[]>([])
  readonly previousNodes = input<PlayableNode[]>([])
  readonly answerSelected = output<node_answer>()
  readonly continued = output<TextContinuation>()
}
