import { Component, HostBinding, Input } from '@angular/core'
import { RouterLink } from '@angular/router'

@Component({
  selector: 'polo-landing-feature-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './landing-feature-card.component.html',
  styleUrl: './landing-feature-card.component.sass',
})
export class LandingFeatureCardComponent {
  @Input({ required: true }) title!: string
  @Input({ required: true }) description!: string
  @Input() label?: string
  @Input() linkLabel = 'Read the guide'
  @Input() docsFragment?: string
  @Input() wide = false

  @HostBinding('class.landing-feature-card--wide') get isWide() {
    return this.wide
  }
}
