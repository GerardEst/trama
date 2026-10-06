import { Component, Input } from '@angular/core'

@Component({
  selector: 'polo-contextual-button',
  standalone: true,
  templateUrl: './contextual-button.component.html',
  styleUrl: './contextual-button.component.css',
})
export class ContextualButtonComponent {
  @Input() icon?: string
  @Input() text?: string
  @Input() title?: string
  @Input() ariaLabel?: string
  @Input() ariaHasPopup?: 'dialog' | 'menu'
  @Input() ariaExpanded?: boolean
  @Input() disabled = false
}
