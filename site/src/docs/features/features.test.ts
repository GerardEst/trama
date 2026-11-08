import { describe, expect, it } from 'vitest'
import { CONTEXT_HELP_TOPICS } from '@app/app/shared/context-help/context-help.topics'
import { FEATURE_IDS, featureGuide } from '.'
import { LANGS } from '../../i18n'

const shape = (lang: (typeof LANGS)[number]) =>
  featureGuide(lang).map(group =>
    group.features.map(feature => ({
      id: feature.id,
      steps: feature.steps.length,
      lines: feature.example.lines.length,
    })),
  )

describe('features guide', () => {
  it('has twelve chapters with unique ids', () => {
    expect(FEATURE_IDS).toHaveLength(12)
    expect(new Set(FEATURE_IDS).size).toBe(12)
  })

  for (const lang of ['es', 'ca'] as const) {
    it(`keeps the ${lang} chapters, steps and examples aligned with English`, () => {
      expect(shape(lang)).toEqual(shape('en'))
    })
  }

  it('has a chapter for every documentation link of the app’s contextual help', () => {
    for (const topic of Object.values(CONTEXT_HELP_TOPICS)) {
      expect(FEATURE_IDS).toContain(topic.docsFragment)
    }
  })
})
