import { TestBed } from '@angular/core/testing'
import { I18nService } from './i18n.service'
import { en } from './en'
import { es } from './es'
import { ca } from './ca'

describe('I18nService', () => {
  const key = 'polo-lang'
  let previousLang: string | null
  let previousHtmlLang: string

  const withBrowserLanguages = (languages: string[]) =>
    spyOnProperty(navigator, 'languages').and.returnValue(languages)

  beforeEach(() => {
    previousLang = localStorage.getItem(key)
    previousHtmlLang = document.documentElement.lang
    localStorage.removeItem(key)
  })

  afterEach(() => {
    if (previousLang === null) localStorage.removeItem(key)
    else localStorage.setItem(key, previousLang)
    document.documentElement.lang = previousHtmlLang
  })

  it('detects Catalan and Spanish browsers, including regional variants', async () => {
    withBrowserLanguages(['ca-ES-valencia', 'es'])
    const i18n = TestBed.inject(I18nService)
    await i18n.init()
    expect(i18n.lang()).toBe('ca')
    expect(document.documentElement.lang).toBe('ca')
    expect(i18n.t('common.cancel')).toBe('Cancel·la')
  })

  it('falls back to English for unsupported browser languages', async () => {
    withBrowserLanguages(['fr-FR', 'de'])
    const i18n = TestBed.inject(I18nService)
    await i18n.init()
    expect(i18n.lang()).toBe('en')
    expect(i18n.t('common.cancel')).toBe('Cancel')
  })

  it('prefers the saved choice over the browser language', async () => {
    withBrowserLanguages(['ca'])
    localStorage.setItem(key, 'es')
    const i18n = TestBed.inject(I18nService)
    await i18n.init()
    expect(i18n.lang()).toBe('es')
  })

  it('remembers explicit choices, but not languages applied for a single visit', async () => {
    const i18n = TestBed.inject(I18nService)
    await i18n.setLang('es', { persist: false })
    expect(localStorage.getItem(key)).toBeNull()
    await i18n.setLang('ca')
    expect(localStorage.getItem(key)).toBe('ca')
  })

  it('interpolates parameters and formats numbers for the active language', async () => {
    const i18n = TestBed.inject(I18nService)
    await i18n.setLang('es', { persist: false })
    expect(i18n.t('board.route.title', { number: 2 })).toBe('Ruta 2')
    expect(i18n.formatNumber(5.95, { minimumFractionDigits: 2 })).toBe('5,95')
  })

  it('keeps working when storage is blocked', async () => {
    spyOn(localStorage, 'getItem').and.throwError('blocked')
    spyOn(localStorage, 'setItem').and.throwError('blocked')
    withBrowserLanguages(['es'])
    const i18n = TestBed.inject(I18nService)
    await i18n.init()
    await i18n.setLang('ca')
    expect(i18n.lang()).toBe('ca')
  })
})

describe('Translations', () => {
  const leaves = (dictionary: object, prefix = ''): [string, string][] =>
    Object.entries(dictionary).flatMap(([name, value]) =>
      typeof value === 'string'
        ? [[prefix + name, value]]
        : leaves(value, `${prefix}${name}.`)
    )
  const english = new Map(leaves(en))
  const placeholders = (value: string) => (value.match(/\{\w+\}/g) ?? []).sort()

  // Words that are spelled the same in English, or deliberately left empty by the grammar.
  const sameAsEnglish = new Set([
    'dashboard.paywall.upgradeEnd',
    'board.groups.nodes',
    'board.frames.nodes',
  ])

  for (const [lang, dictionary] of Object.entries({ es, ca })) {
    it(`gives every ${lang} string the same placeholders as English and a real translation`, () => {
      for (const [key, value] of leaves(dictionary)) {
        const source = english.get(key) ?? ''
        expect(placeholders(value))
          .withContext(`${lang} ${key}`)
          .toEqual(placeholders(source))
        if (sameAsEnglish.has(key)) continue
        expect(value.trim()).withContext(`${lang} ${key} is empty`).not.toBe('')
        expect(value)
          .withContext(`${lang} ${key} is untranslated`)
          .not.toBe(source)
      }
    })
  }
})
