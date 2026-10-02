import { Component, Input } from '@angular/core'

export type LandingFeatureVisualKind =
  | 'events'
  | 'distributor'
  | 'player-input'
  | 'requirements'
  | 'focus-mode'
  | 'organisation'

@Component({
  selector: 'polo-landing-feature-visual',
  standalone: true,
  imports: [],
  templateUrl: './landing-feature-visual.component.html',
  styleUrl: './landing-feature-visual.component.sass',
})
export class LandingFeatureVisualComponent {
  @Input({ required: true }) kind!: LandingFeatureVisualKind

  // Each marquee row is rendered twice so the loop has no visible seam.
  readonly eventRows: readonly (readonly string[])[] = [
    ['trust +1', 'has_key → true', 'coins −3', 'visited_library → true', 'courage +2', 'name = Morgan', 'clues +1', 'door_open → true'],
    ['map_found → true', 'coins +5', 'trust −1', 'door_open → true', 'clues +1', 'mood = curious', 'lantern → false', 'secrets +1'],
    ['lantern → false', 'coins +1', 'ally = Ines', 'secrets +1', 'trust +2', 'has_key → true', 'courage −1', 'map_found → true'],
    ['met_gatekeeper → true', 'coins −1', 'title = Archivist', 'trust +1', 'visited_tower → true', 'clues +2', 'ally = Ines', 'coins +2'],
  ]
}
