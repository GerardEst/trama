import { Injectable } from '@angular/core'
import { Subject } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class TreeErrorFinderService {
  private errorsSubject = new Subject()
  public errors$ = this.errorsSubject.asObservable()

  /**The Subject in RxJS is both an Observable and an Observer. This means you can both subscribe to it (like an Observable) and push values to it (like an Observer).
  However, it's considered a good practice to keep the Subject private to prevent other parts of your code from pushing values to it. This is why you often see a private Subject and a public Observable in Angular services:
  In this code, errorsSubject is a private Subject, so other parts of your code can't push values to it. errors$ is a public Observable that other parts of your code can subscribe to.
  By doing this, you ensure that only the TreeErrorFinderService can control when new values are emitted. This makes your code more predictable and easier to debug, because you know that new values can only be emitted from inside the TreeErrorFinderService. */

  private errorList: any = []

  checkErrors(tree: any) {
    console.log('checking errors on the tree')
    for (let node of tree.nodes) {
      if (this.hasEmptyText(node))
        this.errorList.push({ type: 'node-empty_text', node: node.id })
      if (!node.answers) {
        this.errorList.push({ type: 'node-no_answers', node: node.id })
        return
      }
      for (let answer of node.answers) {
        if (!answer.join || answer.join.length === 0) {
          const answerHaveWinOrEnd = answer.events?.find((event: any) => {
            return event.action === 'win' || event.action === 'end'
          })
          if (!answerHaveWinOrEnd || !answer.events) {
            this.errorList.push({
              type: 'answer-no_join_nor_end',
              answer: answer.id,
            })
          }
        }
        if (this.hasEmptyText(answer))
          this.errorList.push({ type: 'answer-empty_text', answer: answer.id })
      }
    }

    this.errorsSubject.next(this.errorList)
  }

  hasEmptyText(element: any) {
    return !element.text || element.text.trim().length === 0
  }
}
