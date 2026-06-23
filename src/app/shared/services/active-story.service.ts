import { Injectable, WritableSignal, effect, signal } from '@angular/core'
import {
  getNodeIdFromAnswerId,
  findNodeInTree,
  findAnswerInTree,
  findConditionsInTree,
  generateIDForNewRequirement,
} from '../utils/tree-searching'
import {
  config,
  link,
  node_conditions,
  node,
  shareOptions,
} from '../../core/interfaces/interfaces'
import { DatabaseService } from 'src/app/core/services/database.service'

@Injectable({
  providedIn: 'root',
})
export class ActiveStoryService {
  initialConfiguration: config = {
    title: '',
    showLockedAnswers: false,
    sharing: false,
    tapLink: false,
    cumulativeMode: false,
    footer: {},
    tracking: false,
    customId: undefined,
  }
  storyId: WritableSignal<string> = signal('')
  entireTree: WritableSignal<any> = signal({})

  storyName: WritableSignal<string> = signal('')
  storyRefs: WritableSignal<any> = signal([])
  storyConfiguration: WritableSignal<config> = signal(this.initialConfiguration)

  constructor(private db: DatabaseService) {
    effect(() => {
      const pageTitle = document.querySelector('title')
      if (pageTitle) pageTitle.innerHTML = this.storyName()
    })
  }

  public reset() {
    this.storyId.set('')
    this.entireTree.set({})
    this.storyName.set('')
    this.storyRefs.set([])
    this.storyConfiguration.set(this.initialConfiguration)
  }
  // REFS
  // The refs are built from the tree, so we need to build them first.
  // We add and remove refs on the active story. We don't need this on the tree.
  initTreeRefs() {
    const builtRefs: any = []

    for (const node of this.entireTree().nodes) {
      for (const answer of node.answers ?? []) {
        for (const requirement of answer.requirements ?? []) {
          if (requirement.id) {
            builtRefs.push(
              this.buildRef(requirement.id, node.id, answer.id, 'requirement')
            )
          }
        }
        for (const event of answer.events ?? []) {
          if (event.target) {
            builtRefs.push(
              this.buildRef(event.target, node.id, answer.id, 'event')
            )
          }
        }
      }
    }

    this.storyRefs.set(builtRefs)
  }

  // Builds a story-ref entry by combining a tree ref (name/type/category)
  // with its location in the tree (node, answer) and what it is used for.
  private buildRef(
    refId: string,
    nodeId: string,
    answerId: string,
    on: 'event' | 'requirement'
  ) {
    const ref = this.entireTree().refs[refId]
    return {
      id: refId,
      name: ref.name,
      type: ref.type,
      category: ref.category,
      node: nodeId,
      answer: answerId,
      on,
    }
  }

  addRef(on: 'event' | 'requirement', refId: any, previousRef?: any) {
    if (!this.entireTree().refs) return console.error('Error while adding ref')

    if (previousRef) this.removeRef(on, previousRef)

    const withNewRef = [
      ...this.storyRefs(),
      this.buildRef(
        refId.id,
        getNodeIdFromAnswerId(refId.answer),
        refId.answer,
        on
      ),
    ]

    this.storyRefs.set(withNewRef)

    this.saveTree()
  }

  removeRef(on: 'event' | 'requirement', refToRemove: any) {
    const withoutRef = this.storyRefs().filter(
      (ref: any) =>
        !(
          ref.id === refToRemove.id &&
          ref.answer === refToRemove.answer &&
          ref.on === on
        )
    )

    this.storyRefs.set(withoutRef)

    this.saveTree()
  }
  createNewRef(name: string, type: 'stat' | 'condition' | 'property') {
    if (!this.entireTree().refs) {
      this.entireTree().refs = {}
    }

    // Check if the name already exists in the refs
    const duplicatedRef = Object.keys(this.entireTree().refs).find(
      (ref: any) =>
        this.entireTree().refs[ref].name === name &&
        this.entireTree().refs[ref].type === type
    )

    if (duplicatedRef) {
      console.log('Duplicated ref. Skip creation')
      return
    }

    const newId =
      type + '_' + generateIDForNewRequirement(this.entireTree().refs)
    this.entireTree().refs[newId] = { name, type }

    return { id: newId, name: name, type }
  }
  updateRefName(refId: string, newName: string) {
    this.entireTree().refs[refId].name = newName

    this.saveTree()
  }
  deleteRef(refId: string) {
    delete this.entireTree().refs[refId]

    this.saveTree()
  }
  getRefs() {
    return this.entireTree().refs
  }
  getRefsFormatted(type: 'stat' | 'condition' | 'property') {
    const refs = this.entireTree().refs

    if (!refs) return []
    return Object.keys(refs)
      .filter((ref: any) => refs[ref].type === type)
      .map((option: any) => {
        return { id: option, name: refs[option].name, type: refs[option].type }
      })
  }
  getRefName(refId: string) {
    const refs = this.entireTree().refs
    return refs[refId].name
  }

