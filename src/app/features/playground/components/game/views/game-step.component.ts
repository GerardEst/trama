import { ChangeDetectionStrategy, Component, input, output } from '@angular/core'
import { node_answer } from 'src/app/core/interfaces/interfaces'
import { PlayableNode, TextContinuation } from '../../../services/game-session.types'
import { GameNodeComponent } from '../components/game-node/game-node.component'

@Component({
  selector: 'polo-game-step',
  standalone: true,
  imports: [GameNodeComponent],
  templateUrl: './game-step.component.html',
  styleUrl: './game-step.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameStepComponent {
  readonly nodes = input<PlayableNode[]>([])
  readonly disabled = input(false)
  readonly answerSelected = output<node_answer>()
  readonly continued = output<TextContinuation>()
}
