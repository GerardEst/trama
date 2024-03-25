import { Component, Input } from '@angular/core'

@Component({
  selector: 'polo-link-button',
  standalone: true,
  imports: [],
  templateUrl: './link-button.component.html',
  styleUrl: './link-button.component.sass',
})
export class LinkButtonComponent {
  @Input() fill: boolean = false
  @Input() href: string = ''
}
