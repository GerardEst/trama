import { Component, Input } from '@angular/core'

@Component({
  selector: 'polo-accent-button',
  standalone: true,
  imports: [],
  templateUrl: './accent-button.component.html',
  styleUrl: './accent-button.component.sass',
})
export class AccentButtonComponent {
  @Input() gray: boolean = false
  @Input() fill: boolean = false
}
