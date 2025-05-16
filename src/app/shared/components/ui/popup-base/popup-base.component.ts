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
  styles: [':host { display: contents; }'],
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

    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closePopup()
    }
  }

  protected closePopup(): void {
    this.onClose.emit()
  }
}
