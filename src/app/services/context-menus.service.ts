import {
  Injectable,
  ApplicationRef,
  createComponent,
  EmbeddedViewRef,
} from '@angular/core'
import { fromEvent } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class ContextMenusService {
  private contextMenuComponentRef: any
  private clickSubscription: any
  buttonUsed: any

  constructor(private appRef: ApplicationRef) {}

  launch(component: any, buttonUsed: any) {
    this.buttonUsed = buttonUsed

    // subscribe to click events when the context menu is opened
    this.clickSubscription = fromEvent(document, 'click').subscribe(
      (event: any) => {
        this.checkClose(event.target)
      }
    )

    if (this.contextMenuComponentRef) {
      this.contextMenuComponentRef.destroy()
    }

    // create the modal component
    this.contextMenuComponentRef = createComponent(component, {
      environmentInjector: this.appRef.injector,
    })

    // attachView to ApplicationRef to make it part of change detection cycle
    this.appRef.attachView(this.contextMenuComponentRef.hostView)

    const rect = this.buttonUsed.getBoundingClientRect()

    // position the context menu component beside the buttonUsed
    const rootNode = (<EmbeddedViewRef<any>>(
      this.contextMenuComponentRef.hostView
    )).rootNodes[0]
    rootNode.style.position = 'absolute'

    // delay the calculation of the position until after the component has been rendered
    setTimeout(() => {
      // calculate the position
      let top = rect.top + 5
      let left = rect.right + 5

      // adjust the position if the context menu goes off the screen
      if (top + rootNode.offsetHeight > window.innerHeight) {
        top = window.innerHeight - rootNode.offsetHeight - 5
      }
      if (left + rootNode.offsetWidth > window.innerWidth) {
        left = rect.left - rootNode.offsetWidth - 5 // move it to the left side of the button
      }

      rootNode.style.top = `${top}px`
      rootNode.style.left = `${left}px`
    })

    document.body.append(rootNode)

    return this.contextMenuComponentRef
  }

  checkClose(clickedElement: any) {
    if (
      clickedElement !== this.buttonUsed &&
      !this.contextMenuComponentRef.hostView.rootNodes[0].contains(
        clickedElement
      )
    ) {
      this.close()
    }
  }

  close() {
    if (this.contextMenuComponentRef) {
      this.appRef.detachView(this.contextMenuComponentRef.hostView)
      this.contextMenuComponentRef.destroy()
      this.contextMenuComponentRef = null
    }
    // unsubscribe from click events when the context menu is closed
    if (this.clickSubscription) {
      this.clickSubscription.unsubscribe()
      this.clickSubscription = null
    }
  }
}
