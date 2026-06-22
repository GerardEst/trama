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
import { normalizeLink } from 'src/app/shared/utils/normalizers'
import { trigger, style, transition, animate } from '@angular/animations'
import { GameNodeComponent } from './components/game-node/game-node.component'

@Component({
  selector: 'polo-game',
  standalone: true,
  imports: [GameNodeComponent],
  templateUrl: './game.component.html',
  styleUrl: './game.component.sass',
  animations: [
    trigger('insertNode', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms', style({ opacity: 1 })),
      ]),
    ]),
    trigger('removeNode', [
      transition(':leave', [
        style({ opacity: 1 }),
        animate('200ms', style({ opacity: 0 })),
      ]),
    ]),
    trigger('insertInactiveNode', [
      transition(':enter', [
        style({ opacity: 1 }),
        animate('500ms', style({ opacity: 0.5 })),
      ]),
    ]),
  ],
})
export class GameComponent {
  @ViewChild('game') DOMgame!: ElementRef
  @ViewChild('node') DOMnode?: GameNodeComponent
  @Input() customStyles?: string
  @Input() mode: 'cumulative' | 'single' = 'cumulative'
  @Input() writeSpeed: 'immediate' | 'fast' | 'slow' = 'fast'

  activeNodes?: any = []
  isWrittingNodes: boolean = false
  inactiveNodes: any = []

  gameInitialized: boolean = false
  private TIME_BETWEEN_NODES = 700

  @Output() onEndGame = new EventEmitter<void>()
  @Output() onSelectAnswer = new EventEmitter<node_answer>()
  @Output() onDrawNode = new EventEmitter<node>()

  constructor(
    public gameEngine: GameEngineService,
    public activeStory: ActiveStoryService
  ) {
    effect(() => {
      if (this.activeStory.entireTree().nodes) this.initializeGame()
    })
  }

  initializeGame() {
    if (!this.gameInitialized) {
      console.log('Game initialized. Enjoy!')
      this.gameInitialized = true
      this.nextStep([{ node: 'node_0' }])
    }
  }

  selectAnswer(answer: node_answer) {
    this.gameEngine.applyEvents(answer.events)
    this.registerAnswer(answer)
    this.nextStep(answer.join)
  }

  continueFlow(continueInfo: any) {
    this.gameEngine.alterProperty(continueInfo.property, continueInfo.value)
    this.nextStep(continueInfo.join)
  }

  // Each step can contain multiple nodes
  nextStep(possibleJoins: Array<join>, addToCurrentStep: boolean = false) {
    console.log('Choosing next step from possible joins:', possibleJoins)
    const randomlyChoosedJoin = this.gameEngine.getRandomJoin(possibleJoins)
    console.log('Choosed next step:', randomlyChoosedJoin)

    const activeNode = this.gameEngine.buildNextNodeFromJoin(randomlyChoosedJoin)
    const isDistributor = activeNode.type === 'distributor'
    const isNonInteractableNode = activeNode.join && activeNode.type !== 'text'

    if (isDistributor) {
      this.nextStep(
        this.gameEngine.distributeNode(activeNode),
        addToCurrentStep
      )
      return
    }

    setTimeout(() => {
      if (!addToCurrentStep) {
        this.inactiveNodes = this.inactiveNodes.concat(this.activeNodes)
        this.activeNodes = []
      }
    }, this.TIME_BETWEEN_NODES)

    setTimeout(() => {
      this.activeNodes.push(activeNode)
      if (this.activeNodes.length === 1) this.scrollToNewNode()

      this.registerNodeEvents(activeNode)

      if (isNonInteractableNode) this.nextStep(activeNode.join, true)
    }, this.TIME_BETWEEN_NODES + 500)
  }

  scrollToNewNode() {
    setTimeout(() => {
      if (!this.DOMnode) return
      const nativeElement = this.DOMnode.getNativeElement()

      this.DOMgame.nativeElement.scrollTo({
        top: nativeElement.offsetTop - 50,
        behavior: 'smooth',
      })
    })
  }

  openShareContext(shareText: string) {
    if (navigator.share) {
      navigator
        .share({
          text: shareText,
          url: window.location.href,
        })
        .then(() => {
          console.log('Successful share')
        })
        .catch((error) => console.log('Error sharing', error))
    } else {
      console.log('Web Share API is not supported in your browser.')
    }
  }

  registerLink(link: string) {
    window.open(normalizeLink(link), '_blank')
  }

  registerAnswer(answer: node_answer) {
    this.onSelectAnswer.emit(answer)
  }

  registerNodeEvents(node: node) {
    console.log('Registering node events:', node)
    if (node.events) this.gameEngine.applyEvents(node.events)
    if (node.type !== 'distributor') this.onDrawNode.emit(node)
    if (node.type === 'end') this.onEndGame.emit()
  }
}
