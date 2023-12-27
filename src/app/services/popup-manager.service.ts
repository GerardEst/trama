import { Injectable, ComponentRef } from '@angular/core'

@Injectable({
  providedIn: 'root',
})
export class PopupManagerService {
  private currentPopupRef: ComponentRef<any> | null = null

  public setCurrentComponent(ref: ComponentRef<any>): void {
    // Destroy the current component if it exists
    if (this.currentPopupRef) {
      this.currentPopupRef.destroy()
    }

    // Set the new component reference
    this.currentPopupRef = ref
  }
}
