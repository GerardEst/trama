import { Component, Input } from '@angular/core'

@Component({
  selector: 'polo-landing-mobile',
  standalone: true,
  imports: [],
  templateUrl: './landing-mobile.component.html',
  styleUrl: './landing-mobile.component.sass',
})
export class LandingMobileComponent {
  @Input() topSpacing?: boolean
  @Input() camera?: boolean
}
