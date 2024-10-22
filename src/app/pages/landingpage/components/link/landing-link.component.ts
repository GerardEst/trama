import { Component, Input } from '@angular/core'
import { Router } from '@angular/router'

@Component({
  selector: 'polo-landing-link',
  standalone: true,
  imports: [],
  templateUrl: './landing-link.component.html',
  styleUrl: './landing-link.component.sass',
})
export class LandingLinkComponent {
  @Input() behaviour: 'link' | 'button' = 'button'
  @Input() destiny?: string
  @Input() text?: string
  @Input() inactive: boolean = false
  @Input() highlight: boolean = false

  constructor(public router: Router) {}
}
