import { safeReturnUrl } from './return-url'

describe('safeReturnUrl', () => {
  it('returns to a page of the app, with its query', () => {
    expect(safeReturnUrl('/story/abc/statistics')).toBe('/story/abc/statistics')
    expect(safeReturnUrl('/settings/billing?tab=plan')).toBe('/settings/billing?tab=plan')
  })

  it('opens the dashboard for anything that is not a path of the app', () => {
    for (const url of [undefined, null, '', 'https://evil.example', '//evil.example', '/\\evil.example', 'story/abc', 42]) {
      expect(safeReturnUrl(url)).withContext(String(url)).toBe('/dashboard')
    }
  })

  it('never returns to the login page itself', () => {
    expect(safeReturnUrl('/login?mode=register')).toBe('/dashboard')
    expect(safeReturnUrl('/')).toBe('/dashboard')
  })
})
