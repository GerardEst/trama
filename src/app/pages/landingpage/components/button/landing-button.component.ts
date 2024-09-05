import { Component, Input } from '@angular/core'
import { Router } from '@angular/router'

@Component({
  selector: 'polo-landing-button',
  standalone: true,
  imports: [],
  templateUrl: './landing-button.component.html',
  styleUrl: './landing-button.component.sass',
})
export class LandingButtonComponent {
  @Input() behaviour: 'link' | 'button' = 'button'
  @Input() destiny?: string
  @Input() text?: string

  constructor(public router: Router) {}
}
