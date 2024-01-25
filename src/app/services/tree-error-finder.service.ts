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

  checkErrors(tree: any) {
    console.log('check errors on the tree')
    // La cosa que retorna una serie d'errors en forma d'array d'objectes per poder saber en quin node estan i info varia
    // Quan s'ha fet la comprovació això ha d'avisar a penya. Per exemple al component de tree-error-notifier.
    // Aquet tindrà importat el servei, pero no sé com fer que es suscrigui a algo d'aquet servei
    this.errorsSubject.next(['errors'])
  }
}
