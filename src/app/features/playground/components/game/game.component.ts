import {
  Component,
  Output,
  EventEmitter,
  effect,
  Input,
  ViewChild,
  ElementRef,
} from '@angular/core'
import {
  answer_requirement,
  join,
  event,
  stat,
  condition,
  property,
  node,
  node_answer,
} from 'src/app/core/interfaces/interfaces'
import { PlayerService } from 'src/app/features/playground/services/player.service'
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
    public playerService: PlayerService,
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
    this.applyEvents(answer.events)
    this.registerAnswer(answer)
    this.nextStep(answer.join)
  }

  continueFlow(continueInfo: any) {
    this.alterProperty(continueInfo.property, continueInfo.value)
    this.nextStep(continueInfo.join)
  }

  // Each step can contain multiple nodes
  nextStep(possibleJoins: Array<join>, addToCurrentStep: boolean = false) {
    console.log('Choosing next step from possible joins:', possibleJoins)
    const randomlyChoosedJoin = this.getRandomJoin(possibleJoins)
    console.log('Choosed next step:', randomlyChoosedJoin)

    const activeNode = this.buildNextNodeFromJoin(randomlyChoosedJoin)
    const isDistributor = activeNode.type === 'distributor'
    const isNonInteractableNode = activeNode.join && activeNode.type !== 'text'

    if (isDistributor) {
      this.nextStep(this.distributeNode(activeNode), addToCurrentStep)
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

  buildNextNodeFromJoin(originJoin: join) {
    console.log('Building next node')

    // Fem una copia del node al que fem join
    let nextNode = structuredClone(
      this.activeStory
        .entireTree()
        .nodes.find((node: any) => node.id === originJoin.node)
    )
    if (!nextNode) throw new Error('Next node not found')

    // Li afegim el valor de toAnswer, que farem servir per saltar-nos o no el text quan el pintem
    nextNode.jumpToAnswers = originJoin.toAnswer

    // Substituim tots els textos per els finals amb interpolacions
    nextNode = this.interpolateNodeTexts(nextNode)

    // Afegim un valor random per obligar el track del @for a repintar encara que repetim node
    nextNode.key = Date.now() + Math.random()

    // Treiem totes les respostes que no pot triar l'usuari per falta de requirements
    nextNode.answers &&= nextNode.answers?.filter((answer: node_answer) =>
      this.playerHasAnswerRequirements(
        this.playerService.playerProperties(),
        this.playerService.playerStats(),
        this.playerService.playerConditions(),
        answer.requirements
      )
    )

    return nextNode
  }

  interpolateNodeTexts(node: node) {
    const interpolateAnswers = node.answers?.map((answer) => {
      return { ...answer, text: this.getTextWithFinalParameters(answer.text) }
    })
    return {
      ...node,
      answers: interpolateAnswers || [],
      text: this.getTextWithFinalParameters(node.text),
    }
  }

  getTextWithFinalParameters(text: string = '') {
    const withInlineReplacements = text.replace(
      /#([a-zA-Z0-9_]+)/g,
      (match: string, p1: string): any => {
        let property = this.playerService.playerProperties()[p1]
        if (property) return property

        let condition = this.playerService
          .playerConditions()
          .find((condition: any) => condition.id === p1)
        if (condition) return true

        let stat = this.playerService
          .playerStats()
          .find((stat: any) => stat.id === p1)
        if (stat) return stat.amount.toString()

        return '-'
      }
    )
    const withBlockReplacements = withInlineReplacements.replace(
      /\[([a-zA-Z0-9_]+)\]/g,
      (match: string, p1: string) => {
        let refsWithCategory: any = Object.values(
          this.activeStory.storyRefs()
        ).filter((val: any) => {
          return val.category === p1
        })

        let string = ' '
        for (let refWithCategory of refsWithCategory) {
          const playerStat = this.playerService
            .playerStats()
            .find((stat: any) => stat.id === refWithCategory.id)
          if (playerStat) {
            string =
              string +
              '\n' +
              this.capitalize(
                this.activeStory
                  .storyRefs()
                  .find((ref: any) => ref.id === playerStat.id).name
              ) +
              ': ' +
              playerStat.amount
          }
        }
        for (let refWithCategory of refsWithCategory) {
          const playerCondition = this.playerService
            .playerConditions()
            .find((condition: any) => condition.id === refWithCategory.id)
          if (playerCondition) {
            string =
              string +
              '\n' +
              this.capitalize(
                this.activeStory
                  .storyRefs()
                  .find((ref: any) => ref.id === playerCondition.id).name
              )
          }
        }

        return string
      }
    )

    return withBlockReplacements
  }

  capitalize(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
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

  distributeNode(node: node) {
    if (node.conditions) {
      for (let distributorCondition of node.conditions) {
        const distributorConditionType = distributorCondition.ref.split('_')[0]
        if (distributorConditionType === 'stat') {
          // If it's a stat, we find this stat in the player object
          const playerStat = this.playerService
            .playerStats()
            .find((stat: any) => stat.id === distributorCondition.ref)
          // If the player doesn't have the stat, the amount is 0
          const playerStatAmount = playerStat ? playerStat.amount : 0
          // Then we check the comparator, if it's correct we can go to next node
          if (
            (distributorCondition.comparator === 'equalto' &&
              playerStatAmount == distributorCondition.value) ||
            (distributorCondition.comparator === 'lessthan' &&
              playerStatAmount < distributorCondition.value) ||
            (distributorCondition.comparator === 'morethan' &&
              playerStatAmount > distributorCondition.value)
          ) {
            return distributorCondition.join || []
          }
        }
        if (distributorConditionType === 'condition') {
          // If it's a condition, we find this condition in the player object
          const playerCondition = this.playerService
            .playerConditions()
            .find((condition: any) => condition.id === distributorCondition.ref)

          // We check the comparator
          // If the player has the condition and the requirement is 1, we can go to next node
          // If the player doesn't have the condition and the requirement is 0, we can go to next node too
          if (
            (distributorCondition.value == 1 && playerCondition) ||
            (distributorCondition.value == 0 && !playerCondition)
          ) {
            return distributorCondition.join || []
          }
        }
      }
    }

    // If reached this point, no condition was met, we use the fallback condition
    if (!node.fallbackCondition) {
      console.log('Distributor node with no fallback condition')
      return []
    }
    if (node.fallbackCondition.join) {
      console.log('Using fallback join')
      return node.fallbackCondition.join
    }

    console.warn('No join possible', node)
    return []
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

  playerHasAnswerRequirements(
    playerProperties: property,
    playerStats: Array<stat>,
    playerConditions: Array<condition>,
    requirements: Array<answer_requirement>
  ) {
    if (!requirements || requirements.length === 0) return true

    console.log('Checking player requirements:', requirements)
    console.log('Using player data:', {
      properties: playerProperties,
      stats: playerStats,
      conditions: playerConditions,
    })

    // If just some of the requirements is not met, we can throw false and stop checking
    for (let requirement of requirements) {
      let requirement_amount = requirement.amount
      if (requirement.type === 'stat') {
        if (playerStats.length === 0) return false

        const playerHasSomeRequiredStats = playerStats.some(
          (stat: stat) => stat.id === requirement.target
        )
        if (!playerHasSomeRequiredStats) return false

        const someUnsatisfiedStat = playerStats.some(
          (stat: stat) => stat.amount < requirement_amount
        )
        if (someUnsatisfiedStat) return false
      }
      if (requirement.type === 'condition') {
        // In conditions, the requirement might be that the condition is not checked
        const conditionIsRequired = requirement_amount == 1

        // If condition should be checked but player doesn't have any conditions
        if (conditionIsRequired && playerConditions.length === 0) return false

        // If condition should be checked but player doesn't have this condition
        const playerHasSomeRequiredConditions = playerConditions.some(
          (condition: condition) => condition.id === requirement.target
        )
        if (conditionIsRequired && !playerHasSomeRequiredConditions)
          return false

        for (let condition of playerConditions) {
          // If player has the condition, but it should not be checked
          if (condition.id === requirement.target && !conditionIsRequired)
            return false
        }
      }
    }
    return true
  }

  applyEvents(events: Array<event>) {
    console.log('Applying events:', events)
    events?.forEach((event) => {
      if (event.action === 'alterStat') this.alterStat(event)
      if (event.action === 'alterCondition') this.alterCondition(event)
    })
    console.log('Player stats after events:', this.playerService.playerStats())
  }

  private alterProperty(property: string, value: string) {
    this.playerService.playerProperties.set({
      ...this.playerService.playerProperties(),
      [property]: value,
    })
  }

  private alterStat(event: event) {
    const amount = parseInt(event.amount)

    let statIndex = this.playerService
      .playerStats()
      .findIndex((element: stat) => element.id === event.target)
    let stat = this.playerService.playerStats()[statIndex]

    if (stat) {
      stat.amount += amount
      if (stat.amount <= 0)
        this.playerService.playerStats().splice(statIndex, 1)
    } else {
      if (amount <= 0) return
      this.playerService.playerStats().push({
        id: event.target,
        amount,
      })
    }
  }

  private alterCondition(event: event) {
    if (event.amount) {
      let condition = this.playerService
        .playerConditions()
        .find((element: condition) => element.id === event.target)

      if (!condition)
        this.playerService.playerConditions().push({ id: event.target })
    } else {
      let condition = this.playerService
        .playerConditions()
        .findIndex((condition: condition) => condition.id === event.target)

      if (condition) this.playerService.playerConditions().splice(condition, 1)
    }
  }

  getRandomJoin(answerJoins: Array<join>) {
    const randomJoinIndex = Math.floor(Math.random() * answerJoins.length)

    if (!answerJoins[randomJoinIndex])
      throw new Error('Impossible to get a random join')

    return answerJoins[randomJoinIndex]
  }

  registerAnswer(answer: node_answer) {
    this.onSelectAnswer.emit(answer)
  }

  registerNodeEvents(node: node) {
    console.log('Registering node events:', node)
    if (node.events) this.applyEvents(node.events)
    if (node.type !== 'distributor') this.onDrawNode.emit(node)
    if (node.type === 'end') this.onEndGame.emit()
  }
}
