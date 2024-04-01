import { Component, Output, EventEmitter, effect } from '@angular/core'
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
import { PlayService } from 'src/app/pages/playground/services/play.service'

@Component({
  selector: 'polo-flow',
  standalone: true,
  imports: [],
  templateUrl: './flow.component.html',
  styleUrl: './flow.component.sass',
})
export class FlowComponent {
  activeNode?: node = undefined

  @Output() onEndGame = new EventEmitter<void>()
  @Output() onSelectAnswer = new EventEmitter<node_answer>()
  @Output() onDrawNode = new EventEmitter<node>()

  constructor(public playService: PlayService) {
    effect(() => {
      if (this.playService.reset()) {
        console.log('reseting story')
        this.activeNode = this.playService.nodes()[0]
      }
    })
  }

  ngOnInit() {
    this.activeNode = this.playService.nodes()[0]
  }

  nextStep(destinyNode: Array<join>) {
    const randomlyChoosedJoin = this.getRandomJoin(destinyNode)
    const nextNode = this.playService
      .nodes()
      .find((node: any) => node.id === randomlyChoosedJoin.node)
    if (!nextNode) throw new Error('Node not found')
    this.activeNode = nextNode

    if (this.activeNode.type === 'end') this.onEndGame.emit()
    if (this.activeNode.type !== 'distributor')
      this.registerNode(this.activeNode)
    if (this.activeNode.type === 'distributor')
      // If nodePointer points to a distributor, we jump to the next one
      this.nextStep(this.distributeNode(nextNode))
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
        const playerStat = this.playService
          .player()
          .stats.find((stat: any) => stat.id === distributorCondition.ref)
        // If the player doesn't have the stat, the amount is 0
        const playerStatAmount = playerStat ? playerStat.amount : 0
        // Then we check the comparator, if it's correct we can go to next node
        if (
          (distributorCondition.comparator === 'equalto' &&
            playerStatAmount === parseInt(distributorCondition.value)) ||
          (distributorCondition.comparator === 'lessthan' &&
            playerStatAmount < parseInt(distributorCondition.value)) ||
          (distributorCondition.comparator === 'morethan' &&
            playerStatAmount > parseInt(distributorCondition.value))
        ) {
          return distributorCondition.join || []
        }
      }
      if (distributorConditionType === 'condition') {
        // If it's a condition, we find this condition in the player object
        const playerCondition = this.playService
          .player()
          .conditions.find(
            (condition: any) => condition.id === distributorCondition.ref
          )
        // We check the comparator
        // If the player has the condition and the requirement is 1, we can go to next node
        // If the player doesn't have the condition and the requirement is 0, we can go to next node too
        if (
          (parseInt(distributorCondition.value) === 1 && playerCondition) ||
          (parseInt(distributorCondition.value) === 0 && !playerCondition)
        ) {
          return distributorCondition.join || []
        }
      }
    }

    // If reached this point, no condition was met, we use the fallback condition
    if (!node.fallbackCondition) {
      console.warn('Distributor node with no fallback condition')
      return []
    }
    if (node.fallbackCondition.join) {
      console.log('Using fallback join')
      return node.fallbackCondition.join
    }

    console.warn('No join possible', node)
    return []
  }

  openShareContext() {
    console.log('waiting share context')
    if (navigator.share) {
      navigator
        .share({
          text: this.activeNode?.share?.sharedText || this.activeNode?.text,
          url: window.location.href,
        })
        .then(() => console.log('Successful share'))
        .catch((error) => console.log('Error sharing', error))
    } else {
      console.log('Web Share API is not supported in your browser.')
    }
  }

  getTextWithFinalParameters(text: string = '') {
    const withInlineReplacements = text.replace(
      /#([a-zA-Z0-9_]+)/g,
      (match: string, p1: string) => {
        // if the prop is not in player, we search in stats
        let value = this.playService.player()[p1]
        if (!value) {
          value = this.playService
            .player()
            .stats.find((stat: any) => stat.id === p1)?.amount
        }
        return value || '-'
      }
    )
    const withBlockReplacements = withInlineReplacements.replace(
      /\[([a-zA-Z0-9_]+)\]/g,
      (match: string, p1: string) => {
        let refsWithCategory = Object.keys(this.playService.refs()).filter(
          (key: any) => {
            return this.playService.refs()[key].category === p1
          }
        )

        let string = ' '
        for (let refWithCategory of refsWithCategory) {
          const playerStat = this.playService
            .player()
            .stats.find((stat: any) => stat.id === refWithCategory)
          if (playerStat) {
            string =
              string +
              '\n' +
              this.capitalize(this.playService.refs()[playerStat.id].name) +
              ': ' +
              playerStat.amount
          }
        }
        for (let refWithCategory of refsWithCategory) {
          const playerCondition = this.playService
            .player()
            .conditions.find(
              (condition: any) => condition.id === refWithCategory
            )
          if (playerCondition) {
            string =
              string +
              '\n' +
              this.capitalize(this.playService.refs()[playerCondition.id].name)
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

    let statIndex = this.playService
      .player()
      .stats?.findIndex((element: stat) => element.id === event.target)
    let stat = this.playService.player().stats?.[statIndex]

    if (stat) {
      stat.amount += amount
      if (stat.amount <= 0)
        this.playService.player().stats?.splice(statIndex, 1)
    } else {
      if (amount <= 0) return
      this.playService.player().stats?.push({
        id: event.target,
        amount,
      })
    }
  }

  private alterCondition(event: answer_event) {
    if (event.amount) {
      let condition = this.playService
        .player()
        .conditions?.find((element: condition) => element.id === event.target)

      if (!condition)
        this.playService.player().conditions?.push({ id: event.target })
    } else {
      let condition = this.playService
        .player()
        .conditions?.findIndex(
          (condition: condition) => condition.id === event.target
        )

      if (condition) this.playService.player().conditions?.splice(condition, 1)
    }
  }

  getRandomJoin(answerJoins: Array<join>) {
    const randomJoinIndex = Math.floor(Math.random() * answerJoins.length)
    return answerJoins[randomJoinIndex]
  }

  normalizeLink(url: string) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`
    }
    return url
  }

  registerAnswer(answer: node_answer) {
    this.onSelectAnswer.emit(answer)
  }

  registerNode(node: node) {
    this.onDrawNode.emit(node)
  }
}
