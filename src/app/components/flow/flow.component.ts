import { Component, Input } from '@angular/core'
import {
  answer_requirement,
  join,
  node,
  answer_event,
  stat,
  condition,
  player,
} from 'src/app/modules/marco/interfaces'

@Component({
  selector: 'polo-flow',
  standalone: true,
  imports: [],
  templateUrl: './flow.component.html',
  styleUrl: './flow.component.sass',
})
export class FlowComponent {
  player: any = { stats: [], conditions: [] }
  nodePointer: number = 0
  @Input() nodes: Array<node> = []
  @Input() refs: Array<any> = []

  nextStep(destinyNode: Array<join>) {
    const randomlyChoosedJoin = this.getRandomJoin(destinyNode)
    const nextNode = this.nodes.find(
      (node) => node.id === randomlyChoosedJoin.node
    )
    if (!nextNode) throw new Error('Node not found')
    this.nodePointer = this.nodes.indexOf(nextNode)
  }

  getTextWithFinalParameters(text: string = '') {
    console.log(text)
    const withInlineReplacements = text.replace(
      /#([a-zA-Z0-9_]+)/g,
      (match: string, p1: string) => {
        // if the prop is not in player, we search in stats
        let value = this.player[p1]
        if (!value) {
          value = this.player.stats.find((stat: any) => stat.id === p1)?.amount
        }
        return value || '-'
      }
    )
    console.log(withInlineReplacements)
    const withBlockReplacements = withInlineReplacements.replace(
      /\[([a-zA-Z0-9_]+)\]/g,
      (match: string, p1: string) => {
        let refsWithCategory = Object.keys(this.refs).filter((key: any) => {
          return this.refs[key].category === p1
        })

        let string = ' '
        for (let refWithCategory of refsWithCategory) {
          const playerStat = this.player.stats.find(
            (stat: any) => stat.id === refWithCategory
          )
          if (playerStat) {
            string =
              string +
              '\n' +
              this.capitalize(this.refs[playerStat.id].name) +
              ': ' +
              playerStat.amount
          }
        }
        for (let refWithCategory of refsWithCategory) {
          const playerCondition = this.player.conditions.find(
            (condition: any) => condition.id === refWithCategory
          )
          if (playerCondition) {
            string =
              string +
              '\n' +
              this.capitalize(this.refs[playerCondition.id].name)
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
    console.log(this.player)
  }

  private alterStat(event: answer_event) {
    const amount = parseInt(event.amount)

    let statIndex = this.player.stats?.findIndex(
      (element: stat) => element.id === event.target
    )
    let stat = this.player.stats?.[statIndex]

    if (stat) {
      stat.amount += amount
      if (stat.amount <= 0) this.player.stats?.splice(statIndex, 1)
    } else {
      if (amount <= 0) return
      this.player.stats?.push({
        id: event.target,
        amount,
      })
    }
  }

  private alterCondition(event: answer_event) {
    if (event.amount) {
      let condition = this.player.conditions?.find(
        (element: condition) => element.id === event.target
      )

      if (!condition) this.player.conditions?.push({ id: event.target })
    } else {
      let condition = this.player.conditions?.findIndex(
        (condition: condition) => condition.id === event.target
      )

      if (condition) this.player.conditions?.splice(condition, 1)
    }
  }

  getRandomJoin(answerJoins: Array<join>) {
    const randomJoinIndex = Math.floor(Math.random() * answerJoins.length)
    return answerJoins[randomJoinIndex]
  }
}
