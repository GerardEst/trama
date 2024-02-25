import { Injectable, WritableSignal, effect, signal } from '@angular/core'
import { getNodeIdFromAnswerId } from '../utils/tree-searching'
import { tree } from '../modules/marco/interfaces'

@Injectable({
  providedIn: 'root',
})
export class ActiveStoryService {
  /** todo -> Aqui s'ha de posar i gestionar des d'aqui les opcions
   * de la historia activa, com el track i la vista
   */

  storyId: WritableSignal<string> = signal('')
  entireTree: tree = {}
  storyName: WritableSignal<string> = signal('')
  storyRefs: any = signal([])
  storyConfiguration: any = signal({})

  constructor() {
    effect(() => {
      const pageTitle = document.querySelector('title')
      if (pageTitle) pageTitle.innerHTML = this.storyName()
    })
  }

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

  addRef(refId: any, previousRef?: any) {
    if (!this.entireTree.refs) return console.error('Error while adding ref')

    console.log('previousref ', previousRef)
    console.log('new ref ', refId)
    if (previousRef) this.removeRef(previousRef)

    const withNewRef = [
      ...this.storyRefs(),
      {
        id: refId.id,
        answer: refId.answer,
        name: this.entireTree.refs[refId.id].name,
        type: this.entireTree.refs[refId.id].type,
        category: this.entireTree.refs[refId.id].category,
        on: undefined,
        node: getNodeIdFromAnswerId(refId.answer),
      },
    ]

    this.storyRefs.set(withNewRef)
    console.log(this.storyRefs())
  }

  removeRef(refToRemove: any) {
    const withoutRef = this.storyRefs().filter(
      (ref: any) =>
        !(ref.id === refToRemove.id && ref.answer === refToRemove.answer)
    )

    this.storyRefs.set(withoutRef)
    console.log(this.storyRefs())
  }
}
