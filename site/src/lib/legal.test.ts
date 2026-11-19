import { describe, expect, it } from 'vitest'
import { OWNER, legalHtml } from './legal'
import { legal as en } from '../i18n/legal/en'
import { legal as es } from '../i18n/legal/es'
import { legal as ca } from '../i18n/legal/ca'

const links = { privacy: '/privacy', aepd: 'https://www.aepd.es' }

describe('legalHtml', () => {
  it('escapes the text', () => {
    expect(legalHtml('Tom & <b>Jerry</b>', links)).toBe('Tom &amp; &lt;b&gt;Jerry&lt;/b&gt;')
  })

  it('links [label](key) to the page with that key', () => {
    expect(legalHtml('Read the [privacy policy](privacy).', links)).toBe(
      'Read the <a href="/privacy">privacy policy</a>.',
    )
  })

  it('opens external links without passing the opener', () => {
    expect(legalHtml('[AEPD](aepd)', links)).toBe('<a href="https://www.aepd.es" rel="noopener">AEPD</a>')
  })

  it('turns {email} into a mailto link to the owner', () => {
    expect(legalHtml('Write to {email}.', links)).toBe(
      `Write to <a href="mailto:${OWNER.email}">${OWNER.email}</a>.`,
    )
  })

  it('fails on a link to an unknown page', () => {
    expect(() => legalHtml('[nowhere](missing)', links)).toThrow(/missing/)
  })
})

describe('legal copy', () => {
  const copies = { en, es, ca }

  it('has the same sections, in the same order, in every language', () => {
    for (const doc of ['privacy', 'terms'] as const) {
      const ids = en[doc].sections.map(section => section.id)
      expect(es[doc].sections.map(section => section.id)).toEqual(ids)
      expect(ca[doc].sections.map(section => section.id)).toEqual(ids)
    }
  })

  it('names the owner in the first section of both texts', () => {
    for (const copy of Object.values(copies)) {
      for (const doc of ['privacy', 'terms'] as const) {
        expect(copy[doc].sections[0].blocks).toContainEqual({ owner: true })
      }
    }
  })
})
