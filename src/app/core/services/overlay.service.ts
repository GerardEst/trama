import {
  ApplicationRef,
  EmbeddedViewRef,
  createComponent,
  inject,
} from '@angular/core'
import { NavigationEnd, NavigationStart, Router } from '@angular/router'

/**
 * Navigation state for a navigation that only rewrites the address of the page on screen, such as
 * the board naming its story. Overlays stay open through it; any other navigation closes them.
 */
export const KEEP_OVERLAYS = 'keepOverlays'

/**
 * Shared logic for dynamically mounting a component over the page (modals,
 * alerts, etc). Each subclass is its own root singleton with its own
 * componentRef, so an alert and a modal can be shown independently without
 * closing one another.
 */
export abstract class OverlayService {
  protected appRef = inject(ApplicationRef)
  protected componentRef: any
  private pageContent: HTMLElement | null

  constructor() {
    this.pageContent = document.querySelector('.content')
    const router = inject(Router)
    let keep = false
    router.events.subscribe((event) => {
      // Going back or forward restores a stored state too, but always leaves the page.
      if (event instanceof NavigationStart) {
        keep = event.navigationTrigger === 'imperative' && !!router.getCurrentNavigation()?.extras.state?.[KEEP_OVERLAYS]
      }
      if (event instanceof NavigationEnd && !keep) this.close()
    })
  }

  protected mount(component: any) {
    if (this.componentRef) {
      this.componentRef.destroy()
    }

    // create the overlay component
    this.componentRef = createComponent(component, {
      environmentInjector: this.appRef.injector,
    })

    // attachView to ApplicationRef to make it part of the change detection cycle
    this.appRef.attachView(this.componentRef.hostView)

    document.body.append(
      (<EmbeddedViewRef<any>>this.componentRef.hostView).rootNodes[0]
    )

    // block the scroll to prevent issues
    if (this.pageContent) this.pageContent.style.overflow = 'hidden'

    return this.componentRef
  }

  close() {
    if (this.componentRef) {
      this.appRef.detachView(this.componentRef.hostView)
      this.componentRef.destroy()
      this.componentRef = null

      // unblock scroll
      if (this.pageContent) this.pageContent.style.overflow = 'auto'
    }
  }
}
