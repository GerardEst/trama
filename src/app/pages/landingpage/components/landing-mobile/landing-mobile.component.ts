import { Component } from '@angular/core'
import { GameComponent } from 'src/app/components/game/game.component'

@Component({
  selector: 'polo-landing-mobile',
  standalone: true,
  imports: [GameComponent],
  templateUrl: './landing-mobile.component.html',
  styleUrl: './landing-mobile.component.sass',
})
export class LandingMobileComponent {}
