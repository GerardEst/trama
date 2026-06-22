import { Injectable } from '@angular/core'
import { OverlayService } from './overlay.service'

@Injectable({
  providedIn: 'root',
})
export class ModalService extends OverlayService {
  launch(component: any) {
    return this.mount(component)
  }
}
