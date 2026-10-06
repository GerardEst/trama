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
import { storyInlineHtml, storyPlainText } from 'src/app/shared/utils/story-html'
import { PlayerService, PlayerSnapshot } from './player.service'
import { PlayableNode } from './game-session.types'

/**
 * Runtime engine for playing a story tree. Resolves the next node, evaluates
 * distributor conditions and answer requirements, interpolates node texts and
 * applies events. Reads the story from ActiveStoryService and reads/mutates the
 * player state through PlayerService. Navigation and scheduling belong to
 * GameSessionService; rendering, scrolling and sharing belong to the views.
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
    if (!storedNode || storedNode.type === 'group') throw new Error('Next node not found')

    // The runtime copy can be enriched without changing the authored story.
    const nextNode = structuredClone(storedNode) as PlayableNode

    // Li afegim el valor de toAnswer, que farem servir per saltar-nos o no el text quan el pintem
    nextNode.jumpToAnswers = originJoin.toAnswer

    // Afegim un valor random per obligar el track del @for a repintar encara que repetim node
    nextNode.key = Date.now() + Math.random()

    return nextNode
  }

  /** Refresh presentation without executing arrival events or transitions. */
  renderNode(storedNode: node, entry: join, state: PlayerSnapshot): PlayableNode {
    const copy: PlayableNode = { ...structuredClone(storedNode), jumpToAnswers: entry.toAnswer }
    this.filterAvailableAnswers(copy, state)
    return this.interpolateNodeTexts(copy, state)
  }

  filterAvailableAnswers(storyNode: PlayableNode, state = this.player.snapshot()) {
    // Keep authored text visible even when its answer is unfinished. The view
    // disables disconnected answers; only empty placeholders are hidden.
    storyNode.answers = storyNode.answers?.filter((answer: node_answer) =>
      ((answer.join?.length ?? 0) > 0 || storyPlainText(answer.text).trim().length > 0) &&
      this.playerHasAnswerRequirements(
        state.properties,
        state.stats,
        state.conditions,
        answer.requirements
      )
    )

    // An answers-only join must not hide the passage if all answers are empty
    // or locked by requirements, leaving the player with a blank node.
    if (!storyNode.answers?.length) storyNode.jumpToAnswers = false
  }

  interpolateNodeTexts(node: PlayableNode, state = this.player.snapshot()) {
    const interpolateAnswers = node.answers?.map((answer) => {
      return { ...answer, text: storyInlineHtml(this.getTextWithFinalParameters(answer.text, state)) }
    })
    return {
      ...node,
      answers: interpolateAnswers || [],
      text: this.getTextWithFinalParameters(node.text, state),
    }
  }

  getTextWithFinalParameters(text: string = '', state = this.player.snapshot()) {
    // Rich text uses explicit tokens; never interpolate ordinary HTML or attributes.
    if (/<[a-z][\w-]*[\s/>]/i.test(text) || text.includes('data-trama-')) {
      const document = new DOMParser().parseFromString(text, 'text/html')
      for (const variable of Array.from(document.querySelectorAll('[data-trama-variable]'))) {
        const kind = variable.getAttribute('data-kind')
        const key = variable.getAttribute('data-key')
        if (!key || !['property', 'stat', 'condition'].includes(kind ?? '')) continue
        // Resolve through the same player-state rules as plain story text, but only
        // replace a text node: player-provided values must never become HTML.
        let value: string | number | undefined
        if (kind === 'property') value = state.properties[key]
        if (kind === 'stat') value = state.stats.find(stat => stat.id === key)?.amount
        if (kind === 'condition') value = state.conditions.some(condition => condition.id === key) ? 'true' : undefined
        variable.replaceWith(document.createTextNode(String(value ?? '-')))
      }
      for (const category of Array.from(document.querySelectorAll('[data-trama-category]'))) {
        const key = category.getAttribute('data-key')
        if (!key) continue
        const expanded = document.createElement('div')
        expanded.className = 'storyCategory__entries'
        expanded.textContent = this.getTextWithFinalParameters(`[${key}]`, state).trim()
        category.replaceWith(expanded)
      }
      return document.body.innerHTML
    }
    return this.interpolatePlainText(text, state)
  }

  private interpolatePlainText(text: string, state: PlayerSnapshot) {
    const withInlineReplacements = text.replace(
      /#([a-zA-Z0-9_]+)/g,
      (_match: string, p1: string) => {
        const property = state.properties[p1]
        if (property) return property

        const condition = state.conditions.find(condition => condition.id === p1)
        if (condition) return 'true'

        const stat = state.stats.find(stat => stat.id === p1)
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
          const playerStat = state.stats.find(stat => stat.id === refWithCategory.id)
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
          const playerCondition = state.conditions.find(condition => condition.id === refWithCategory.id)
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

    this.player.playerStats.update(stats => {
      const existing = stats.find(stat => stat.id === event.target)
      const nextAmount = (existing?.amount ?? 0) + amount
      if (nextAmount <= 0) return stats.filter(stat => stat.id !== event.target)
      return existing
        ? stats.map(stat => stat.id === event.target ? { ...stat, amount: nextAmount } : stat)
        : [...stats, { id: event.target, amount: nextAmount }]
    })
  }

  private alterCondition(event: event) {
    this.player.playerConditions.update(conditions => {
      if (Number(event.amount) !== 1) return conditions.filter(condition => condition.id !== event.target)
      return conditions.some(condition => condition.id === event.target)
        ? conditions
        : [...conditions, { id: event.target }]
    })
  }

  private capitalize(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }
}
