import { Injectable, WritableSignal, effect, signal } from '@angular/core'
import {
  getNodeIdFromAnswerId,
  findAnswerInTree,
} from '../utils/tree-searching'
import { tree, link, node_answer, node_conditions, node } from '../interfaces'

@Injectable({
  providedIn: 'root',
})
export class ActiveStoryService {
  storyId: WritableSignal<string> = signal('')
  // TODO -> Assign the correct type -> tree
  entireTree: any = {}
  storyName: WritableSignal<string> = signal('')
  storyRefs: any = signal([])
  storyConfiguration: any = signal({})

  constructor() {
    effect(() => {
      const pageTitle = document.querySelector('title')
      if (pageTitle) pageTitle.innerHTML = this.storyName()
    })
  }

  // The refs are built from the tree, so we need to build them first
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
    if (!this.entireTree.refs) return console.error('Error while adding ref')

    if (previousRef) this.removeRef(on, previousRef)

    const withNewRef = [
      ...this.storyRefs(),
      {
        id: refId.id,
        answer: refId.answer,
        name: this.entireTree.refs[refId.id].name,
        type: this.entireTree.refs[refId.id].type,
        category: this.entireTree.refs[refId.id].category,
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

  updateNodeText(nodeId: string, newText: string) {
    const node = this.entireTree.nodes?.filter(
      (node: any) => node.id === nodeId
    )
    if (node) node[0].text = newText
  }

  updateNodeLinks(nodeId: string, links: link[]) {
    const node = this.entireTree.nodes?.filter(
      (node: any) => node.id === nodeId
    )
    if (node) node[0].links = links
  }

  updateAnswerText(answerId: string, newText: string) {
    const answerNodeId = answerId.split('_')[1]

    const node = this.entireTree.nodes?.find(
      (node: any) => node.id === `node_${answerNodeId}`
    )

    const answer = node?.answers?.find(
      (answer: node_answer) => answer.id === answerId
    )
    //@ts-ignore
    if (answer) answer[0].text = newText
  }

  updateConditionValues(conditionId: string, values: node_conditions) {
    const conditionNodeId = conditionId.split('_')[1]

    const node = this.entireTree.nodes?.find(
      (node: any) => node.id === `node_${conditionNodeId}`
    )
    const conditions = node?.conditions?.filter(
      (condition: any) => condition.id === conditionId
    )

    if (conditions) {
      conditions[0].ref = values.ref
      conditions[0].comparator = values.comparator
      conditions[0].value = values.value
    }
  }

  createNodeAnswer(nodeId: string, answerId: string) {
    const node = this.entireTree.nodes?.filter(
      (node: any) => node.id === nodeId
    )

    if (node && node[0].answers) {
      node[0].answers.push({
        id: answerId,
      })
    } else if (node) {
      node[0].answers = [{ id: answerId }]
    }
  }

  createNodeCondition(nodeId: string, conditionId: string) {
    const node = this.entireTree.nodes?.filter(
      (node: any) => node.id === nodeId
    )

    if (!node[0].conditions) node[0].conditions = []

    node[0].conditions.push({
      id: conditionId,
    })
  }

  removeAnswer(nodeId: string, answerId: string) {
    const node = this.entireTree.nodes?.find((node: any) => node.id === nodeId)
    const newAnswers = node.answers?.filter(
      (answer: any) => answer.id !== answerId
    )

    node.answers = newAnswers
  }

  removeCondition(nodeId: string, conditionId: string) {
    const node = this.entireTree.nodes?.find((node: any) => node.id === nodeId)
    const newConditions = node.conditions?.filter(
      (condition: any) => condition.id !== conditionId
    )

    node.conditions = newConditions
  }

  updateOptionJoin(optionId: string, nodeId: string) {
    const optionNodeType = optionId.split('_')[0]
    const optionNodeId = optionId.split('_')[1]
    const isFallbackCondition = optionId.split('_')[2] === 'fallback'
    const node = this.entireTree.nodes?.find(
      (node: any) => node.id === `node_${optionNodeId}`
    )

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
  }

  updateNodePosition(nodeId: string, left: number, top: number) {
    let node = this.entireTree.nodes?.filter((node: any) => node.id === nodeId)
    node[0].left = left
    node[0].top = top
  }

  createNode({ id, top, left, type }: any) {
    const newNode: node = {
      id,
      type,
      top,
      left,
    }
    /** Al crear un node, si es de tipo distributor ia ve amb un default
     * Aquet default tindrà un id especific, i serà l'ultim a agafarse quan marco
     * faci check de les condicions
     */
    if (type === 'distributor') {
      newNode.fallbackCondition = {
        id: `condition_${id.split('_')[1]}_fallback`,
      }
    }
    this.entireTree.nodes?.push(newNode)
  }

  removeNode(nodeId: string, answers: Array<string>) {
    // Remove node from tree
    this.entireTree.nodes = this.entireTree.nodes?.filter(
      (node: any) => node.id !== nodeId
    )

    // Remove node from joins that have it
    for (let node of this.entireTree.nodes) {
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
  }

  addEventToAnswer(answerId: string, newRequirement: any) {
    const answer = findAnswerInTree(answerId, this.entireTree)

    if (answer[0].events) {
      answer[0].events.push(newRequirement)
    } else {
      answer[0].events = [newRequirement]
    }
  }

  getEventsOfAnswer(answerId: string) {
    const answer = findAnswerInTree(answerId, this.entireTree)

    if (!answer[0].events) return []
    return answer[0].events
  }

  deleteEventFromAnswer(answerId: string, eventTarget: string) {
    const answer = findAnswerInTree(answerId, this.entireTree)

    if (answer[0].events) {
      answer[0].events = answer[0].events.filter((event: any) => {
        return event.target !== eventTarget
      })
    }
  }

  saveAnswerRequirements(answerId: string, requirements: any) {
    const answer = findAnswerInTree(answerId, this.entireTree)

    answer[0].requirements = requirements
  }

  saveAnswerEvents(answerId: string, events: any) {
    const answer = findAnswerInTree(answerId, this.entireTree)

    answer[0].events = events
  }

  deleteRequirementFromAnswer(answerId: string, requirementId: string) {
    const answer = findAnswerInTree(answerId, this.entireTree)

    if (answer[0].requirements) {
      answer[0].requirements = answer[0].requirements.filter((req: any) => {
        return req.id !== requirementId
      })
    }
  }

  saveRequirementDetails(requirementId: string, details: any) {
    if (!this.entireTree.refs) {
      this.entireTree.refs = {}
    }
    this.entireTree.refs[requirementId] = { name: details.name }
  }

  createNewRef(name: string, type: 'stat' | 'condition') {
    if (!this.entireTree.refs) {
      this.entireTree.refs = {}
    }

    // Check if the name already exists in the refs
    const duplicatedRef = Object.keys(this.entireTree.refs).find(
      (ref: any) =>
        this.entireTree.refs[ref].name === name &&
        this.entireTree.refs[ref].type === type
    )

    if (duplicatedRef) {
      console.warn('Duplicated ref. Skip creation')
      return
    }

    const newId = type + '_' + this.getNewIdForRequirement()
    this.entireTree.refs[newId] = { name, type }

    return { id: newId, name: name, type }
  }

  updateRefName(refId: string, newName: string) {
    this.entireTree.refs[refId].name = newName
  }

  deleteRef(refId: string) {
    delete this.entireTree.refs[refId]
  }

  updateRequirementAmount(
    answerId: string,
    requirementId: string,
    amount: number
  ) {
    const answer = findAnswerInTree(answerId, this.entireTree)

    if (answer[0].requirements) {
      const requirement = answer[0].requirements.find(
        (req: any) => req.id === requirementId
      )
      requirement.amount = amount
    }
  }

  updateNodeShareOptions(nodeId: string, sharingOptions: any) {
    const node = this.entireTree.nodes?.find((node: any) => node.id === nodeId)
    node.share = sharingOptions
  }

  addImageToNode(nodeId: string, imagePath: string) {
    const node = this.entireTree.nodes?.find((node: any) => node.id === nodeId)
    node.image = {
      path: imagePath,
    }
  }

  getImageFromNode(nodeId: string) {
    const node = this.entireTree.nodes?.find((node: any) => node.id === nodeId)

    return node.image
  }

  removeImageFromNode(nodeId: string) {
    const node = this.entireTree.nodes?.find((node: any) => node.id === nodeId)
    node.image = undefined
  }

  getAnswersOfNode(nodeId: string) {
    const node = this.entireTree.nodes?.find((node: any) => node.id === nodeId)
    return node.answers
  }

  getConditionsOfNode(nodeId: string) {
    const node = this.entireTree.nodes?.find((node: any) => node.id === nodeId)
    return node.conditions
  }

  getRequirementsOfAnswer(answerId: string) {
    const answer = findAnswerInTree(answerId, this.entireTree)

    return answer[0].requirements
  }

  getJoinsOfAnswer(answerId: string) {
    const answer = findAnswerInTree(answerId, this.entireTree)

    return answer[0].join
  }

  removeJoinFromAnswer(answerId: string, nodeId: string) {
    const answer = findAnswerInTree(answerId, this.entireTree)

    if (answer[0].join) {
      answer[0].join = answer[0].join.filter((join: any) => {
        return join.node !== nodeId
      })
    }

    return answer[0].join
  }

  getDetailedRequirementsOfAnswer(answerId: string) {
    const answer = findAnswerInTree(answerId, this.entireTree)

    if (!answer[0].requirements) return []
    const detailedRequirements = answer[0].requirements.map(
      (requirement: any) => {
        return {
          ...requirement,
          ...this.entireTree.refs[requirement.id],
        }
      }
    )

    return detailedRequirements
  }

  getRefs() {
    return this.entireTree.refs
  }

  getRefsFormatted(type: 'stat' | 'condition') {
    const refs = this.entireTree.refs

    if (!refs) return []
    return Object.keys(refs)
      .filter((ref: any) => refs[ref].type === type)
      .map((option: any) => {
        return { id: option, name: refs[option].name, type: refs[option].type }
      })
  }

  getRefName(refId: string) {
    const refs = this.entireTree.refs

    return refs[refId].name
  }

  // Categories
  getCategories() {
    return this.entireTree.categories || []
  }
  createCategory(newCategory: string) {
    if (!this.entireTree.categories) this.entireTree.categories = []
    this.entireTree.categories.push({ id: newCategory, name: newCategory })
  }

  setCategoryToRef(refId: string, categoryId: string) {
    this.entireTree.refs[refId].category = categoryId
  }

  private getNewIdForRequirement() {
    if (!this.entireTree.refs || Object.keys(this.entireTree.refs).length === 0)
      return 0

    if (this.entireTree.refs) {
      const ids = Object.keys(this.entireTree.refs).map((key) =>
        parseInt(key.split('_')[1])
      )

      const maxId = Math.max(...ids)

      return maxId + 1
    }
    return 1
  }
}
