import { Injectable } from '@angular/core'
import {
  answer_requirement,
  event,
  join,
  link,
  node,
  node_answer,
  node_conditions,
  shareOptions,
  tree,
} from 'src/app/core/interfaces/interfaces'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { StoryMutationService } from 'src/app/shared/services/story-mutation.service'
import {
  findAnswerInTree,
  findConditionsInTree,
  findNodeInTree,
} from 'src/app/shared/utils/tree-searching'

interface Joinable {
  join?: join[]
}

/** Owns graph and node editing rules for the authoring board. */
@Injectable({
  providedIn: 'root',
})
export class StoryEditorService {
  constructor(
    private activeStory: ActiveStoryService,
    private mutations: StoryMutationService
  ) {}

  duplicateNode(nodeId: string, newNodeId: string) {
    this.mutations.update((tree) => {
      const source = findNodeInTree(nodeId, tree)
      if (!source) return false

      const duplicatedNode = structuredClone(source)
      duplicatedNode.id = newNodeId
      duplicatedNode.left = Number(duplicatedNode.left) + 290

      for (const answer of duplicatedNode.answers ?? []) {
        answer.id = this.replaceNodePartOfId(answer.id, newNodeId)
        delete answer.join
      }
      for (const condition of duplicatedNode.conditions ?? []) {
        condition.id = this.replaceNodePartOfId(condition.id, newNodeId)
        delete condition.join
      }
      if (duplicatedNode.fallbackCondition) {
        duplicatedNode.fallbackCondition.id = this.replaceNodePartOfId(
          duplicatedNode.fallbackCondition.id,
          newNodeId
        )
        delete duplicatedNode.fallbackCondition.join
      }

      tree.nodes.push(duplicatedNode)
      return true
    })
  }

  createNode(newNode: node) {
    const nodeToCreate = structuredClone(newNode)

    if (nodeToCreate.type === 'distributor') {
      nodeToCreate.fallbackCondition = {
        id: `condition_${nodeToCreate.id.split('_')[1]}_fallback`,
      }
    }
    if (nodeToCreate.type === 'text') {
      nodeToCreate.userTextOptions = {
        placeholder: '',
        property: '',
        description: '',
      }
    }

    this.mutations.update((tree) => {
      tree.nodes.push(nodeToCreate)
    })
  }

  removeNode(nodeId: string) {
    this.mutations.update((tree) => {
      const nodeExists = tree.nodes.some((storyNode) => storyNode.id === nodeId)
      if (!nodeExists) return false

      tree.nodes = tree.nodes.filter((storyNode) => storyNode.id !== nodeId)

      for (const storyNode of tree.nodes) {
        this.removeJoinsTo(storyNode, nodeId)
        for (const answer of storyNode.answers ?? []) {
          this.removeJoinsTo(answer, nodeId)
        }
        for (const condition of storyNode.conditions ?? []) {
          this.removeJoinsTo(condition, nodeId)
        }
        if (storyNode.fallbackCondition) {
          this.removeJoinsTo(storyNode.fallbackCondition, nodeId)
        }
      }

      return true
    })
  }

  updateNodeText(nodeId: string, text: string) {
    this.withNode(nodeId, (storyNode) => (storyNode.text = text))
  }

  saveNodeEvents(nodeId: string, events: event[]) {
    this.withNode(
      nodeId,
      (storyNode) => (storyNode.events = structuredClone(events))
    )
  }

  updateNodeProperty(nodeId: string, property: string) {
    this.withNode(nodeId, (storyNode) => {
      this.ensureUserTextOptions(storyNode).property = property
    })
  }

  updateNodePlaceholder(nodeId: string, placeholder: string) {
    this.withNode(nodeId, (storyNode) => {
      this.ensureUserTextOptions(storyNode).placeholder = placeholder
    })
  }

  updateNodeDescription(nodeId: string, description: string) {
    this.withNode(nodeId, (storyNode) => {
      this.ensureUserTextOptions(storyNode).description = description
    })
  }

  updateNodeButtonText(nodeId: string, buttonText: string) {
    this.withNode(nodeId, (storyNode) => {
      this.ensureUserTextOptions(storyNode).buttonText = buttonText
    })
  }

  updateNodeLinks(nodeId: string, links: link[]) {
    this.withNode(
      nodeId,
      (storyNode) => (storyNode.links = structuredClone(links))
    )
  }

  updateNodePosition(nodeId: string, left: number, top: number) {
    this.withNode(nodeId, (storyNode) => {
      storyNode.left = left
      storyNode.top = top
    })
  }

  updateNodeShareOptions(nodeId: string, options: shareOptions) {
    this.withNode(
      nodeId,
      (storyNode) => (storyNode.share = structuredClone(options))
    )
  }

  addImageToNode(nodeId: string, imagePath: string) {
    this.withNode(nodeId, (storyNode) => {
      storyNode.image = { path: imagePath }
    })
  }

  removeImageFromNode(nodeId: string) {
    this.withNode(nodeId, (storyNode) => {
      delete storyNode.image
    })
  }

  getImageFromNode(nodeId: string): node['image'] {
    return findNodeInTree(nodeId, this.activeStory.entireTree())?.image
  }

  createNodeCondition(nodeId: string, conditionId: string) {
    this.withNode(nodeId, (storyNode) => {
      storyNode.conditions = [
        ...(storyNode.conditions ?? []),
        { id: conditionId },
      ]
    })
  }

