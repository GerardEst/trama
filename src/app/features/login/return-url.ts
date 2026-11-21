const DEFAULT_RETURN = '/dashboard'

/**
 * Where to go after signing in: the page the guard stopped, only if it is a path of this app.
 * Anything else, such as another site (`//evil.example`) or the login page itself, opens the dashboard.
 */
export function safeReturnUrl(url: unknown): string {
  if (typeof url !== 'string' || !url.startsWith('/') || url.startsWith('//') || url.startsWith('/\\')) return DEFAULT_RETURN
  const path = url.split(/[?#]/)[0]
  if (path === '/login' || path === '/') return DEFAULT_RETURN
  return url
}
