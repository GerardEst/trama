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
} from '../interfaces'
import { DatabaseService } from './database.service'

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

  reset() {
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
    for (let node of this.entireTree().nodes) {
      if (node.answers) {
        for (let answer of node.answers) {
          if (answer.requirements) {
            for (let requirement of answer.requirements) {
              if (requirement.id) {
                builtRefs.push({
                  id: requirement.id,
                  name: this.entireTree().refs[requirement.id].name,
                  type: this.entireTree().refs[requirement.id].type,
                  category: this.entireTree().refs[requirement.id].category,
                  node: node.id,
                  answer: answer.id,
                  on: 'requirement',
                })
              }
            }
          }
          if (answer.events) {
            for (let event of answer.events) {
              if (event.target) {
                builtRefs.push({
                  id: event.target,
                  name: this.entireTree().refs[event.target].name,
                  type: this.entireTree().refs[event.target].type,
                  category: this.entireTree().refs[event.target].category,
                  node: node.id,
                  answer: answer.id,
                  on: 'event',
                })
              }
            }
          }
        }
      }
    }

    this.storyRefs.set(builtRefs)
  }

  addRef(on: 'event' | 'requirement', refId: any, previousRef?: any) {
    if (!this.entireTree().refs) return console.error('Error while adding ref')

    if (previousRef) this.removeRef(on, previousRef)

    const withNewRef = [
      ...this.storyRefs(),
      {
        id: refId.id,
        answer: refId.answer,
        name: this.entireTree().refs[refId.id].name,
        type: this.entireTree().refs[refId.id].type,
        category: this.entireTree().refs[refId.id].category,
        on,
        node: getNodeIdFromAnswerId(refId.answer),
      },
    ]

    this.storyRefs.set(withNewRef)

    // Saving to DB
    this.db.saveTreeToDB(this.storyId(), this.entireTree())
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

    // Saving to DB
    this.db.saveTreeToDB(this.storyId(), this.entireTree())
  }
  createNewRef(name: string, type: 'stat' | 'condition') {
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

    // Saving to DB
    this.db.saveTreeToDB(this.storyId(), this.entireTree())
  }
  deleteRef(refId: string) {
    delete this.entireTree().refs[refId]

    // Saving to DB
    this.db.saveTreeToDB(this.storyId(), this.entireTree())
  }
  getRefs() {
    return this.entireTree().refs
  }
  getRefsFormatted(type: 'stat' | 'condition') {
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
    let duplicatedNode = structuredClone(
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

    // Saving to DB
    this.db.saveTreeToDB(this.storyId(), this.entireTree())
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
      }
    }

    this.entireTree().nodes?.push(newNode)

    // Saving to DB
    this.db.saveTreeToDB(this.storyId(), this.entireTree())
  }
  removeNode(nodeId: string) {
    // Remove node from tree
    this.entireTree().nodes = this.entireTree().nodes?.filter(
      (node: any) => node.id !== nodeId
    )

    // Remove node from joins that have it
    for (let node of this.entireTree().nodes) {
      if (node.join) {
        node.join = node.join.filter((join: any) => join.node !== nodeId)
      }

      if (node.answers) {
        for (let answer of node.answers) {
          if (answer.join) {
            answer.join = answer.join.filter(
              (join: any) => join.node !== nodeId
            )
          }
        }
      }
      if (node.conditions) {
        for (let condition of node.conditions) {
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

    // Saving to DB
    this.db.saveTreeToDB(this.storyId(), this.entireTree())
  }
  updateNodeText(nodeId: string, newText: string) {
    const node = findNodeInTree(nodeId, this.entireTree())
    if (node) node.text = newText

    // Saving to DB
    this.db.saveTreeToDB(this.storyId(), this.entireTree())
  }
  updateNodeProperty(nodeId: string, newProperty: string) {
    const node = findNodeInTree(nodeId, this.entireTree())
    if (node) node.userTextOptions.property = newProperty

    // Saving to DB
    this.db.saveTreeToDB(this.storyId(), this.entireTree())
  }
  updateNodePlaceholder(nodeId: string, newPlaceholder: string) {
    const node = findNodeInTree(nodeId, this.entireTree())
    if (node) node.userTextOptions.placeholder = newPlaceholder

    // Saving to DB
    this.db.saveTreeToDB(this.storyId(), this.entireTree())
  }
  updateNodeLinks(nodeId: string, links: link[]) {
    const node = findNodeInTree(nodeId, this.entireTree())
    if (node) node.links = links

    // Saving to DB
    this.db.saveTreeToDB(this.storyId(), this.entireTree())
  }
  updateNodePosition(nodeId: string, left: number, top: number) {
    let node = findNodeInTree(nodeId, this.entireTree())
    node.left = left
    node.top = top

    this.activateTreeChangeEffects()
  }
  updateNodeShareOptions(nodeId: string, sharingOptions: shareOptions) {
    const node: node = findNodeInTree(nodeId, this.entireTree())
    node.share = sharingOptions

    // Saving to DB
    this.db.saveTreeToDB(this.storyId(), this.entireTree())
  }
  addImageToNode(nodeId: string, imagePath: string) {
    const node = findNodeInTree(nodeId, this.entireTree())
    node.image = {
      path: imagePath,
    }

    // Saving to DB
    this.db.saveTreeToDB(this.storyId(), this.entireTree())
  }
  removeImageFromNode(nodeId: string) {
    const node = findNodeInTree(nodeId, this.entireTree())
    node.image = undefined

    // Saving to DB
    this.db.saveTreeToDB(this.storyId(), this.entireTree())
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

    const node = findNodeInTree(`node_${conditionNodeId}`, this.entireTree())
    const condition = node?.conditions?.find(
      (condition: any) => condition.id === conditionId
    )

    if (condition) {
      condition.ref = values.ref
      condition.comparator = values.comparator
      condition.value = values.value
    }

    // Saving to DB
    this.db.saveTreeToDB(this.storyId(), this.entireTree())
  }
  removeCondition(nodeId: string, conditionId: string) {
    const node = findNodeInTree(nodeId, this.entireTree())
    const newConditions = node.conditions?.filter(
      (condition: any) => condition.id !== conditionId
    )

    node.conditions = newConditions

    // Saving to DB
    this.db.saveTreeToDB(this.storyId(), this.entireTree())
  }

  // Answers
  updateAnswerText(answerId: string, newText: string) {
    const answer = findAnswerInTree(answerId, this.entireTree())
    if (answer) answer.text = newText

    // Saving to DB
    this.db.saveTreeToDB(this.storyId(), this.entireTree())
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
    const node = findNodeInTree(nodeId, this.entireTree())
    const newAnswers = node.answers?.filter(
      (answer: any) => answer.id !== answerId
    )

    node.answers = newAnswers

    if (node.answers.length === 0) delete node.answers

    // Saving to DB
    this.db.saveTreeToDB(this.storyId(), this.entireTree())
  }
  saveAnswerEvents(answerId: string, events: any) {
    const answer = findAnswerInTree(answerId, this.entireTree())
    answer.events = events

    // Saving to DB
    this.db.saveTreeToDB(this.storyId(), this.entireTree())
  }
  deleteEventFromAnswer(answerId: string, eventTarget: string) {
    const answer = findAnswerInTree(answerId, this.entireTree())
    if (answer.events) {
      answer.events = answer.events.filter((event: any) => {
        return event.target !== eventTarget
      })
    }

    // Saving to DB
    this.db.saveTreeToDB(this.storyId(), this.entireTree())
  }
  saveAnswerRequirements(answerId: string, requirements: any) {
    const answer = findAnswerInTree(answerId, this.entireTree())
    answer.requirements = requirements

    // Saving to DB
    this.db.saveTreeToDB(this.storyId(), this.entireTree())
  }
  updateRequirementAmount(
    answerId: string,
    requirementId: string,
    amount: number
  ) {
    const answer = findAnswerInTree(answerId, this.entireTree())

    if (answer.requirements) {
      const requirement = answer.requirements.find(
        (req: any) => req.id === requirementId
      )
      requirement.amount = amount
    }

    // Saving to DB
    this.db.saveTreeToDB(this.storyId(), this.entireTree())
  }
  deleteRequirementFromAnswer(answerId: string, requirementId: string) {
    const answer = findAnswerInTree(answerId, this.entireTree())

    if (answer.requirements) {
      answer.requirements = answer.requirements.filter((req: any) => {
        return req.id !== requirementId
      })
    }

    // Saving to DB
    this.db.saveTreeToDB(this.storyId(), this.entireTree())
  }

  updateJoinOfOption(
    originId: string,
    destinyNodeId: string,
    toAnswer = false
  ) {
    const optionNodeType = originId.split('_')[0]
    const optionNodeId = originId.split('_')[1]
    const isFallbackCondition = originId.split('_')[2] === 'fallback'
    const node = findNodeInTree(`node_${optionNodeId}`, this.entireTree())

    // TODO -> tot aixo es horrible en molts sentits
    if (isFallbackCondition) {
      if (!node.fallbackCondition) {
        node.fallbackCondition = {
          id: 'condition_' + optionNodeId + '_fallback',
        }
      }
      const duplicatedJoin = node.fallbackCondition.join?.find((join: any) => {
        return join.node === destinyNodeId
      })

      if (duplicatedJoin) {
        console.log('Duplicated join. Skip creation')
        return
      }

      if (!node.fallbackCondition.join) {
        node.fallbackCondition.join = []
      }
      node.fallbackCondition.join.push({ node: destinyNodeId, toAnswer })
    } else if (optionNodeType === 'node') {
      const willJoinNode = findNodeInTree(originId, this.entireTree())

      const duplicatedJoin = willJoinNode.join?.find((join: any) => {
        return join.node === destinyNodeId && join.toAnswer === toAnswer
      })

      if (duplicatedJoin) {
        console.log('Duplicated join. Skip creation')
        return
      }

      if (willJoinNode.join) {
        willJoinNode.join.push({ node: destinyNodeId, toAnswer })
      } else {
        willJoinNode.join = [{ node: destinyNodeId, toAnswer }]
      }
    } else {
      const option = node[optionNodeType + 's']?.filter(
        (option: any) => option.id === originId
      )

      const duplicatedJoin = option[0].join?.find((join: any) => {
        return join.node === destinyNodeId && join.toAnswer === toAnswer
      })

      if (duplicatedJoin) {
        console.log('Duplicated join. Skip creation')
        return
      }

      if (option[0].join) {
        option[0].join.push({ node: destinyNodeId, toAnswer })
      } else {
        option[0].join = [{ node: destinyNodeId, toAnswer }]
      }
    }

    this.activateTreeChangeEffects()

    // Saving to DB
    this.db.saveTreeToDB(this.storyId(), this.entireTree())
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

    // Saving to DB
    const saved = this.db.saveTreeToDB(this.storyId(), this.entireTree())
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

    // Saving to DB
    this.db.saveTreeToDB(this.storyId(), this.entireTree())
  }
  getCategories() {
    return this.entireTree().categories || []
  }

  // Utility to launch all the signal effect listeners
  public activateTreeChangeEffects() {
    if (this.entireTree) this.entireTree.set({ ...this.entireTree() })
  }
}
