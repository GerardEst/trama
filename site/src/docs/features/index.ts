import type { Lang } from '../../i18n'
import type { GuideGroup } from './types'
import { guide as en } from './en'
import { guide as es } from './es'
import { guide as ca } from './ca'

export type { GuideFeature, GuideGroup } from './types'

const GUIDES: Record<Lang, readonly GuideGroup[]> = { en, es, ca }

export function featureGuide(lang: Lang): readonly GuideGroup[] {
  return GUIDES[lang]
}

/** Chapter ids, the same in every language: the app links to them (/docs/features#events). */
export const FEATURE_IDS: readonly string[] = en.flatMap(group => group.features.map(feature => feature.id))
