import { Component, HostBinding, Input } from '@angular/core'
import { RouterLink } from '@angular/router'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'

@Component({
  selector: 'polo-landing-feature-card',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './landing-feature-card.component.html',
  styleUrl: './landing-feature-card.component.sass',
})
export class LandingFeatureCardComponent {
  @Input({ required: true }) title!: string
  @Input({ required: true }) description!: string
  @Input() label?: string
  @Input() linkLabel?: string
  @Input() docsFragment?: string
  @Input() wide = false

  @HostBinding('class.landing-feature-card--wide') get isWide() {
    return this.wide
  }
}
