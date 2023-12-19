import { Injectable } from '@angular/core'
import { node } from '../marco_interfaces/node'

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor() {}

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

  getAnswersOfNode(nodeId: string) {
    const savedTree = this.getStoredTree()

    const node = savedTree.nodes.find((node: any) => node.id === nodeId)
    return node.answers
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
  }
  private createNewTree() {
    const newTree = {
      name: '',
      nodes: [{ id: 'node_0', text: 'Start' }],
    }
    return JSON.stringify(newTree)
  }
}
