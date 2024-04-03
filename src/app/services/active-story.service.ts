import { Injectable, WritableSignal, effect, signal } from '@angular/core'
import {
  getNodeIdFromAnswerId,
  findNodeInTree,
  findAnswerInTree,
  generateIDForNewRequirement,
} from '../utils/tree-searching'
import { tree, link, node_answer, node_conditions, node } from '../interfaces'

@Injectable({
  providedIn: 'root',
})
export class ActiveStoryService {
  storyId: WritableSignal<string> = signal('')
  entireTree: WritableSignal<any> = signal({})

  storyName: WritableSignal<string> = signal('')
  storyRefs: any = signal([])
  storyConfiguration: any = signal({})

  constructor() {
    effect(() => {
      const pageTitle = document.querySelector('title')
      if (pageTitle) pageTitle.innerHTML = this.storyName()
    })
  }

  // REFS
  // The refs are built from the tree, so we need to build them first.
  // We add and remove refs on the active story. We don't need this on the tree.
  initTreeRefs(tree: any) {
    const builtRefs: any = []
    for (let node of tree.nodes) {
      if (node.answers) {
        for (let answer of node.answers) {
          if (answer.requirements) {
            for (let requirement of answer.requirements) {
              if (requirement.id) {
                builtRefs.push({
                  id: requirement.id,
                  name: tree.refs[requirement.id].name,
                  type: tree.refs[requirement.id].type,
                  category: tree.refs[requirement.id].category,
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
                  name: tree.refs[event.target].name,
                  type: tree.refs[event.target].type,
                  category: tree.refs[event.target].category,
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
      console.warn('Duplicated ref. Skip creation')
      return
    }

    const newId =
      type + '_' + generateIDForNewRequirement(this.entireTree().refs)
    this.entireTree().refs[newId] = { name, type }

    return { id: newId, name: name, type }
  }
  updateRefName(refId: string, newName: string) {
    this.entireTree().refs[refId].name = newName
  }
  deleteRef(refId: string) {
    delete this.entireTree().refs[refId]
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
    this.entireTree().nodes?.push(newNode)
  }
  removeNode(nodeId: string) {
    // Remove node from tree
    this.entireTree().nodes = this.entireTree().nodes?.filter(
      (node: any) => node.id !== nodeId
    )

    // Remove node from joins that have it
    for (let node of this.entireTree().nodes) {
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
  }
  updateNodeText(nodeId: string, newText: string) {
    const node = findNodeInTree(nodeId, this.entireTree())
    if (node) node.text = newText
  }
  updateNodeLinks(nodeId: string, links: link[]) {
    const node = findNodeInTree(nodeId, this.entireTree())
    if (node) node.links = links
  }
  updateNodePosition(nodeId: string, left: number, top: number) {
    let node = findNodeInTree(nodeId, this.entireTree())
    node.left = left
    node.top = top

    this.activateTreeChangeEffects()
  }
  updateNodeShareOptions(nodeId: string, sharingOptions: any) {
    const node = findNodeInTree(nodeId, this.entireTree())
    node.share = sharingOptions
  }
  addImageToNode(nodeId: string, imagePath: string) {
    const node = findNodeInTree(nodeId, this.entireTree())
    node.image = {
      path: imagePath,
    }
  }
  removeImageFromNode(nodeId: string) {
    const node = findNodeInTree(nodeId, this.entireTree())
    node.image = undefined
  }
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
  }
  removeCondition(nodeId: string, conditionId: string) {
    const node = findNodeInTree(nodeId, this.entireTree())
    const newConditions = node.conditions?.filter(
      (condition: any) => condition.id !== conditionId
    )

    node.conditions = newConditions
  }

  // Answers
  updateAnswerText(answerId: string, newText: string) {
    const answer = findAnswerInTree(answerId, this.entireTree())
    if (answer) answer[0].text = newText
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
  }
  removeAnswer(nodeId: string, answerId: string) {
    const node = findNodeInTree(nodeId, this.entireTree())
    const newAnswers = node.answers?.filter(
      (answer: any) => answer.id !== answerId
    )

    node.answers = newAnswers
  }
  saveAnswerEvents(answerId: string, events: any) {
    const answer = findAnswerInTree(answerId, this.entireTree())
    answer[0].events = events
  }
  deleteEventFromAnswer(answerId: string, eventTarget: string) {
    const answer = findAnswerInTree(answerId, this.entireTree())
    if (answer[0].events) {
      answer[0].events = answer[0].events.filter((event: any) => {
        return event.target !== eventTarget
      })
    }
  }
  saveAnswerRequirements(answerId: string, requirements: any) {
    const answer = findAnswerInTree(answerId, this.entireTree())
    answer[0].requirements = requirements
  }
  updateRequirementAmount(
    answerId: string,
    requirementId: string,
    amount: number
  ) {
    const answer = findAnswerInTree(answerId, this.entireTree())

    if (answer[0].requirements) {
      const requirement = answer[0].requirements.find(
        (req: any) => req.id === requirementId
      )
      requirement.amount = amount
    }
  }
  deleteRequirementFromAnswer(answerId: string, requirementId: string) {
    const answer = findAnswerInTree(answerId, this.entireTree())

    if (answer[0].requirements) {
      answer[0].requirements = answer[0].requirements.filter((req: any) => {
        return req.id !== requirementId
      })
    }
  }
  // TODO -> No entenc el join, i té un mal nom
  updateOptionJoin(optionId: string, nodeId: string) {
    const optionNodeType = optionId.split('_')[0]
    const optionNodeId = optionId.split('_')[1]
    const isFallbackCondition = optionId.split('_')[2] === 'fallback'
    const node = findNodeInTree(`node_${optionNodeId}`, this.entireTree())

    // TODO -> tot aixo es horrible en molts sentits
    if (isFallbackCondition) {
      if (!node.fallbackCondition) {
        node.fallbackCondition = {
          id: 'condition_' + optionNodeId + '_fallback',
        }
      }
      const duplicatedJoin = node.fallbackCondition.join?.find((join: any) => {
        return join.node === nodeId
      })

      if (duplicatedJoin) {
        console.warn('Duplicated join. Skip creation')
        return
      }

      if (!node.fallbackCondition.join) {
        node.fallbackCondition.join = []
      }
      node.fallbackCondition.join.push({ node: nodeId })
    } else {
      const option = node[optionNodeType + 's']?.filter(
        (option: any) => option.id === optionId
      )

      const duplicatedJoin = option[0].join?.find((join: any) => {
        return join.node === nodeId
      })

      if (duplicatedJoin) {
        console.warn('Duplicated join. Skip creation')
        return
      }

      if (option[0].join) {
        option[0].join.push({ node: nodeId })
      } else {
        option[0].join = [{ node: nodeId }]
      }
    }

    this.activateTreeChangeEffects()
  }
  removeJoinFromAnswer(answerId: string, nodeId: string) {
    const answer = findAnswerInTree(answerId, this.entireTree())

    if (answer[0].join) {
      answer[0].join = answer[0].join.filter((join: any) => {
        return join.node !== nodeId
      })
    }

    this.activateTreeChangeEffects()

    return answer[0].join
  }
  getEventsOfAnswer(answerId: string) {
    const answer = findAnswerInTree(answerId, this.entireTree())

    if (!answer[0].events) return []
    return answer[0].events
  }
  getRequirementsOfAnswer(answerId: string) {
    const answer = findAnswerInTree(answerId, this.entireTree())
    return answer[0].requirements
  }
  getJoinsOfAnswer(answerId: string) {
    const answer = findAnswerInTree(answerId, this.entireTree())
    return answer[0].join
  }
  getDetailedRequirementsOfAnswer(answerId: string) {
    const answer = findAnswerInTree(answerId, this.entireTree())

    if (!answer[0].requirements) return []
    const detailedRequirements = answer[0].requirements.map(
      (requirement: any) => {
        return {
          ...requirement,
          ...this.entireTree().refs[requirement.id],
        }
      }
    )

    return detailedRequirements
  }

  // Categories
  createCategory(newCategory: string) {
    if (!this.entireTree().categories) this.entireTree().categories = []
    this.entireTree().categories.push({ id: newCategory, name: newCategory })
  }
  setCategoryToRef(refId: string, categoryId: string) {
    this.entireTree().refs[refId].category = categoryId
  }
  getCategories() {
    return this.entireTree().categories || []
  }

  public activateTreeChangeEffects() {
    if (this.entireTree) this.entireTree.set({ ...this.entireTree() })
  }
}
