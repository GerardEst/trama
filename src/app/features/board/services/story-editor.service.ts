import { Injectable } from '@angular/core'
import {
  answer_requirement,
  event,
  join,
  link,
  node,
  node_answer,
  node_condition_rule,
  shareOptions,
  tree,
} from 'src/app/core/interfaces/interfaces'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { StoryMutationService } from 'src/app/shared/services/story-mutation.service'
import { StoryImagesService, StoryImageUploadResult } from 'src/app/shared/services/story-images.service'
import {
  findAnswerInTree,
  findConditionsInTree,
  findNodeInTree,
  generateIDForNewNode,
} from 'src/app/shared/utils/tree-searching'

import { ENTRY_POINT_ORIGIN } from '../board-interactions'

interface Joinable {
  join?: join[]
}

/** Owns graph and node editing rules for the authoring board. */
import { I18nService } from 'src/app/core/i18n/i18n.service'

@Injectable({
  providedIn: 'root',
})
export class StoryEditorService {
  constructor(
    private activeStory: ActiveStoryService,
    private mutations: StoryMutationService,
    private i18n: I18nService,
    private images: StoryImagesService
  ) {}

  batch<T>(action: () => T): T {
    return this.mutations.batch(action)
  }

  duplicateNode(nodeId: string, newNodeId: string) {
    this.mutations.update((tree) => {
      const source = findNodeInTree(nodeId, tree)
      if (!source || source.type === 'group') return false

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
    const image = this.getImageFromNode(nodeId)
    const changed = this.mutations.update((tree) => {
      const existing = findNodeInTree(nodeId, tree)
      if (!existing) return false
      const moved = new Set<string>([nodeId])
      if (existing.type === 'group') {
        for (const child of tree.nodes) {
          if (child.groupId === nodeId) {
            child.groupId = existing.groupId
            moved.add(child.id)
          }
        }
      }

      tree.nodes = tree.nodes.filter((storyNode) => storyNode.id !== nodeId)
      if (tree.entryPoint?.targetNodeId === nodeId) delete tree.entryPoint.targetNodeId
      this.detachFromFrames(tree, moved)

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
    if (changed) {
      this.images.cancelNodeUploads(this.activeStory.storyId(), nodeId)
      if (image) this.images.retireImage(image.path)
    }
  }

  groupNodes(
    nodeIds: ReadonlySet<string>,
    parentGroupId?: string
  ): string | undefined {
    const nodes = this.activeStory.entireTree().nodes
    const selected = nodes.filter((storyNode) => nodeIds.has(storyNode.id))
    if (
      selected.length < 2 ||
      selected.length !== nodeIds.size ||
      selected.some(
        (storyNode) =>
          storyNode.groupId !== parentGroupId
      ) ||
      (parentGroupId &&
        !nodes.some(
          (storyNode) =>
            storyNode.id === parentGroupId && storyNode.type === 'group'
        ))
    ) return undefined

    const groupId = generateIDForNewNode(nodes)
    const left = Math.min(...selected.map((storyNode) => Number(storyNode.left) || 0))
    const top = Math.min(...selected.map((storyNode) => Number(storyNode.top) || 0))
    this.mutations.update((tree) => {
      for (const storyNode of tree.nodes) {
        if (nodeIds.has(storyNode.id)) storyNode.groupId = groupId
      }
      this.detachFromFrames(tree, nodeIds)
      tree.nodes.push({
        id: groupId,
        type: 'group',
        text: this.i18n.t('board.groups.defaultName'),
        left,
        top,
        groupId: parentGroupId,
      })
    })
    return groupId
  }

  ungroupNodes(groupId: string) {
    this.mutations.update((tree) => {
      const group = findNodeInTree(groupId, tree)
      if (!group || group.type !== 'group') return false
      const moved = new Set<string>([groupId])
      for (const child of tree.nodes) {
        if (child.groupId === groupId) {
          child.groupId = group.groupId
          moved.add(child.id)
        }
      }
      this.detachFromFrames(tree, moved)
      tree.nodes = tree.nodes.filter((storyNode) => storyNode.id !== groupId)
      return true
    })
  }

  private detachFromFrames(story: tree, nodeIds: ReadonlySet<string>) {
    for (const frame of story.frames ?? []) {
      frame.nodeIds = frame.nodeIds.filter((id) => !nodeIds.has(id))
    }
    story.frames = story.frames?.filter((frame) => frame.nodeIds.length > 0)
  }

  frameNodes(nodeIds: ReadonlySet<string>, groupId?: string): string | undefined {
    const story = this.activeStory.entireTree()
    const selected = story.nodes.filter((storyNode) => nodeIds.has(storyNode.id))
    if (
      selected.length < 2 || selected.length !== nodeIds.size ||
      selected.some((storyNode) => storyNode.groupId !== groupId) ||
      (groupId && !story.nodes.some((storyNode) => storyNode.id === groupId && storyNode.type === 'group'))
    ) return undefined

    const id = crypto.randomUUID()
    this.mutations.update((tree) => {
      // A node belongs to at most one visual frame at a given level.
      this.detachFromFrames(tree, nodeIds)
      tree.frames ??= []
      tree.frames.push({
        id,
        name: this.i18n.t('board.frames.defaultName'),
        nodeIds: [...nodeIds],
        groupId,
      })
    })
    return id
  }

  renameFrame(frameId: string, name: string) {
    this.mutations.update((tree) => {
      const frame = tree.frames?.find((item) => item.id === frameId)
      if (!frame) return false
      frame.name = name.trim() || 'Frame'
      return true
    })
  }

  removeFrame(frameId: string) {
    this.mutations.update((tree) => {
      if (!tree.frames?.some((frame) => frame.id === frameId)) return false
      tree.frames = tree.frames.filter((frame) => frame.id !== frameId)
      return true
    })
  }

  removeNodeFromFrame(nodeId: string, position: { x: number; y: number }) {
    this.mutations.update((tree) => {
      if (!tree.nodes.some((node) => node.id === nodeId) ||
        !tree.frames?.some((frame) => frame.nodeIds.includes(nodeId))) return false
      this.detachFromFrames(tree, new Set([nodeId]))
      this.moveNodes(tree, new Map([[nodeId, position]]))
      return true
    })
  }

  updateNodeName(nodeId: string, name: string) {
    this.withNode(nodeId, (storyNode) => {
      const trimmed = name.trim()
      if (trimmed) storyNode.name = trimmed
      else delete storyNode.name
    })
  }

  updateNodeText(nodeId: string, text: string) {
    this.withNode(nodeId, (storyNode) => (storyNode.text = text), `node-text:${nodeId}`)
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
    this.updateNodePositions(new Map([[nodeId, { x: left, y: top }]]))
  }

  updateNodePositions(
    positions: ReadonlyMap<string, { x: number; y: number }>,
    frameAssignment?: { frameId: string; nodeIds: ReadonlySet<string> }
  ) {
    this.mutations.update((tree) => {
      const changed = this.moveNodes(tree, positions)
      if (frameAssignment) {
        const frame = tree.frames?.find((item) => item.id === frameAssignment.frameId)
        const members = tree.nodes.filter((node) => frameAssignment.nodeIds.has(node.id))
        if (
          frame && members.length > 0 && members.length === frameAssignment.nodeIds.size &&
          members.every((node) => node.groupId === frame.groupId && positions.has(node.id))
        ) {
          for (const other of tree.frames ?? []) {
            if (other.id !== frame.id) {
              other.nodeIds = other.nodeIds.filter((id) => !frameAssignment.nodeIds.has(id))
            }
          }
          tree.frames = tree.frames?.filter((item) => item.id === frame.id || item.nodeIds.length > 0)
          for (const member of members) {
            if (!frame.nodeIds.includes(member.id)) frame.nodeIds.push(member.id)
          }
        }
      }
      return changed
    })
  }

  private moveNodes(
    tree: tree,
    positions: ReadonlyMap<string, { x: number; y: number }>
  ): boolean {
    let changed = false
    const entryPosition = positions.get(ENTRY_POINT_ORIGIN)
    if (entryPosition && tree.entryPoint &&
      (tree.entryPoint.left !== entryPosition.x || tree.entryPoint.top !== entryPosition.y)) {
      tree.entryPoint.left = entryPosition.x
      tree.entryPoint.top = entryPosition.y
      changed = true
    }
    const offsets = new Map<string, { x: number; y: number }>()
    for (const storyNode of tree.nodes) {
      const position = positions.get(storyNode.id)
      if (!position) continue
      if (storyNode.type === 'group') {
        offsets.set(storyNode.id, {
          x: position.x - Number(storyNode.left),
          y: position.y - Number(storyNode.top),
        })
      }
      storyNode.left = position.x
      storyNode.top = position.y
      changed = true
    }
    if (offsets.size) {
      const byId = new Map(tree.nodes.map((storyNode) => [storyNode.id, storyNode]))
      for (const storyNode of tree.nodes) {
        if (positions.has(storyNode.id)) continue
        let ancestor = storyNode.groupId
        while (ancestor) {
          const offset = offsets.get(ancestor)
          if (offset) {
            storyNode.left = Number(storyNode.left) + offset.x
            storyNode.top = Number(storyNode.top) + offset.y
          }
          ancestor = byId.get(ancestor)?.groupId
        }
      }
    }
    return changed
  }

  updateNodeShareOptions(nodeId: string, options: shareOptions) {
    this.withNode(
      nodeId,
      (storyNode) => (storyNode.share = structuredClone(options))
    )
  }

  async uploadImageToNode(nodeId: string, file: File): Promise<StoryImageUploadResult> {
    const result = await this.images.uploadForNode(nodeId, file)
    if (result.status !== 'uploaded') return result
    if (!this.images.claimUpload(result)) return { status: 'cancelled' }
    this.addImageToNode(result.nodeId, result.path)
    return result
  }

  addImageToNode(nodeId: string, imagePath: string) {
    const previous = this.getImageFromNode(nodeId)
    if (previous?.path === imagePath) return
    this.withNode(nodeId, (storyNode) => {
      storyNode.image = { path: imagePath }
    })
    if (previous) this.images.retireImage(previous.path)
  }

  removeImageFromNode(nodeId: string) {
    const image = this.getImageFromNode(nodeId)
    if (!image) return
    this.withNode(nodeId, (storyNode) => {
      delete storyNode.image
    })
    this.images.cancelNodeUploads(this.activeStory.storyId(), nodeId)
    this.images.retireImage(image.path)
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

  updateConditionValues(
    conditionId: string,
    values: node_condition_rule,
    ruleIndex = 0
  ) {
    const nodeId = `node_${conditionId.split('_')[1]}`
    this.withNode(nodeId, (storyNode) => {
      const route = storyNode.conditions?.find(
        (candidate) => candidate.id === conditionId
      )
      if (!route) return

      const rule = route.rules
        ? route.rules[ruleIndex]
        : ruleIndex === 0
          ? route
          : undefined
      if (!rule) return

      rule.ref = values.ref
      rule.comparator = values.comparator
      rule.value = Number(values.value ?? 0)
    })
  }

  addConditionRule(conditionId: string) {
    const nodeId = `node_${conditionId.split('_')[1]}`
    this.withNode(nodeId, (storyNode) => {
      const route = storyNode.conditions?.find(
        (candidate) => candidate.id === conditionId
      )
      if (!route) return

      if (!route.rules) {
        route.rules = [
          { ref: route.ref, comparator: route.comparator, value: route.value },
        ]
        delete route.ref
        delete route.comparator
        delete route.value
      }
      route.rules.push({})
    })
  }

  removeConditionRule(conditionId: string, ruleIndex: number) {
    const nodeId = `node_${conditionId.split('_')[1]}`
    this.withNode(nodeId, (storyNode) => {
      const route = storyNode.conditions?.find(
        (candidate) => candidate.id === conditionId
      )
      if (!route?.rules || route.rules.length <= 1) return
      route.rules.splice(ruleIndex, 1)
    })
  }

  reorderCondition(nodeId: string, conditionId: string, toIndex: number) {
    return this.mutations.update((tree) => {
      const routes = findNodeInTree(nodeId, tree)?.conditions
      const fromIndex = routes?.findIndex(route => route.id === conditionId) ?? -1
      if (!routes || fromIndex < 0 || !Number.isInteger(toIndex) ||
        toIndex < 0 || toIndex >= routes.length || fromIndex === toIndex) return false
      const [route] = routes.splice(fromIndex, 1)
      routes.splice(toIndex, 0, route)
      return true
    })
  }

  moveCondition(nodeId: string, conditionId: string, direction: -1 | 1) {
    this.withNode(nodeId, (storyNode) => {
      const routes = storyNode.conditions
      const index = routes?.findIndex((route) => route.id === conditionId) ?? -1
      if (
        !routes ||
        index < 0 ||
        index + direction < 0 ||
        index + direction >= routes.length
      ) return
      const [route] = routes.splice(index, 1)
      routes.splice(index + direction, 0, route)
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
    this.withAnswer(answerId, (answer) => (answer.text = text), `answer-text:${answerId}`)
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

  reorderAnswer(nodeId: string, answerId: string, toIndex: number) {
    return this.mutations.update((tree) => {
      const answers = findNodeInTree(nodeId, tree)?.answers
      const fromIndex = answers?.findIndex(answer => answer.id === answerId) ?? -1
      if (!answers || fromIndex < 0 || !Number.isInteger(toIndex) ||
        toIndex < 0 || toIndex >= answers.length || fromIndex === toIndex) return false
      const [answer] = answers.splice(fromIndex, 1)
      answers.splice(toIndex, 0, answer)
      return true
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

  updateJoinOfOption(
    originId: string,
    destinyNodeId: string,
    toAnswer = false
  ) {
    this.mutations.update((tree) => {
      if (originId === ENTRY_POINT_ORIGIN) {
        const target = findNodeInTree(destinyNodeId, tree)
        if (!tree.entryPoint || !target || target.type === 'group' || toAnswer ||
          tree.entryPoint.targetNodeId === destinyNodeId) return false
        tree.entryPoint.targetNodeId = destinyNodeId
        return true
      }
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
      if (originId === ENTRY_POINT_ORIGIN) {
        if (!tree.entryPoint || tree.entryPoint.targetNodeId !== destinyNodeId || toAnswer) return false
        delete tree.entryPoint.targetNodeId
        return true
      }
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

  private withNode(nodeId: string, mutate: (storyNode: node) => void, coalescingKey?: string) {
    this.mutations.update((tree) => {
      const storyNode = findNodeInTree(nodeId, tree)
      if (!storyNode) return false

      mutate(storyNode)
      return true
    }, coalescingKey)
  }

  private withAnswer(answerId: string, mutate: (answer: node_answer) => void, coalescingKey?: string) {
    this.mutations.update((tree) => {
      const answer = findAnswerInTree(answerId, tree)
      if (!answer) return false

      mutate(answer)
      return true
    }, coalescingKey)
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