  // TREE updates
  // Nodes
  duplicateNode(id: string, newId: string) {
    const duplicatedNode = structuredClone(
      this.entireTree().nodes.find((node: any) => node.id === id)
    )

    duplicatedNode.id = newId
    if (duplicatedNode.answers) {
      duplicatedNode.answers = duplicatedNode.answers.map((answer: any) => {
        const newAnswerId = answer.id.replace(
          /_[0-9]+_/,
          `_${newId.split('_')[1]}_`
        )
        answer.id = newAnswerId
        delete answer.join
        return answer
      })
    }
    if (duplicatedNode.conditions) {
      duplicatedNode.conditions = duplicatedNode.conditions.map(
        (condition: any) => {
          const newConditionId = condition.id.replace(
            /_[0-9]+_/,
            `_${newId.split('_')[1]}_`
          )
          condition.id = newConditionId
          delete condition.join
          return condition
        }
      )
    }
    if (duplicatedNode.fallbackCondition) {
      duplicatedNode.fallbackCondition.id =
        duplicatedNode.fallbackCondition.id.replace(
          /_[0-9]+_/,
          `_${newId.split('_')[1]}_`
        )
      delete duplicatedNode.fallbackCondition.join
    }

    duplicatedNode.left = duplicatedNode.left + 290

    // Add the new node to the entireTree object. This will add it to the board
    this.entireTree().nodes.push(duplicatedNode)

    this.saveTree()
  }

  createNode({ id, top, left, type }: any) {
    const newNode: node = {
      id,
      type,
      top,
      left,
    }
    if (type === 'distributor') {
      newNode.fallbackCondition = {
        id: `condition_${id.split('_')[1]}_fallback`,
      }
    }
    if (type === 'text') {
      newNode.userTextOptions = {
        placeholder: '',
        property: '',
        description: '',
      }
    }

    this.entireTree().nodes?.push(newNode)

    this.saveTree()
  }
  removeNode(nodeId: string) {
    // Remove node from tree
    this.entireTree().nodes = this.entireTree().nodes?.filter(
      (node: any) => node.id !== nodeId
    )

    // Remove node from joins that have it
    for (const node of this.entireTree().nodes) {
      if (node.join) {
        node.join = node.join.filter((join: any) => join.node !== nodeId)
      }

      if (node.answers) {
        for (const answer of node.answers) {
          if (answer.join) {
            answer.join = answer.join.filter(
              (join: any) => join.node !== nodeId
            )
          }
        }
      }
      if (node.conditions) {
        for (const condition of node.conditions) {
          if (condition.join) {
            condition.join = condition.join.filter(
              (join: any) => join.node !== nodeId
            )
          }
        }
      }
      if (node.fallbackCondition?.join) {
        node.fallbackCondition.join = node.fallbackCondition.join.filter(
          (join: any) => join.node !== nodeId
        )
      }
    }

    this.activateTreeChangeEffects()

    this.saveTree()
  }
  updateNodeText(nodeId: string, newText: string) {
    this.withNode(nodeId, (node) => (node.text = newText))
  }
  saveNodeEvents(nodeId: string, events: any) {
    this.withNode(nodeId, (node) => (node.events = events))
  }
  deleteEventFromNode(nodeId: string, eventTarget: string) {
    this.withNode(nodeId, (node) => {
      if (node.events) {
        node.events = node.events.filter(
          (event: any) => event.target !== eventTarget
        )
      }
    })
  }
  updateNodeProperty(nodeId: string, newProperty: string) {
    this.withNode(
      nodeId,
      (node) => (node.userTextOptions.property = newProperty)
    )
  }
  updateNodePlaceholder(nodeId: string, newPlaceholder: string) {
    this.withNode(
      nodeId,
      (node) => (node.userTextOptions.placeholder = newPlaceholder)
    )
  }

