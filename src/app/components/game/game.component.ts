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
  answer_event,
  stat,
  condition,
  player,
  node,
  node_answer,
} from 'src/app/interfaces'
import { PlayerService } from 'src/app/pages/playground/services/player.service'
import { ActiveStoryService } from 'src/app/services/active-story.service'
import * as Cronitor from '@cronitorio/cronitor-rum'
import { normalizeLink } from 'src/app/utils/links'
import {
  trigger,
  state,
  style,
  transition,
  animate,
  group,
  stagger,
  query,
} from '@angular/animations'
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
  inactiveNodes: any = []

  initialized: boolean = false

  @Output() onEndGame = new EventEmitter<void>()
  @Output() onSelectAnswer = new EventEmitter<node_answer>()
  @Output() onDrawNode = new EventEmitter<node>()

  constructor(
    public playerService: PlayerService,
    public activeStory: ActiveStoryService
  ) {
    effect(() => {
      if (!this.initialized && this.activeStory) {
        console.log('activeStory initialized')
        const firstNode = structuredClone(
          this.activeStory.entireTree().nodes[0]
        )

        this.activeNodes = [this.interpolateNodeTexts(firstNode)]
        if (firstNode.join) this.nextStep(firstNode.join)
        this.initialized = true
      }
    })
  }

  selectAnswer(answer: node_answer) {
    this.nextStep(answer.join)
    this.applyEvents(answer.events)
    this.registerAnswer(answer)
  }

  nextStep(destinyNodes: Array<join>, addToActiveNodes: boolean = false) {
    setTimeout(() => {
      const randomlyChoosedJoin = this.getRandomJoin(destinyNodes)

      let nextNode = structuredClone(
        this.activeStory
          .entireTree()
          .nodes.find((node: any) => node.id === randomlyChoosedJoin.node)
      )
      if (!nextNode) throw new Error('Node not found')

      // Transform the texts to interpolated with stats
      nextNode = this.interpolateNodeTexts(nextNode)

      // Add toAnswer to do correct paintings
      nextNode.toAnswer = randomlyChoosedJoin.toAnswer

      // Remove banned answers before painting
      nextNode.answers = nextNode.answers?.filter((answer: node_answer) =>
        this.playerHasAnswerRequirements(
          this.playerService.player(),
          answer.requirements
        )
      )

      // Handle node change
      if (this.mode === 'cumulative' && !addToActiveNodes) {
        this.inactiveNodes = this.inactiveNodes.concat(this.activeNodes)
      }

      if (!addToActiveNodes) this.activeNodes = []
      setTimeout(() => {
        this.activeNodes.push(nextNode)

        // It scrolls only on the first activeNode added
        if (this.activeNodes.length === 1) this.scrollToNewNode()
      }, 500)

      if (nextNode && nextNode.join) {
        this.nextStep(nextNode.join, true)
      }
      if (nextNode && nextNode.type === 'end') this.onEndGame.emit()
      if (nextNode && nextNode.type !== 'distributor')
        this.registerNode(nextNode)
      if (nextNode && nextNode.type === 'distributor') {
        this.nextStep(this.distributeNode(nextNode), true)
      }
    }, 700)
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
      (match: string, p1: string) => {
        // if the prop is not in player, we search in stats
        let value = this.playerService.player()[p1]
        if (!value) {
          value = this.playerService
            .player()
            .stats.find((stat: any) => stat.id === p1)?.amount
        }
        return value || '-'
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
            .player()
            .stats.find((stat: any) => stat.id === refWithCategory.id)
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
            .player()
            .conditions.find(
              (condition: any) => condition.id === refWithCategory.id
            )
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
    if (!node.conditions) {
      console.error('Distributor node with no conditions')
      return []
    }
    for (let distributorCondition of node.conditions) {
      const distributorConditionType = distributorCondition.ref.split('_')[0]
      if (distributorConditionType === 'stat') {
        // If it's a stat, we find this stat in the player object
        const playerStat = this.playerService
          .player()
          .stats.find((stat: any) => stat.id === distributorCondition.ref)
        // If the player doesn't have the stat, the amount is 0
        const playerStatAmount = playerStat ? playerStat.amount : 0
        // Then we check the comparator, if it's correct we can go to next node
        if (
          (distributorCondition.comparator === 'equalto' &&
            playerStatAmount === distributorCondition.value) ||
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
          .player()
          .conditions.find(
            (condition: any) => condition.id === distributorCondition.ref
          )
        // We check the comparator
        // If the player has the condition and the requirement is 1, we can go to next node
        // If the player doesn't have the condition and the requirement is 0, we can go to next node too
        if (
          (distributorCondition.value === 1 && playerCondition) ||
          (distributorCondition.value === 0 && !playerCondition)
        ) {
          return distributorCondition.join || []
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

    console.log('No join possible', node)
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
          Cronitor.track('SomeoneHasShared')
          console.log('Successful share')
        })
        .catch((error) => console.log('Error sharing', error))
    } else {
      console.log('Web Share API is not supported in your browser.')
    }
  }

  registerLink(link: string) {
    Cronitor.track('SomeoneWentToAFinalLink')
    window.open(normalizeLink(link), '_blank')
  }

  playerHasAnswerRequirements(
    player: player,
    requirements: Array<answer_requirement>
  ) {
    if (!requirements) return true

    // If just some of the requirements is not met, we can throw false and stop checking
    for (let requirement of requirements) {
      let requirement_amount = requirement.amount
      if (requirement.type === 'stat') {
        if (player.stats.length === 0) return false

        const playerHasSomeRequiredStats = player.stats.some(
          (stat: stat) => stat.id === requirement.id
        )
        if (!playerHasSomeRequiredStats) return false

        const someUnsatisfiedStat = player.stats.some(
          (stat: stat) => stat.amount < requirement_amount
        )
        if (someUnsatisfiedStat) return false
      }
      if (requirement.type === 'condition') {
        // In conditions, the requirement might be that the condition is not checked
        const conditionIsRequired = requirement_amount === 1

        // If condition should be checked but player doesn't have any conditions
        if (conditionIsRequired && player.conditions.length === 0) return false

        // If condition should be checked but player doesn't have this condition
        const playerHasSomeRequiredConditions = player.conditions.some(
          (condition: condition) => condition.id === requirement.id
        )
        if (conditionIsRequired && !playerHasSomeRequiredConditions)
          return false

        for (let condition of player.conditions) {
          // If player has the condition, but it should not be checked
          if (condition.id === requirement.id && !conditionIsRequired)
            return false
        }
      }
    }
    return true
  }

  applyEvents(events: Array<answer_event>) {
    events?.forEach((event) => {
      if (event.action === 'alterStat') this.alterStat(event)
      if (event.action === 'alterCondition') this.alterCondition(event)
    })
  }

  private alterStat(event: answer_event) {
    const amount = parseInt(event.amount)

    let statIndex = this.playerService
      .player()
      .stats?.findIndex((element: stat) => element.id === event.target)
    let stat = this.playerService.player().stats?.[statIndex]

    if (stat) {
      stat.amount += amount
      if (stat.amount <= 0)
        this.playerService.player().stats?.splice(statIndex, 1)
    } else {
      if (amount <= 0) return
      this.playerService.player().stats?.push({
        id: event.target,
        amount,
      })
    }
  }

  private alterCondition(event: answer_event) {
    if (event.amount) {
      let condition = this.playerService
        .player()
        .conditions?.find((element: condition) => element.id === event.target)

      if (!condition)
        this.playerService.player().conditions?.push({ id: event.target })
    } else {
      let condition = this.playerService
        .player()
        .conditions?.findIndex(
          (condition: condition) => condition.id === event.target
        )

      if (condition)
        this.playerService.player().conditions?.splice(condition, 1)
    }
  }

  getRandomJoin(answerJoins: Array<join>) {
    const randomJoinIndex = Math.floor(Math.random() * answerJoins.length)
    return answerJoins[randomJoinIndex]
  }

  registerAnswer(answer: node_answer) {
    this.onSelectAnswer.emit(answer)
  }

  registerNode(node: node) {
    this.onDrawNode.emit(node)
  }
}
