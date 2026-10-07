import { FEATURE_GUIDE } from 'src/app/features/feature-guide/feature-guide.content'
import { FEATURE_GUIDE_CA } from 'src/app/features/feature-guide/feature-guide.content.ca'
import { FEATURE_GUIDE_ES } from 'src/app/features/feature-guide/feature-guide.content.es'
import { CONTEXT_HELP_TOPICS } from './context-help.topics'

// Keep this dependency in tests only: help does not load the documentation copy.
describe('Contextual help documentation links', () => {
  for (const [lang, guide] of Object.entries({
    en: FEATURE_GUIDE,
    ca: FEATURE_GUIDE_CA,
    es: FEATURE_GUIDE_ES,
  })) {
    it(`links every explanation to an existing ${lang} chapter`, () => {
      const ids = guide.flatMap(group => group.features.map(feature => feature.id))
      for (const topic of Object.values(CONTEXT_HELP_TOPICS)) {
        expect(ids).toContain(topic.docsFragment)
      }
    })
  }
})