  updateNodeDescription(nodeId: string, newDescription: string) {
    this.withNode(
      nodeId,
      (node) => (node.userTextOptions.description = newDescription)
    )
  }

  updateNodeLinks(nodeId: string, links: link[]) {
    this.withNode(nodeId, (node) => (node.links = links))
  }
  updateNodePosition(nodeId: string, left: number, top: number) {
    const node = findNodeInTree(nodeId, this.entireTree())
    node.left = left
    node.top = top

    this.activateTreeChangeEffects()
  }
  updateNodeShareOptions(nodeId: string, sharingOptions: shareOptions) {
    this.withNode(nodeId, (node) => (node.share = sharingOptions))
  }
  updateNodeButtonText(nodeId: string, newButtonText: string) {
    this.withNode(
      nodeId,
      (node) => (node.userTextOptions.buttonText = newButtonText)
    )
  }
  addImageToNode(nodeId: string, imagePath: string) {
    this.withNode(nodeId, (node) => (node.image = { path: imagePath }))
  }
  removeImageFromNode(nodeId: string) {
    this.withNode(nodeId, (node) => (node.image = undefined))
  }

  // TODO -> Are all this get really necessary since the use of signals for the tree?
  getImageFromNode(nodeId: string) {
    const node = findNodeInTree(nodeId, this.entireTree())

    return node.image
  }
  // distributor nodes only
  createNodeCondition(nodeId: string, conditionId: string) {
    const node = findNodeInTree(nodeId, this.entireTree())

    if (!node.conditions) node.conditions = []

    node.conditions.push({
      id: conditionId,
    })
  }
  updateConditionValues(conditionId: string, values: node_conditions) {
    const conditionNodeId = conditionId.split('_')[1]

    this.withNode(`node_${conditionNodeId}`, (node) => {
      const condition = node.conditions?.find(
        (condition: any) => condition.id === conditionId
      )
      if (condition) {
        condition.ref = values.ref
        condition.comparator = values.comparator
        condition.value = values.value
      }
    })
  }
  removeCondition(nodeId: string, conditionId: string) {
    this.withNode(nodeId, (node) => {
      node.conditions = node.conditions?.filter(
        (condition: any) => condition.id !== conditionId
      )
    })
  }

  // Answers
  updateAnswerText(answerId: string, newText: string) {
    this.withAnswer(answerId, (answer) => (answer.text = newText))
  }
  createNodeAnswer(nodeId: string, answerId: string) {
    const node = findNodeInTree(nodeId, this.entireTree())
    if (node.answers) {
      node.answers.push({
        id: answerId,
      })
    } else {
      node.answers = [{ id: answerId }]
    }

    delete node.join
  }
  removeAnswer(nodeId: string, answerId: string) {
    this.withNode(nodeId, (node) => {
      node.answers = node.answers?.filter(
        (answer: any) => answer.id !== answerId
      )
      if (node.answers.length === 0) delete node.answers
    })
  }
  saveAnswerEvents(answerId: string, events: any) {
    this.withAnswer(answerId, (answer) => (answer.events = events))
  }
  deleteEventFromAnswer(answerId: string, eventTarget: string) {
    this.withAnswer(answerId, (answer) => {
      if (answer.events) {
        answer.events = answer.events.filter(
          (event: any) => event.target !== eventTarget
        )
      }
    })
  }
  saveAnswerRequirements(answerId: string, requirements: any) {
    this.withAnswer(answerId, (answer) => (answer.requirements = requirements))
  }
  updateRequirementAmount(
    answerId: string,
    requirementId: string,
    amount: number
  ) {
    this.withAnswer(answerId, (answer) => {
      if (answer.requirements) {
        const requirement = answer.requirements.find(
          (req: any) => req.id === requirementId
        )
        requirement.amount = amount
      }
    })
  }
  deleteRequirementFromAnswer(answerId: string, requirementId: string) {
    this.withAnswer(answerId, (answer) => {
      if (answer.requirements) {
        answer.requirements = answer.requirements.filter(
          (req: any) => req.id !== requirementId
        )
      }
    })
  }

