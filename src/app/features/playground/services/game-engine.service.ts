import { Injectable } from '@angular/core'
import {
  answer_requirement,
  condition,
  event,
  join,
  node,
  node_answer,
  node_condition_rule,
  property,
  stat,
} from 'src/app/core/interfaces/interfaces'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { getRequirementRefId } from 'src/app/shared/utils/story-requirements'
import { PlayerService } from './player.service'

interface playableNode extends node {
  jumpToAnswers?: boolean
  key?: number
}

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
    const storedNode = this.activeStory
      .entireTree()
      .nodes.find((storyNode) => storyNode.id === originJoin.node)
    if (!storedNode) throw new Error('Next node not found')

    // The runtime copy can be enriched without changing the authored story.
    const nextNode = structuredClone(storedNode) as playableNode

    // Li afegim el valor de toAnswer, que farem servir per saltar-nos o no el text quan el pintem
    nextNode.jumpToAnswers = originJoin.toAnswer

    // Afegim un valor random per obligar el track del @for a repintar encara que repetim node
    nextNode.key = Date.now() + Math.random()

    return nextNode
  }

  filterAvailableAnswers(storyNode: node) {
    storyNode.answers = storyNode.answers?.filter((answer: node_answer) =>
      this.playerHasAnswerRequirements(
        this.player.playerProperties(),
        this.player.playerStats(),
        this.player.playerConditions(),
        answer.requirements
      )
    )
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
        const refsWithCategory = Object.entries(
          this.activeStory.entireTree().refs
        )
          .filter(([, storyRef]) => storyRef.category === p1)
          .map(([id, storyRef]) => ({ id, ...storyRef }))

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
                this.activeStory.entireTree().refs[playerStat.id].name
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
                this.activeStory.entireTree().refs[playerCondition.id].name
              )
          }
        }

        return string
      }
    )

    return withBlockReplacements
  }

  distributeNode(node: node) {
    for (const route of node.conditions ?? []) {
      const rules = route.rules ?? [route]
      if (rules.length > 0 && rules.every((rule) => this.matchesRule(rule))) {
        return route.join ?? []
      }
    }

    // If reached this point, no route was met, we use the fallback condition
    if (!node.fallbackCondition) {
      return []
    }
    if (node.fallbackCondition.join) {
      return node.fallbackCondition.join
    }

    console.warn('No join possible', node)
    return []
  }

  private matchesRule(rule: node_condition_rule): boolean {
    if (!rule.ref) return false
    const requiredValue = Number(rule.value ?? 0)
    const type = rule.ref.split('_')[0]

    if (type === 'stat') {
      const amount =
        this.player.playerStats().find((stat) => stat.id === rule.ref)?.amount ?? 0
      return (
        (rule.comparator === 'equalto' && amount === requiredValue) ||
        (rule.comparator === 'lessthan' && amount < requiredValue) ||
        (rule.comparator === 'morethan' && amount > requiredValue)
      )
    }

    if (type === 'condition') {
      const hasCondition = this.player.playerConditions().some(
        (condition) => condition.id === rule.ref
      )
      return (
        (requiredValue === 1 && hasCondition) ||
        (requiredValue === 0 && !hasCondition)
      )
    }

    return false
  }

  // Requirements

  playerHasAnswerRequirements(
    _playerProperties: property,
    playerStats: Array<stat>,
    playerConditions: Array<condition>,
    requirements?: Array<answer_requirement>
  ) {
    if (!requirements || requirements.length === 0) return true

    for (const requirement of requirements) {
      const refId = getRequirementRefId(requirement)
      if (!refId) return false

      const requiredAmount = Number(requirement.amount)
      if (!Number.isFinite(requiredAmount)) return false
      if (requirement.type === 'stat') {
        const playerStat = playerStats.find((stat) => stat.id === refId)
        if ((playerStat?.amount ?? 0) < requiredAmount) return false
      }

      if (requirement.type === 'condition') {
        const conditionIsRequired = requiredAmount === 1
        const playerHasCondition = playerConditions.some(
          (condition) => condition.id === refId
        )

        if (conditionIsRequired !== playerHasCondition) return false
      }
    }
    return true
  }

  // Events / player state mutation

  applyEvents(events: Array<event>) {
    events?.forEach((event) => {
      // Older property events were saved with alterCondition as their action.
      if (event.type === 'property') {
        this.alterProperty(event.target, event.property ?? '')
      } else if (event.action === 'alterStat') {
        this.alterStat(event)
      } else if (event.action === 'alterCondition') {
        this.alterCondition(event)
      }
    })
  }

  alterProperty(property: string, value: string) {
    this.player.playerProperties.set({
      ...this.player.playerProperties(),
      [property]: value,
    })
  }

  private alterStat(event: event) {
    const amount = Number(event.amount)
    if (!Number.isFinite(amount)) return

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
    if (Number(event.amount) === 1) {
      const condition = this.player
        .playerConditions()
        .find((element: condition) => element.id === event.target)

      if (!condition) this.player.playerConditions().push({ id: event.target })
    } else {
      const conditionIndex = this.player
        .playerConditions()
        .findIndex((condition: condition) => condition.id === event.target)

      if (conditionIndex !== -1)
        this.player.playerConditions().splice(conditionIndex, 1)
    }
  }

  private capitalize(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }
}
