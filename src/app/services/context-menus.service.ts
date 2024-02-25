import {
  Injectable,
  ApplicationRef,
  createComponent,
  EmbeddedViewRef,
} from '@angular/core'

@Injectable({
  providedIn: 'root',
})
export class ContextMenusService {
  private contextMenuComponentRef: any
  constructor(private appRef: ApplicationRef) {}

  launch(component: any) {
    if (this.contextMenuComponentRef) {
      this.contextMenuComponentRef.destroy()
    }

    // create the modal component
    this.contextMenuComponentRef = createComponent(component, {
      environmentInjector: this.appRef.injector,
    })

    // attachView to ApplicationRef to make it part of change detection cycle
    this.appRef.attachView(this.contextMenuComponentRef.hostView)

    document.body.append(
      (<EmbeddedViewRef<any>>this.contextMenuComponentRef.hostView).rootNodes[0]
    )

    return this.contextMenuComponentRef
  }

  close() {
    if (this.contextMenuComponentRef) {
      this.appRef.detachView(this.contextMenuComponentRef.hostView)
      this.contextMenuComponentRef.destroy()
      this.contextMenuComponentRef = null
    }
  }
}
