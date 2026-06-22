import { Injectable } from '@angular/core'
import {
  answer_requirement,
  condition,
  event,
  join,
  node,
  node_answer,
  property,
  stat,
} from 'src/app/core/interfaces/interfaces'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { PlayerService } from './player.service'

/**
 * Runtime engine for playing a story tree. Resolves the next node, evaluates
 * distributor conditions and answer requirements, interpolates node texts and
 * applies events. Reads the story from ActiveStoryService and reads/mutates the
 * player state through PlayerService. View concerns (scheduling, animations,
 * scrolling, sharing) live in GameComponent.
 */
@Injectable({
  providedIn: 'root',
})
export class GameEngineService {
  constructor(
    private player: PlayerService,
    private activeStory: ActiveStoryService
  ) {}

  // Step resolution

  getRandomJoin(answerJoins: Array<join>) {
    const randomJoinIndex = Math.floor(Math.random() * answerJoins.length)

    if (!answerJoins[randomJoinIndex])
      throw new Error('Impossible to get a random join')

    return answerJoins[randomJoinIndex]
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
        this.player.playerProperties(),
        this.player.playerStats(),
        this.player.playerConditions(),
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
      (_match: string, p1: string): any => {
        const property = this.player.playerProperties()[p1]
        if (property) return property

        const condition = this.player
          .playerConditions()
          .find((condition: any) => condition.id === p1)
        if (condition) return true

        const stat = this.player
          .playerStats()
          .find((stat: any) => stat.id === p1)
        if (stat) return stat.amount.toString()

        return '-'
      }
    )
    const withBlockReplacements = withInlineReplacements.replace(
      /\[([a-zA-Z0-9_]+)\]/g,
      (_match: string, p1: string) => {
        const refsWithCategory: any = Object.values(
          this.activeStory.storyRefs()
        ).filter((val: any) => {
          return val.category === p1
        })

        let string = ' '
        for (const refWithCategory of refsWithCategory) {
          const playerStat = this.player
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
        for (const refWithCategory of refsWithCategory) {
          const playerCondition = this.player
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

  distributeNode(node: node) {
    if (node.conditions) {
      for (const distributorCondition of node.conditions) {
        const distributorConditionType = distributorCondition.ref.split('_')[0]
        if (distributorConditionType === 'stat') {
          // If it's a stat, we find this stat in the player object
          const playerStat = this.player
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
          const playerCondition = this.player
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

  // Requirements

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
    for (const requirement of requirements) {
      const requirement_amount = requirement.amount
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

        for (const condition of playerConditions) {
          // If player has the condition, but it should not be checked
          if (condition.id === requirement.target && !conditionIsRequired)
            return false
        }
      }
    }
    return true
  }

  // Events / player state mutation

  applyEvents(events: Array<event>) {
    console.log('Applying events:', events)
    events?.forEach((event) => {
      if (event.action === 'alterStat') this.alterStat(event)
      if (event.action === 'alterCondition') this.alterCondition(event)
    })
    console.log('Player stats after events:', this.player.playerStats())
  }

  alterProperty(property: string, value: string) {
    this.player.playerProperties.set({
      ...this.player.playerProperties(),
      [property]: value,
    })
  }

  private alterStat(event: event) {
    const amount = parseInt(event.amount)

    const statIndex = this.player
      .playerStats()
      .findIndex((element: stat) => element.id === event.target)
    const stat = this.player.playerStats()[statIndex]

    if (stat) {
      stat.amount += amount
      if (stat.amount <= 0) this.player.playerStats().splice(statIndex, 1)
    } else {
      if (amount <= 0) return
      this.player.playerStats().push({
        id: event.target,
        amount,
      })
    }
  }

  private alterCondition(event: event) {
    if (event.amount) {
      const condition = this.player
        .playerConditions()
        .find((element: condition) => element.id === event.target)

      if (!condition) this.player.playerConditions().push({ id: event.target })
    } else {
      const condition = this.player
        .playerConditions()
        .findIndex((condition: condition) => condition.id === event.target)

      if (condition) this.player.playerConditions().splice(condition, 1)
    }
  }

  private capitalize(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }
}
