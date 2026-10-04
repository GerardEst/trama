import { Component } from '@angular/core'
import { LandingFeatureCardComponent } from '../landing-feature-card/landing-feature-card.component'
import {
  LandingFeatureVisualComponent,
  LandingFeatureVisualKind,
} from '../landing-feature-visual/landing-feature-visual.component'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { TranslationKey } from 'src/app/core/i18n/i18n.types'

type LandingFeatureCopy = 'events' | 'distributors' | 'playerInput' | 'requirements' | 'focusMode' | 'organisation'

interface LandingFeature {
  visual: LandingFeatureVisualKind
  docsFragment: string
  copy: LandingFeatureCopy
  wide: boolean
}

// Fragments match the feature ids in the feature guide, so each card opens its chapter.
const LANDING_FEATURES: readonly LandingFeature[] = [
  { visual: 'events', docsFragment: 'events', copy: 'events', wide: true },
  { visual: 'distributor', docsFragment: 'distributors', copy: 'distributors', wide: false },
  { visual: 'player-input', docsFragment: 'player-input', copy: 'playerInput', wide: false },
  { visual: 'requirements', docsFragment: 'requirements', copy: 'requirements', wide: true },
  { visual: 'focus-mode', docsFragment: 'focus-mode', copy: 'focusMode', wide: true },
  { visual: 'organisation', docsFragment: 'organisation', copy: 'organisation', wide: false },
]

@Component({
  selector: 'polo-landing-features',
  standalone: true,
  imports: [LandingFeatureCardComponent, LandingFeatureVisualComponent, TranslatePipe],
  templateUrl: './landing-features.component.html',
  styleUrl: './landing-features.component.css',
})
export class LandingFeaturesComponent {
  readonly features = LANDING_FEATURES

  copyKey(feature: LandingFeature, field: 'label' | 'title' | 'description' | 'link'): TranslationKey {
    return `landing.features.${feature.copy}.${field}` as const
  }
}