  updateJoinOfOption(
    originId: string,
    destinyNodeId: string,
    toAnswer = false
  ) {
    const [optionNodeType, optionNodeId, suffix] = originId.split('_')
    const isFallbackCondition = suffix === 'fallback'
    const node = findNodeInTree(`node_${optionNodeId}`, this.entireTree())

    let added: boolean
    if (isFallbackCondition) {
      if (!node.fallbackCondition) {
        node.fallbackCondition = {
          id: 'condition_' + optionNodeId + '_fallback',
        }
      }
      // Fallback joins are deduped on the destiny node only, ignoring toAnswer
      added = this.addJoin(
        node.fallbackCondition,
        destinyNodeId,
        toAnswer,
        false
      )
    } else if (optionNodeType === 'node') {
      const willJoinNode = findNodeInTree(originId, this.entireTree())
      added = this.addJoin(willJoinNode, destinyNodeId, toAnswer)
    } else {
      const option = node[optionNodeType + 's']?.find(
        (option: any) => option.id === originId
      )
      added = this.addJoin(option, destinyNodeId, toAnswer)
    }

    if (!added) return

    this.activateTreeChangeEffects()

    this.saveTree()
  }
  removeJoin(originId: string, destinyId: string, toAnswer: boolean) {
    const origin =
      findNodeInTree(originId, this.entireTree()) ||
      findAnswerInTree(originId, this.entireTree()) ||
      findConditionsInTree(originId, this.entireTree())

    if (origin.join) {
      origin.join = origin.join.filter((join: any) => {
        return !(join.node === destinyId && join.toAnswer === toAnswer)
      })
    }

    this.activateTreeChangeEffects()

    const saved = this.saveTree()
    if (!saved) return false

    return origin.join
  }
  // TODO -> Are all this gets really necessary since the use of signals for the tree?
  getEventsOfAnswer(answerId: string) {
    const answer = findAnswerInTree(answerId, this.entireTree())

    if (!answer.events) return []
    return answer.events
  }
  getRequirementsOfAnswer(answerId: string) {
    const answer = findAnswerInTree(answerId, this.entireTree())
    return answer.requirements
  }
  getJoinsOfAnswer(answerId: string) {
    const answer = findAnswerInTree(answerId, this.entireTree())
    return answer.join
  }
  getDetailedRequirementsOfAnswer(answerId: string) {
    const answer = findAnswerInTree(answerId, this.entireTree())

    if (!answer.requirements) return []
    const detailedRequirements = answer.requirements.map((requirement: any) => {
      return {
        ...requirement,
        ...this.entireTree().refs[requirement.id],
      }
    })

    return detailedRequirements
  }

  // Categories
  createCategory(newCategory: string) {
    if (!this.entireTree().categories) this.entireTree().categories = []
    this.entireTree().categories.push({ id: newCategory, name: newCategory })
  }
  setCategoryToRef(refId: string, categoryId: string) {
    this.entireTree().refs[refId].category = categoryId

    this.saveTree()
  }
  getCategories() {
    return this.entireTree().categories || []
  }

  // Utility to launch all the signal effect listeners
  public activateTreeChangeEffects() {
    if (this.entireTree) this.entireTree.set({ ...this.entireTree() })
  }

  // Persists the current tree to the DB. Most mutations call this after
  // updating the in-memory tree.
  private saveTree() {
    return this.db.saveTreeToDB(this.storyId(), this.entireTree())
  }

  // Finds a node, applies a mutation to it (if found) and persists the tree.
  private withNode(nodeId: string, mutate: (node: any) => void) {
    const node = findNodeInTree(nodeId, this.entireTree())
    if (node) mutate(node)
    this.saveTree()
  }

  // Finds an answer, applies a mutation to it (if found) and persists the tree.
  private withAnswer(answerId: string, mutate: (answer: any) => void) {
    const answer = findAnswerInTree(answerId, this.entireTree())
    if (answer) mutate(answer)
    this.saveTree()
  }

  // Pushes a join onto an option (node/answer/condition), skipping duplicates.
  // Returns true if a join was added, false if it was a duplicate. Set
  // matchToAnswer to false to dedupe on the destiny node only.
  private addJoin(
    option: any,
    destinyNodeId: string,
    toAnswer: boolean,
    matchToAnswer = true
  ): boolean {
    const isDuplicate = option.join?.some(
      (join: any) =>
        join.node === destinyNodeId &&
        (!matchToAnswer || join.toAnswer === toAnswer)
    )

    if (isDuplicate) {
      console.log('Duplicated join. Skip creation')
      return false
    }

    if (!option.join) option.join = []
    option.join.push({ node: destinyNodeId, toAnswer })
    return true
  }
}
