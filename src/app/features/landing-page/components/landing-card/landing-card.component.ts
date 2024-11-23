import { Component, Input } from '@angular/core'

@Component({
  selector: 'polo-landing-card',
  standalone: true,
  imports: [],
  templateUrl: './landing-card.component.html',
  styleUrl: './landing-card.component.sass',
})
export class LandingCardComponent {
  @Input() image?: string
  @Input() title?: string
}
