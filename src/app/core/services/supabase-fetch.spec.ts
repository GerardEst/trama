import { AuthChangeEvent, AuthRetryableFetchError, Session, createClient, isAuthRetryableFetchError } from '@supabase/supabase-js'
import { withRetryableRefreshErrors } from './supabase-fetch'

const apiUrl = 'http://127.0.0.1:54321'
const refreshUrl = `${apiUrl}/auth/v1/token?grant_type=refresh_token`

describe('Supabase refresh server-error protection', () => {
  let fetchRequest: jasmine.Spy<typeof fetch>

  beforeEach(() => {
    fetchRequest = jasmine.createSpy<typeof fetch>('fetch')
    spyOn(console, 'error')
  })

  it('classifies every refresh HTTP 5xx as retryable without changing the original response', async () => {
    for (const status of [500, 501, 502, 503, 504, 599]) {
      const response = new Response('{"message":"Auth unavailable"}', { status })
      fetchRequest.and.resolveTo(response)
      await expectAsync(withRetryableRefreshErrors(apiUrl, fetchRequest)(refreshUrl, { method: 'POST' }))
        .toBeRejectedWith(jasmine.any(AuthRetryableFetchError))
      expect(response.status).toBe(status)
    }
  })

  it('leaves revoked-token, unauthorized, and rate-limit responses unchanged', async () => {
    for (const status of [400, 401, 403, 429]) {
      const response = new Response('{"message":"Auth denied"}', { status })
      fetchRequest.and.resolveTo(response)
      expect(await withRetryableRefreshErrors(apiUrl, fetchRequest)(refreshUrl, { method: 'POST' })).toBe(response)
    }
  })

  it('does not intercept unrelated operations, projects, or methods', async () => {
    for (const [url, method] of [
      [`${apiUrl}/rest/v1/stories`, 'PATCH'],
      [`${apiUrl}/auth/v1/token?grant_type=password`, 'POST'],
      ['https://other.example/auth/v1/token?grant_type=refresh_token', 'POST'],
      [refreshUrl, 'GET'],
    ]) {
      const response = new Response('{}', { status: 500 })
      fetchRequest.and.resolveTo(response)
      expect(await withRetryableRefreshErrors(apiUrl, fetchRequest)(url, { method })).toBe(response)
    }
  })

  it('forwards Request objects and options without modifying credentials', async () => {
    const input = new Request(refreshUrl, { method: 'POST', body: '{"refresh_token":"synthetic-token"}' })
    const response = new Response('{}', { status: 500 })
    fetchRequest.and.resolveTo(response)
    const options = { headers: { apikey: 'public-test-key' } }
    await expectAsync(withRetryableRefreshErrors(apiUrl, fetchRequest)(input, options)).toBeRejected()
    expect(fetchRequest).toHaveBeenCalledWith(input, options)
  })

  function clientWithStoredSession() {
    const key = crypto.randomUUID()
    const session: Session = {
      access_token: 'invalid-synthetic-access-token', refresh_token: 'synthetic-refresh-token',
      token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600,
      user: { id: 'author-1', aud: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: '' },
    }
    const stored = new Map<string, string>([[key, JSON.stringify(session)]])
    const client = createClient(apiUrl, 'public-test-key', {
      auth: {
        autoRefreshToken: false, persistSession: true, detectSessionInUrl: false, storageKey: key,
        storage: {
          getItem: (name) => stored.get(name) ?? null,
          setItem: (name, value) => { stored.set(name, value) },
          removeItem: (name) => { stored.delete(name) },
        },
      },
      global: { fetch: withRetryableRefreshErrors(apiUrl, fetchRequest) },
    })
    return { client, stored, key, session }
  }

  it('keeps the refresh token after HTTP 500 through the real SDK and recovers when Auth returns', async () => {
    fetchRequest.and.callFake(async () => new Response(JSON.stringify({
      code: 'unexpected_failure', message: 'missing destination name oauth_client_id in *models.Session',
    }), { status: 500 }))
    const { client, stored, key, session } = clientWithStoredSession()
    const events: AuthChangeEvent[] = []
    const { data } = client.auth.onAuthStateChange((event) => { events.push(event) })
    try {
      const failed = await client.auth.refreshSession()
      expect(isAuthRetryableFetchError(failed.error)).toBeTrue()
      expect(JSON.parse(stored.get(key)!).refresh_token).toBe(session.refresh_token)
      expect(events).not.toContain('SIGNED_OUT')
      const recovered = { ...session, access_token: 'renewed-synthetic-token', refresh_token: 'renewed-refresh-token' }
      fetchRequest.and.callFake(async () => new Response(JSON.stringify(recovered), { status: 200 }))
      const refreshed = await client.auth.refreshSession()
      expect(refreshed.error).toBeNull()
      expect(refreshed.data.session?.access_token).toBe(recovered.access_token)
      expect(events).toContain('TOKEN_REFRESHED')
      expect(events).not.toContain('SIGNED_OUT')
    } finally {
      data.subscription.unsubscribe()
    }
  })

  it('still clears a genuinely invalid refresh token through the real SDK', async () => {
    fetchRequest.and.callFake(async () => new Response('{"message":"Invalid Refresh Token"}', { status: 400 }))
    const { client, stored, key } = clientWithStoredSession()
    const refreshed = await client.auth.refreshSession()
    expect(refreshed.error?.status).toBe(400)
    expect(stored.get(key)).toBeUndefined()
  })
})
