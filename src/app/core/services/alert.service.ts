import { Injectable } from '@angular/core'
import { OverlayService } from './overlay.service'

@Injectable({
  providedIn: 'root',
})
export class AlertService extends OverlayService {
  /** Same mounting logic as ModalService (see OverlayService), kept as a
   * separate singleton so showing an alert doesn't close an open modal and
   * viceversa. The difference is that launching an alert returns a Promise
   * that the alert component resolves itself. */

  launch(component: any) {
    this.mount(component)

    return new Promise((resolve) => {
      // We pass the promise resolve function to the component, so
      // we can resolve it from there
      this.componentRef.instance.resolve = resolve
    })
  }
}
