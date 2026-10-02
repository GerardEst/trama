import { FEATURE_GUIDE } from './feature-guide.content'
import { FEATURE_GUIDE_ES } from './feature-guide.content.es'
import { FEATURE_GUIDE_CA } from './feature-guide.content.ca'

describe('Feature guide translations', () => {
  const shape = (guide: typeof FEATURE_GUIDE) =>
    guide.map((group) =>
      group.features.map((feature) => ({
        id: feature.id,
        steps: feature.steps.length,
        lines: feature.example.lines.length,
      }))
    )

  for (const [lang, guide] of Object.entries({
    es: FEATURE_GUIDE_ES,
    ca: FEATURE_GUIDE_CA,
  })) {
    it(`keeps the ${lang} chapters, steps and examples aligned with English`, () => {
      expect(shape(guide)).toEqual(shape(FEATURE_GUIDE))
    })
  }
})
