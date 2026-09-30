import { AuthRetryableFetchError } from '@supabase/supabase-js'

/** Preserve refresh credentials on an Auth outage, not on revoked tokens. */
export function withRetryableRefreshErrors(apiUrl: string, fetchRequest: typeof fetch = fetch): typeof fetch {
  const tokenUrl = new URL(`${apiUrl.replace(/\/$/, '')}/auth/v1/token`)

  return async (input, options) => {
    const response = await fetchRequest(input, options)
    if (response.status >= 500 && response.status < 600) {
      const url = new URL(input instanceof Request ? input.url : String(input))
      const method = options?.method ?? (input instanceof Request ? input.method : 'GET')
      if (
        method.toUpperCase() === 'POST' &&
        url.origin === tokenUrl.origin && url.pathname === tokenUrl.pathname &&
        url.searchParams.get('grant_type') === 'refresh_token'
      ) {
        // auth-js 2.61 treats HTTP 500 as terminal and removes the session.
        // Throwing at its fetch boundary makes this a retryable fetch error.
        // Never log request headers, bodies, or tokens. The original HTTP
        // response remains visible in the browser's Network panel.
        throw new AuthRetryableFetchError(`Supabase token refresh unavailable (HTTP ${response.status})`, response.status)
      }
    }
    return response
  }
}
