import {
  Component,
  Output,
  EventEmitter,
  effect,
  Input,
  ViewChild,
  ElementRef,
} from '@angular/core'
import { join, node, node_answer } from 'src/app/core/interfaces/interfaces'
import { GameEngineService } from 'src/app/features/playground/services/game-engine.service'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { GameNodeComponent } from './components/game-node/game-node.component'

@Component({
  selector: 'polo-game',
  standalone: true,
  imports: [GameNodeComponent],
  templateUrl: './game.component.html',
  styleUrl: './game.component.sass',
})
export class GameComponent {
  @ViewChild('game') DOMgame!: ElementRef
  @Input() mode: 'cumulative' | 'single' = 'cumulative'

  activeNodes: any[] = []
  inactiveNodes: any[] = []

  gameInitialized: boolean = false

  @Output() onEndGame = new EventEmitter<void>()
  @Output() onSelectAnswer = new EventEmitter<node_answer>()
  @Output() onDrawNode = new EventEmitter<node>()

  constructor(
    public gameEngine: GameEngineService,
    public activeStory: ActiveStoryService
  ) {
    effect(() => {
      if (this.activeStory.entireTree().nodes.length > 0) {
        this.initializeGame()
      }
    })
  }

  initializeGame() {
    if (!this.gameInitialized) {
      this.gameInitialized = true
      this.nextStep([{ node: 'node_0' }])
    }
  }

  selectAnswer(answer: node_answer) {
    if (!answer.join?.length) return

    this.gameEngine.applyEvents(answer.events ?? [])
    this.registerAnswer(answer)
    this.nextStep(answer.join ?? [])
  }

  continueFlow(continueInfo: { property: string; value: string; join?: join[] }) {
    if (!continueInfo.join?.length) return
    this.gameEngine.alterProperty(continueInfo.property, continueInfo.value)
    this.nextStep(continueInfo.join)
  }

  // Each step can contain multiple nodes. Automatic transitions yield to the
  // browser to avoid recursing through a long (or cyclic) chain in one stack.
  nextStep(possibleJoins: Array<join>, addToCurrentStep: boolean = false) {
    if (!possibleJoins.length) return
    const chosenJoin = this.gameEngine.getRandomJoin(possibleJoins)
    let activeNode = this.gameEngine.buildNextNodeFromJoin(chosenJoin)

    if (activeNode.type === 'distributor') {
      this.gameEngine.applyEvents(activeNode.events ?? [])
      setTimeout(() => this.nextStep(this.gameEngine.distributeNode(activeNode), addToCurrentStep))
      return
    }

    if (!addToCurrentStep) {
      this.inactiveNodes = this.inactiveNodes.concat(this.activeNodes)
      this.activeNodes = []
    }

    this.gameEngine.applyEvents(activeNode.events ?? [])
    this.gameEngine.filterAvailableAnswers(activeNode)
    activeNode = this.gameEngine.interpolateNodeTexts(activeNode)
    this.activeNodes.push(activeNode)
    this.scrollToNewNode()
    this.notifyNodeDrawn(activeNode)

    if (activeNode.join?.length && activeNode.type !== 'text') {
      setTimeout(() => this.nextStep(activeNode.join ?? [], true))
    }
  }

  scrollToNewNode() {
    setTimeout(() => {
      const container = this.DOMgame?.nativeElement as HTMLElement | undefined
      const nodes = container?.querySelectorAll('polo-game-node')
      const latest = nodes?.item(nodes.length - 1) as HTMLElement | null
      if (!container || !latest) return
      container.scrollTo({ top: latest.offsetTop - container.offsetTop - 24, behavior: 'auto' })
    })
  }

  registerAnswer(answer: node_answer) {
    this.onSelectAnswer.emit(answer)
  }

  notifyNodeDrawn(node: node) {
    if (node.type !== 'distributor') this.onDrawNode.emit(node)
    if (node.type === 'end') this.onEndGame.emit()
  }
}
