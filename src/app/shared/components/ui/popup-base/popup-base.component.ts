import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
} from '@angular/core'

@Component({
  selector: 'polo-popup-base',
  standalone: true,
  template: '<ng-content></ng-content>',
})
export class PopupBaseComponent {
  private isInitialized = false

  @Output() onClose = new EventEmitter<void>()

  constructor(private elementRef: ElementRef) {}

  // Close when clicking outside
  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    if (!this.isInitialized) {
      this.isInitialized = true
      return
    }

    // The clicked control may be replaced before this document listener runs
    // (e.g. Delete becomes a confirmation). The event path still contains the
    // popup even when its original target is no longer attached to the DOM.
    if (!event.composedPath().includes(this.elementRef.nativeElement)) {
      this.closePopup()
    }
  }

  protected closePopup(): void {
    this.onClose.emit()
  }
}
