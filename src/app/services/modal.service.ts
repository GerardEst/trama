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
  constructor(
    private appRef: ApplicationRef,
    private router: Router
  ) {
    this.pageContent = document.querySelector('.content')
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) this.close()
    })
  }

  launch(
    component: any,
    options: {
      mode?: 'centered' | 'side'
      fullWindow?: boolean
    } = {
      mode: 'centered',
      fullWindow: true,
    }
  ) {
    if (this.modalComponentRef) {
      this.modalComponentRef.destroy()
    }

    // create the modal component
    this.modalComponentRef = createComponent(component, {
      environmentInjector: this.appRef.injector,
    })

    // set mode if modal needs it
    if ('mode' in this.modalComponentRef.instance) {
      this.modalComponentRef.setInput('mode', options.mode)
    }
    // attachView to ApplicationRef to make it part of change detection cycle
    this.appRef.attachView(this.modalComponentRef.hostView)
    // append the component to body or content depending of ui preference

    if (options.fullWindow) {
      document.body.append(
        (<EmbeddedViewRef<any>>this.modalComponentRef.hostView).rootNodes[0]
      )
    } else {
      this.pageContent?.append(
        (<EmbeddedViewRef<any>>this.modalComponentRef.hostView).rootNodes[0]
      )
    }
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

  // Sometimes we need to hide a modal for a moment while user is doing something, and then
  // come back where we were. Hide and show allows this without needing to close and then
  // open in the same state
  hide() {
    if ('hide' in this.modalComponentRef.instance) {
      this.modalComponentRef.setInput('hide', true)
    }
  }
  show() {
    if ('hide' in this.modalComponentRef.instance) {
      this.modalComponentRef.setInput('hide', false)
    }
  }
}
