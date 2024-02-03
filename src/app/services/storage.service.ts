import { Injectable } from '@angular/core'
import { node } from '../interfaces'
import { findAnswerInTree } from '../utils/tree-searching'
import { TreeErrorFinderService } from './tree-error-finder.service'
import { ActiveStoryService } from './active-story.service'

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor(
    private errorFinder: TreeErrorFinderService,
    private activeStory: ActiveStoryService
  ) {}

  updateNodeText(nodeId: string, newText: string) {
    const savedTree = this.getStoredTree()

    const node = savedTree.nodes.filter((node: any) => node.id === nodeId)
    node[0].text = newText

    this.updateStoredTree(savedTree)
  }

  updateAnswerText(answerId: string, newText: string) {
    const savedTree = this.getStoredTree()

    const answerNodeId = answerId.split('_')[1]

    const node = savedTree.nodes.find(
      (node: any) => node.id === `node_${answerNodeId}`
    )
    const answer = node.answers?.filter((answer: any) => answer.id === answerId)
    answer[0].text = newText

    this.updateStoredTree(savedTree)
  }

  createNodeAnswer(nodeId: string, answerId: string) {
    const savedTree = this.getStoredTree()

    const node = savedTree.nodes.filter((node: any) => node.id === nodeId)

    if (node[0].answers) {
      node[0].answers.push({
        id: answerId,
      })
    } else {
      node[0].answers = [{ id: answerId }]
    }

    this.updateStoredTree(savedTree)
  }

  removeAnswer(nodeId: string, answerId: string) {
    const savedTree = this.getStoredTree()

    const node = savedTree.nodes.find((node: any) => node.id === nodeId)
    const newAnswers = node.answers?.filter(
      (answer: any) => answer.id !== answerId
    )

    node.answers = newAnswers

    this.updateStoredTree(savedTree)
  }

  updateAnswerJoin(answerId: string, nodeId: string) {
    const savedTree = this.getStoredTree()

    const answerNodeId = answerId.split('_')[1]
    const node = savedTree.nodes.find(
      (node: any) => node.id === `node_${answerNodeId}`
    )
    const answer = node.answers?.filter((answer: any) => answer.id === answerId)

    const duplicatedJoin = answer[0].join?.find((join: any) => {
      return join.node === nodeId
    })

    if (duplicatedJoin) {
      console.warn('Duplicated join. Skip creation')
      return
    }

    if (answer[0].join) {
      answer[0].join.push({ node: nodeId })
    } else {
      answer[0].join = [{ node: nodeId }]
    }

    this.updateStoredTree(savedTree)
  }

  updateNodePosition(nodeId: string, left: number, top: number) {
    const savedTree = this.getStoredTree()

    let node = savedTree.nodes.filter((node: any) => node.id === nodeId)
    node[0].left = left
    node[0].top = top

    this.updateStoredTree(savedTree)
  }

  createNode({ id, top, left }: any) {
    const savedTree = this.getStoredTree()

    const newNode: node = {
      id,
      top,
      left,
    }
    savedTree.nodes.push(newNode)

    this.updateStoredTree(savedTree)
  }

  removeNode(nodeId: string, answers: Array<string>) {
    const savedTree = this.getStoredTree()

    // Remove node from tree
    savedTree.nodes = savedTree.nodes.filter((node: any) => node.id !== nodeId)

    // Remove node from joins that have it
    for (let node of savedTree.nodes) {
      if (node.answers) {
        for (let answer of node.answers) {
          if (answer.join) {
            answer.join = answer.join.filter(
              (join: any) => join.node !== nodeId
            )
          }
        }
      }
    }

    this.updateStoredTree(savedTree)
  }

  addEventToAnswer(answerId: string, newRequirement: any) {
    const savedTree = this.getStoredTree()
    const answer = findAnswerInTree(answerId, savedTree)

    if (answer[0].events) {
      answer[0].events.push(newRequirement)
    } else {
      answer[0].events = [newRequirement]
    }

    this.updateStoredTree(savedTree)
  }

  getEventsOfAnswer(answerId: string) {
    const savedTree = this.getStoredTree()
    const answer = findAnswerInTree(answerId, savedTree)

    if (!answer[0].events) return []
    return answer[0].events
  }

  deleteEventFromAnswer(answerId: string, eventTarget: string) {
    const savedTree = this.getStoredTree()
    const answer = findAnswerInTree(answerId, savedTree)

    if (answer[0].events) {
      answer[0].events = answer[0].events.filter((event: any) => {
        return event.target !== eventTarget
      })
    }

    this.updateStoredTree(savedTree)
  }

  saveAnswerRequirements(answerId: string, requirements: any) {
    const savedTree = this.getStoredTree()
    const answer = findAnswerInTree(answerId, savedTree)

    answer[0].requirements = requirements

    this.updateStoredTree(savedTree)
  }

  saveAnswerEvents(answerId: string, events: any) {
    const savedTree = this.getStoredTree()
    const answer = findAnswerInTree(answerId, savedTree)

    answer[0].events = events

    this.updateStoredTree(savedTree)
  }

  deleteRequirementFromAnswer(answerId: string, requirementId: string) {
    const savedTree = this.getStoredTree()
    const answer = findAnswerInTree(answerId, savedTree)

    if (answer[0].requirements) {
      answer[0].requirements = answer[0].requirements.filter((req: any) => {
        return req.id !== requirementId
      })
    }

    this.updateStoredTree(savedTree)
  }

  saveRequirementDetails(requirementId: string, details: any) {
    const savedTree = this.getStoredTree()

    if (!savedTree.refs) {
      savedTree.refs = {}
    }
    savedTree.refs[requirementId] = { name: details.name }

    this.updateStoredTree(savedTree)
  }

  createNewRef(name: string, type: 'stat' | 'condition' | 'win' | 'end') {
    const savedTree = this.getStoredTree()

    if (!savedTree.refs) {
      savedTree.refs = {}
    }

    // Check if the name already exists in the refs
    const duplicatedRef = Object.keys(savedTree.refs).find(
      (ref: any) =>
        savedTree.refs[ref].name === name && savedTree.refs[ref].type === type
    )

    if (duplicatedRef) {
      console.warn('Duplicated ref. Skip creation')
      return
    }

    const newId = type + '_' + this.getNewIdForRequirement()
    savedTree.refs[newId] = { name, type }

    this.updateStoredTree(savedTree)

    return { id: newId, name: name, type }
  }

  updateRequirementAmount(
    answerId: string,
    requirementId: string,
    amount: number
  ) {
    const savedTree = this.getStoredTree()
    const answer = findAnswerInTree(answerId, savedTree)

    if (answer[0].requirements) {
      const requirement = answer[0].requirements.find(
        (req: any) => req.id === requirementId
      )
      requirement.amount = amount
    }

    this.updateStoredTree(savedTree)
  }

  private getNewIdForRequirement() {
    const savedTree = this.getStoredTree()

    if (savedTree.refs) {
      const ids = Object.keys(savedTree.refs).map((key) =>
        parseInt(key.split('_')[1])
      )

      const maxId = Math.max(...ids)

      return maxId + 1
    }
    return 1
  }

  getAnswersOfNode(nodeId: string) {
    const savedTree = this.getStoredTree()

    const node = savedTree.nodes.find((node: any) => node.id === nodeId)
    return node.answers
  }

  getRequirementsOfAnswer(answerId: string) {
    const savedTree = this.getStoredTree()
    const answer = findAnswerInTree(answerId, savedTree)

    return answer[0].requirements
  }

  getJoinsOfAnswer(answerId: string) {
    const savedTree = this.getStoredTree()
    const answer = findAnswerInTree(answerId, savedTree)

    return answer[0].join
  }

  removeJoinFromAnswer(answerId: string, nodeId: string) {
    const savedTree = this.getStoredTree()
    const answer = findAnswerInTree(answerId, savedTree)

    if (answer[0].join) {
      answer[0].join = answer[0].join.filter((join: any) => {
        return join.node !== nodeId
      })
    }

    this.updateStoredTree(savedTree)

    return answer[0].join
  }

  getDetailedRequirementsOfAnswer(answerId: string) {
    const savedTree = this.getStoredTree()
    const answer = findAnswerInTree(answerId, savedTree)

    if (!answer[0].requirements) return []
    const detailedRequirements = answer[0].requirements.map(
      (requirement: any) => {
        return {
          ...requirement,
          ...savedTree.refs[requirement.id],
        }
      }
    )

    return detailedRequirements
  }

  getRefsFormatted(type: 'stat' | 'condition' | 'win' | 'end') {
    const savedTree = this.getStoredTree()
    const refs = savedTree.refs

    if (!refs) return []
    return Object.keys(refs)
      .filter((ref: any) => refs[ref].type === type)
      .map((option: any) => {
        return { id: option, name: refs[option].name, type: refs[option].type }
      })
  }

  getRefName(refId: string) {
    const savedTree = this.getStoredTree()
    const refs = savedTree.refs

    return refs[refId].name
  }

  private getStoredTree() {
    //@ts-ignore
    const storedTree = JSON.parse(localStorage.getItem('polo-tree'))

    if (!storedTree) {
      return JSON.parse(this.createNewTree())
    }

    return storedTree
  }

  private updateStoredTree(newTree: Array<any>) {
    localStorage.setItem('polo-tree', JSON.stringify(newTree))
    // Slowly moving to activeStory tree?? From now, use both. I will decide
    this.activeStory.entireTree = newTree
    this.errorFinder.checkErrors(newTree)
  }
  private createNewTree() {
    const newTree = {
      nodes: [{ id: 'node_0', text: 'Start' }],
    }
    return JSON.stringify(newTree)
  }
}
