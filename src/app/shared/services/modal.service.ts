import {
  Injectable,
  ApplicationRef,
  createComponent,
  EmbeddedViewRef,
} from '@angular/core'
import { NavigationEnd, Router } from '@angular/router'

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private modalComponentRef: any
  private pageContent: HTMLElement | null
  constructor(private appRef: ApplicationRef, private router: Router) {
    this.pageContent = document.querySelector('.content')
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) this.close()
    })
  }

  launch(component: any) {
    if (this.modalComponentRef) {
      this.modalComponentRef.destroy()
    }

    // create the modal component
    this.modalComponentRef = createComponent(component, {
      environmentInjector: this.appRef.injector,
    })

    // attachView to ApplicationRef to make it part of change detection cycle
    this.appRef.attachView(this.modalComponentRef.hostView)
    // append the component to body or content depending of ui preference

    document.body.append(
      (<EmbeddedViewRef<any>>this.modalComponentRef.hostView).rootNodes[0]
    )

    // block the scroll to prevent issues
    if (this.pageContent) this.pageContent.style.overflow = 'hidden'

    return this.modalComponentRef
  }

  close() {
    if (this.modalComponentRef) {
      this.appRef.detachView(this.modalComponentRef.hostView)
      this.modalComponentRef.destroy()
      this.modalComponentRef = null

      // unblock scroll
      if (this.pageContent) this.pageContent.style.overflow = 'auto'
    }
  }
}
