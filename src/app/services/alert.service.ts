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
export class AlertService {
  /** This is essentially the same as ModalService, but I kept it separated
   * because I don't want to close modals when showing alerts, and viceversa.
   * Also, there may be some differences in the future */

  private alertComponentRef: any
  private pageContent: HTMLElement | null
  constructor(private appRef: ApplicationRef, private router: Router) {
    this.pageContent = document.querySelector('.content')
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) this.close()
    })
  }

  launch(component: any) {
    if (this.alertComponentRef) {
      this.alertComponentRef.destroy()
    }

    // create the modal component
    this.alertComponentRef = createComponent(component, {
      environmentInjector: this.appRef.injector,
    })

    // attachView to ApplicationRef to make it part of change detection cycle
    this.appRef.attachView(this.alertComponentRef.hostView)
    // append the component to body or content depending of ui preference

    document.body.append(
      (<EmbeddedViewRef<any>>this.alertComponentRef.hostView).rootNodes[0]
    )

    // block the scroll to prevent issues
    if (this.pageContent) this.pageContent.style.overflow = 'hidden'

    return new Promise((resolve) => {
      // We pass the promise resolve function to the component, so
      // we can resolve it from there
      this.alertComponentRef.instance.resolve = resolve
    })
  }

  close() {
    if (this.alertComponentRef) {
      this.appRef.detachView(this.alertComponentRef.hostView)
      this.alertComponentRef.destroy()
      this.alertComponentRef = null

      // unblock scroll
      if (this.pageContent) this.pageContent.style.overflow = 'auto'
    }
  }
}
