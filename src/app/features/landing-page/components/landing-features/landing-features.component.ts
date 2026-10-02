import { Component } from '@angular/core'
import { LandingFeatureCardComponent } from '../landing-feature-card/landing-feature-card.component'
import {
  LandingFeatureVisualComponent,
  LandingFeatureVisualKind,
} from '../landing-feature-visual/landing-feature-visual.component'

interface LandingFeature {
  visual: LandingFeatureVisualKind
  docsFragment: string
  label: string
  title: string
  description: string
  linkLabel: string
  wide: boolean
}

// Fragments match the feature ids in the feature guide, so each card opens its chapter.
const LANDING_FEATURES: readonly LandingFeature[] = [
  {
    visual: 'events',
    docsFragment: 'events',
    label: 'EVENTS',
    title: 'Choices with consequences',
    description:
      'Track coins, discoveries, trust and anything else your story needs to remember. Every scene and every answer can change the player’s state, no code required.',
    linkLabel: 'See how events work',
    wide: true,
  },
  {
    visual: 'distributor',
    docsFragment: 'distributors',
    label: 'DISTRIBUTORS',
    title: 'Paths that depend on the player',
    description:
      'Route readers by what they have done. The first matching route wins, and everyone else falls through to Otherwise.',
    linkLabel: 'Meet distributor nodes',
    wide: false,
  },
  {
    visual: 'player-input',
    docsFragment: 'player-input',
    label: 'PLAYER INPUT',
    title: 'The reader’s words, in your story',
    description:
      'Ask for a name or a thought, then weave it into later passages with a variable.',
    linkLabel: 'Ask the player',
    wide: false,
  },
  {
    visual: 'requirements',
    docsFragment: 'requirements',
    label: 'REQUIREMENTS',
    title: 'Answers they have to earn',
    description:
      'A discovered key opens the door. Enough coins buy the map. Answers only appear once the player meets every requirement.',
    linkLabel: 'Add requirements',
    wide: true,
  },
  {
    visual: 'focus-mode',
    docsFragment: 'focus-mode',
    label: 'FOCUS MODE',
    title: 'Room to write',
    description:
      'Step off the canvas into a distraction-free editor for long passages, with headings, lists and variables. Close it and you are back on the same map.',
    linkLabel: 'Try focus mode',
    wide: true,
  },
  {
    visual: 'organisation',
    docsFragment: 'organisation',
    label: 'GROUPS & FRAMES',
    title: 'Big stories, still readable',
    description: 'Collapse a chapter into a group, or keep it visible inside a movable frame.',
    linkLabel: 'Organise your board',
    wide: false,
  },
]

@Component({
  selector: 'polo-landing-features',
  standalone: true,
  imports: [LandingFeatureCardComponent, LandingFeatureVisualComponent],
  templateUrl: './landing-features.component.html',
  styleUrl: './landing-features.component.sass',
})
export class LandingFeaturesComponent {
  readonly features = LANDING_FEATURES
}
