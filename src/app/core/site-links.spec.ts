import { SITE_PAGES, siteUrl } from './site-links'

describe('siteUrl', () => {
  it('links to the public pages of each language, English without prefix', () => {
    expect(siteUrl('en')).toBe('/')
    expect(siteUrl('es')).toBe('/es')
    expect(siteUrl('en', SITE_PAGES.features)).toBe('/docs/features')
    expect(siteUrl('ca', SITE_PAGES.features, 'events')).toBe('/ca/docs/features#events')
  })
})
