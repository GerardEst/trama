import { Injectable, signal } from '@angular/core'
import { en } from './en'
import {
  Dictionary,
  isLang,
  Lang,
  TranslationKey,
  TranslationParams,
} from './i18n.types'

const LANG_KEY = 'polo-lang'

// Spanish and Catalan are only downloaded when somebody needs them.
const loaders: Record<Exclude<Lang, 'en'>, () => Promise<Dictionary>> = {
  es: () => import('./es').then((m) => m.es),
  ca: () => import('./ca').then((m) => m.ca),
}

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly langState = signal<Lang>('en')
  readonly lang = this.langState.asReadonly()
  private readonly dictionaries = new Map<Lang, Map<string, string>>([
    ['en', flatten(en)],
  ])

  // Runs before the first render so nobody sees a flash of English.
  async init() {
    await this.use(this.urlLang() ?? this.savedLang() ?? this.browserLang())
  }

  // Only an explicit choice is remembered; a localised URL applies to the visit.
  async setLang(lang: Lang, { persist = true } = {}) {
    await this.use(lang)
    if (!persist) return
    try {
      localStorage.setItem(LANG_KEY, lang)
    } catch {
      // The current page still switches language without persistence.
    }
  }

  has(key: string): key is TranslationKey {
    return this.dictionaries.get('en')?.has(key) ?? false
  }

  t(key: TranslationKey, params?: TranslationParams): string {
    const value =
      this.dictionaries.get(this.lang())?.get(key) ??
      this.dictionaries.get('en')?.get(key) ??
      key
    return params ? interpolate(value, params) : value
  }

  // Long prose (guides, the landing demo story) is translated as whole documents.
  pick<T>(variants: Record<Lang, T>): T {
    return variants[this.lang()]
  }

  formatDate(
    value: string | number | Date,
    options?: Intl.DateTimeFormatOptions
  ) {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return String(value)
    return new Intl.DateTimeFormat(this.lang(), options).format(date)
  }

  formatNumber(value: number, options?: Intl.NumberFormatOptions) {
    return new Intl.NumberFormat(this.lang(), options).format(value)
  }

  private async use(lang: Lang) {
    try {
      await this.load(lang)
    } catch (error: unknown) {
      console.error(`Could not load the ${lang} translations`, error)
      lang = 'en'
    }
    this.langState.set(lang)
    document.documentElement.lang = lang
  }

  private async load(lang: Lang) {
    if (lang === 'en' || this.dictionaries.has(lang)) return
    this.dictionaries.set(lang, flatten(await loaders[lang]()))
  }

  // Localised landing pages live at /es and /ca.
  private urlLang(): Lang | null {
    const segment = window.location.pathname.split('/')[1]
    return segment !== 'en' && isLang(segment) ? segment : null
  }

  private savedLang(): Lang | null {
    try {
      const saved = localStorage.getItem(LANG_KEY)
      return isLang(saved) ? saved : null
    } catch {
      return null
    }
  }

  private browserLang(): Lang {
    const preferred = navigator.languages?.length
      ? navigator.languages
      : [navigator.language]
    for (const tag of preferred) {
      const base = tag?.toLowerCase().split('-')[0]
      if (isLang(base)) return base
    }
    return 'en'
  }
}

function flatten(
  dictionary: object,
  prefix = '',
  result = new Map<string, string>()
) {
  for (const [key, value] of Object.entries(dictionary)) {
    if (typeof value === 'string') result.set(prefix + key, value)
    else flatten(value, `${prefix}${key}.`, result)
  }
  return result
}

function interpolate(value: string, params: TranslationParams) {
  return value.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match
  )
}