  updateConditionValues(conditionId: string, values: node_conditions) {
    const nodeId = `node_${conditionId.split('_')[1]}`
    this.withNode(nodeId, (storyNode) => {
      const condition = storyNode.conditions?.find(
        (candidate) => candidate.id === conditionId
      )
      if (!condition) return

      condition.ref = values.ref
      condition.comparator = values.comparator
      condition.value = Number(values.value ?? 0)
    })
  }

  removeCondition(nodeId: string, conditionId: string) {
    this.withNode(nodeId, (storyNode) => {
      storyNode.conditions = storyNode.conditions?.filter(
        (condition) => condition.id !== conditionId
      )
    })
  }

  updateAnswerText(answerId: string, text: string) {
    this.withAnswer(answerId, (answer) => (answer.text = text))
  }

  createNodeAnswer(nodeId: string, answerId: string) {
    this.withNode(nodeId, (storyNode) => {
      const answer: node_answer = {
        id: answerId,
        text: '',
        events: [],
        requirements: [],
      }
      storyNode.answers = [...(storyNode.answers ?? []), answer]
      delete storyNode.join
    })
  }

  removeAnswer(nodeId: string, answerId: string) {
    this.withNode(nodeId, (storyNode) => {
      const remainingAnswers = storyNode.answers?.filter(
        (answer) => answer.id !== answerId
      )
      storyNode.answers = remainingAnswers?.length
        ? remainingAnswers
        : undefined
    })
  }

  saveAnswerEvents(answerId: string, events: event[]) {
    this.withAnswer(
      answerId,
      (answer) => (answer.events = structuredClone(events))
    )
  }

  saveAnswerRequirements(answerId: string, requirements: answer_requirement[]) {
    this.withAnswer(
      answerId,
      (answer) => (answer.requirements = structuredClone(requirements))
    )
  }

  getEventsOfAnswer(answerId: string): event[] {
    const events = findAnswerInTree(
      answerId,
      this.activeStory.entireTree()
    )?.events
    return structuredClone(events ?? [])
  }

  getRequirementsOfAnswer(answerId: string): answer_requirement[] {
    const requirements = findAnswerInTree(
      answerId,
      this.activeStory.entireTree()
    )?.requirements
    return structuredClone(requirements ?? [])
  }

  updateJoinOfOption(
    originId: string,
    destinyNodeId: string,
    toAnswer = false
  ) {
    this.mutations.update((tree) => {
      const option = this.findOrCreateJoinOrigin(originId, tree)
      if (!option) return false

      return this.addJoin(
        option,
        destinyNodeId,
        toAnswer,
        !originId.endsWith('_fallback')
      )
    })
  }

  removeJoin(
    originId: string,
    destinyNodeId: string,
    toAnswer: boolean | undefined
  ) {
    return this.mutations.update((tree) => {
      const origin = this.findJoinOrigin(originId, tree)
      if (!origin?.join) return false

      const remainingJoins = origin.join.filter(
        (storyJoin) =>
          !(
            storyJoin.node === destinyNodeId &&
            !!storyJoin.toAnswer === !!toAnswer
          )
      )
      if (remainingJoins.length === origin.join.length) return false

      origin.join = remainingJoins
      return true
    })
  }

  private withNode(nodeId: string, mutate: (storyNode: node) => void) {
    this.mutations.update((tree) => {
      const storyNode = findNodeInTree(nodeId, tree)
      if (!storyNode) return false

      mutate(storyNode)
      return true
    })
  }

  private withAnswer(answerId: string, mutate: (answer: node_answer) => void) {
    this.mutations.update((tree) => {
      const answer = findAnswerInTree(answerId, tree)
      if (!answer) return false

      mutate(answer)
      return true
    })
  }

  private findOrCreateJoinOrigin(
    originId: string,
    storyTree: tree
  ): Joinable | undefined {
    if (!originId.endsWith('_fallback')) {
      return this.findJoinOrigin(originId, storyTree)
    }

    const nodeId = `node_${originId.split('_')[1]}`
    const storyNode = findNodeInTree(nodeId, storyTree)
    if (!storyNode) return undefined

    storyNode.fallbackCondition ??= { id: originId }
    return storyNode.fallbackCondition
  }

  private findJoinOrigin(
    originId: string,
    storyTree: tree
  ): Joinable | undefined {
    return (
      findNodeInTree(originId, storyTree) ||
      findAnswerInTree(originId, storyTree) ||
      findConditionsInTree(originId, storyTree)
    )
  }

  private addJoin(
    option: Joinable,
    destinyNodeId: string,
    toAnswer: boolean,
    matchToAnswer: boolean
  ): boolean {
    const isDuplicate = option.join?.some(
      (storyJoin) =>
        storyJoin.node === destinyNodeId &&
        (!matchToAnswer || !!storyJoin.toAnswer === toAnswer)
    )
    if (isDuplicate) return false

    option.join = [...(option.join ?? []), { node: destinyNodeId, toAnswer }]
    return true
  }

  private removeJoinsTo(option: Joinable, nodeId: string) {
    if (!option.join) return
    option.join = option.join.filter((storyJoin) => storyJoin.node !== nodeId)
  }

  private ensureUserTextOptions(storyNode: node) {
    storyNode.userTextOptions ??= { property: '' }
    return storyNode.userTextOptions
  }

  private replaceNodePartOfId(id: string, newNodeId: string) {
    return id.replace(/_[0-9]+_/, `_${newNodeId.split('_')[1]}_`)
  }
}
