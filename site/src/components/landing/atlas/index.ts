import type { Lang } from '../../../i18n'
import { ca } from './ca'
import { en } from './en'
import { es } from './es'
import type { AtlasCopy } from './types'

export * from './types'

const COPY: Record<Lang, AtlasCopy> = { en, es, ca }

export function atlasFor(lang: Lang): AtlasCopy {
  return COPY[lang]
}
