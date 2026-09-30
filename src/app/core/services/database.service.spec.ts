import { TestBed } from '@angular/core/testing'
import { AuthApiError, AuthChangeEvent, AuthRetryableFetchError, Session, createClient } from '@supabase/supabase-js'
import { appUser, tree } from 'src/app/core/interfaces/interfaces'
import { DatabaseService, SUPABASE_CLIENT } from './database.service'

describe('DatabaseService story saves', () => {
  let database: DatabaseService
  let fetchRequest: jasmine.Spy<typeof fetch>
  const storyTree: tree = { nodes: [], refs: {}, categories: [] }
  let session: Session
  let notifyAuth: (event: AuthChangeEvent, session: Session | null) => void
  let unsubscribe: jasmine.Spy

  beforeEach(() => {
    session = {
      access_token: 'test-access-token', refresh_token: 'test-refresh-token',
      token_type: 'bearer', expires_in: 3600,
      user: { id: 'author-1', aud: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: '' },
    }
    fetchRequest = jasmine.createSpy<typeof fetch>('fetch').and.resolveTo(
      new Response(JSON.stringify({ id: 'story-1' }), { status: 200 })
    )
    const client = createClient('http://127.0.0.1:54321', 'public-test-key', {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storageKey: crypto.randomUUID() },
      global: { fetch: fetchRequest },
    })
    unsubscribe = jasmine.createSpy('unsubscribe')
    spyOn(client.auth, 'onAuthStateChange').and.callFake((callback) => {
      notifyAuth = callback
      return { data: { subscription: { id: 'test-subscription', callback, unsubscribe } } }
    })
    spyOn(client.auth, 'getSession').and.callFake(async () => ({ data: { session }, error: null }))
    spyOn(client.auth, 'refreshSession').and.callFake(async () => {
      session = { ...session, access_token: 'renewed-test-access-token' }
      notifyAuth('TOKEN_REFRESHED', session)
      return { data: { session, user: session.user }, error: null }
    })
    TestBed.configureTestingModule({ providers: [{ provide: SUPABASE_CLIENT, useValue: client }] })
    database = TestBed.inject(DatabaseService)
    database.user.set({ ...session.user, profile: { plan: 'pro' } } as appUser)
    spyOn(console, 'error')
  })

  it('confirms the updated row through the real Supabase request builder', async () => {
    expect(await database.saveTreeToDB('story-1', storyTree)).toBeTrue()
    const [url, request] = fetchRequest.calls.mostRecent().args
    expect(new URL(String(url)).searchParams.get('id')).toBe('eq.story-1')
    expect(new URL(String(url)).searchParams.get('select')).toBe('id')
    expect(request?.method).toBe('PATCH')
    expect(JSON.parse(String(request?.body))).toEqual({ tree: storyTree })
    expect(new Headers(request?.headers).get('Prefer')).toContain('return=representation')
  })

  it('does not acknowledge an update that returns no row, even without an API error', async () => {
    fetchRequest.and.resolveTo(new Response('[]', { status: 200 }))
    expect(await database.saveTreeToDB('story-1', storyTree)).toBeFalse()
  })

  it('does not acknowledge a different story or an empty response', async () => {
    fetchRequest.and.resolveTo(new Response('{"id":"other-story"}', { status: 200 }))
    expect(await database.saveTreeToDB('story-1', storyTree)).toBeFalse()
    fetchRequest.and.resolveTo(new Response(null, { status: 204 }))
    expect(await database.saveTreeToDB('story-1', storyTree)).toBeFalse()
  })

  it('reports permission or expired-session errors as failed saves', async () => {
    fetchRequest.and.resolveTo(new Response(JSON.stringify({ code: '42501', message: 'Permission denied' }), { status: 403 }))
    expect(await database.saveTreeToDB('story-1', storyTree)).toBeFalse()
    fetchRequest.and.resolveTo(new Response(JSON.stringify({ code: 'PGRST301', message: 'JWT expired' }), { status: 401 }))
    expect(await database.saveTreeToDB('story-1', storyTree)).toBeFalse()
  })

  it('refreshes a rejected JWT and retries the same snapshot once with the new token', async () => {
    fetchRequest.and.returnValues(
      Promise.resolve(new Response('{"code":"PGRST301","message":"JWT expired"}', { status: 401 })),
      Promise.resolve(new Response('{"id":"story-1"}', { status: 200 }))
    )
    expect(await database.saveTreeToDB('story-1', storyTree)).toBeTrue()
    expect(database.supabase.auth.refreshSession).toHaveBeenCalledTimes(1)
    expect(fetchRequest).toHaveBeenCalledTimes(2)
    const requests = fetchRequest.calls.allArgs().map(([, request]) => request!)
    expect(requests.map((request) => JSON.parse(String(request.body)))).toEqual([{ tree: storyTree }, { tree: storyTree }])
    expect(new Headers(requests[0].headers).get('Authorization')).toBe('Bearer test-access-token')
    expect(new Headers(requests[1].headers).get('Authorization')).toBe('Bearer renewed-test-access-token')
  })

  it('does not loop if the renewed JWT is also rejected', async () => {
    fetchRequest.and.callFake(async () => new Response('{"code":"PGRST301"}', { status: 401 }))
    expect(await database.saveTreeToDB('story-1', storyTree)).toBeFalse()
    expect(database.supabase.auth.refreshSession).toHaveBeenCalledTimes(1)
    expect(fetchRequest).toHaveBeenCalledTimes(2)
  })

  it('does not refresh a JWT to hide zero-row or permission errors', async () => {
    for (const [status, code] of [[406, 'PGRST116'], [403, '42501']] as const) {
      fetchRequest.and.resolveTo(new Response(JSON.stringify({ code }), { status }))
      expect(await database.saveTreeToDB('story-1', storyTree)).toBeFalse()
    }
    expect(database.supabase.auth.refreshSession).not.toHaveBeenCalled()
  })

  it('retains the user when a refresh fails temporarily without replaying the write', async () => {
    fetchRequest.and.resolveTo(new Response('{"code":"PGRST301"}', { status: 401 }))
    const signOut = spyOn(database.supabase.auth, 'signOut')
    const original = database.user()
    const refresh = database.supabase.auth.refreshSession as jasmine.Spy
    refresh.and.resolveTo({
      data: { session: null, user: null }, error: new AuthRetryableFetchError('Offline', 0),
    })
    expect(await database.saveTreeToDB('story-1', storyTree)).toBeFalse()
    expect(database.user()).toBe(original)
    expect(database.authenticationRequired()).toBeFalse()
    expect(signOut).not.toHaveBeenCalled()
    expect(fetchRequest).toHaveBeenCalledTimes(1)
  })

  it('does not submit an anonymous write after session loss', async () => {
    const getSession = database.supabase.auth.getSession as jasmine.Spy
    getSession.and.resolveTo({ data: { session: null }, error: null })
    expect(await database.saveTreeToDB('story-1', storyTree)).toBeFalse()
    expect(fetchRequest).not.toHaveBeenCalled()
    expect(database.authenticationRequired()).toBeTrue()
    expect(database.user()).toBeNull()
  })

  it('never replays an old author\'s snapshot when the account changes during refresh', async () => {
    fetchRequest.and.resolveTo(new Response('{"code":"PGRST301"}', { status: 401 }))
    const refresh = database.supabase.auth.refreshSession as jasmine.Spy
    refresh.and.callFake(async () => {
      session = { ...session, user: { ...session.user, id: 'other-author' } }
      notifyAuth('SIGNED_IN', session)
      return { data: { session, user: session.user }, error: null }
    })
    expect(await database.saveTreeToDB('story-1', storyTree)).toBeFalse()
    expect(fetchRequest).toHaveBeenCalledTimes(1)
    expect(database.user()).toBeNull()
  })

  it('synchronizes session events and unsubscribes on destruction', () => {
    const profile = database.user()!.profile
    notifyAuth('TOKEN_REFRESHED', session)
    expect(database.user()?.profile).toBe(profile)
    notifyAuth('SIGNED_OUT', null)
    expect(database.user()).toBeNull()
    expect(database.authenticationRequired()).toBeTrue()
    notifyAuth('SIGNED_IN', session)
    expect(database.authenticationRequired()).toBeFalse()
    database.ngOnDestroy()
    expect(unsubscribe).toHaveBeenCalled()
  })

  it('refreshes once when a user validation request rejects the JWT', async () => {
    const getUser = spyOn(database.supabase.auth, 'getUser').and.returnValues(
      Promise.resolve({ data: { user: null }, error: new AuthApiError('JWT expired', 401) }),
      Promise.resolve({ data: { user: session.user }, error: null })
    )
    fetchRequest.and.resolveTo(new Response('[{"plan":"pro","subscription_status":"active"}]', { status: 200 }))
    expect(await database.getUser()).toBeTruthy()
    expect(getUser).toHaveBeenCalledTimes(2)
    expect(database.supabase.auth.refreshSession).toHaveBeenCalledTimes(1)
  })

  it('does not sign out or clear the cached user on a transient validation error', async () => {
    const cached = database.user()
    spyOn(database.supabase.auth, 'getUser').and.resolveTo({
      data: { user: null }, error: new AuthRetryableFetchError('Offline', 0),
    })
    const signOut = spyOn(database.supabase.auth, 'signOut')
    expect(await database.getUser()).toBeFalse()
    expect(database.user()).toBe(cached)
    expect(signOut).not.toHaveBeenCalled()
    expect(database.supabase.auth.refreshSession).not.toHaveBeenCalled()
  })

  it('does not resurrect a user after signing out during a profile request', async () => {
    spyOn(database.supabase.auth, 'getUser').and.resolveTo({ data: { user: session.user }, error: null })
    fetchRequest.and.callFake(async () => {
      notifyAuth('SIGNED_OUT', null)
      const getSession = database.supabase.auth.getSession as jasmine.Spy
      getSession.and.resolveTo({ data: { session: null }, error: null })
      return new Response('[{"plan":"pro"}]', { status: 200 })
    })
    expect(await database.getUser()).toBeFalse()
    expect(database.user()).toBeNull()
  })

  it('bounds a stalled refresh and never sends a late retry after the deadline', async () => {
    jasmine.clock().install()
    try {
      let started: () => void = () => undefined
      const refreshStarted = new Promise<void>((resolve) => { started = resolve })
      let finish: (result: Awaited<ReturnType<typeof database.supabase.auth.refreshSession>>) => void = () => undefined
      const refresh = database.supabase.auth.refreshSession as jasmine.Spy
      refresh.and.callFake(() => {
        started()
        return new Promise((resolve) => { finish = resolve })
      })
      fetchRequest.and.callFake(async () => new Response('{"code":"PGRST301"}', { status: 401 }))
      const saving = database.saveTreeToDB('story-1', storyTree)
      await refreshStarted
      jasmine.clock().tick(15000)
      expect(await saving).toBeFalse()
      finish({ data: { session, user: session.user }, error: null })
      await Promise.resolve()
      expect(fetchRequest).toHaveBeenCalledTimes(1)
    } finally {
      jasmine.clock().uninstall()
    }
  })

  it('reports a dropped network connection as a failed save', async () => {
    fetchRequest.and.rejectWith(new TypeError('Failed to fetch'))
    expect(await database.saveTreeToDB('story-1', storyTree)).toBeFalse()
  })

  it('aborts a stalled request so it cannot block the save queue forever', async () => {
    jasmine.clock().install()
    try {
      let started: () => void = () => undefined
      const requestStarted = new Promise<void>((resolve) => { started = resolve })
      fetchRequest.and.callFake((_url, options) => new Promise<Response>((_resolve, reject) => {
        options?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
        started()
      }))
      const saving = database.saveTreeToDB('story-1', storyTree)
      await requestStarted
      jasmine.clock().tick(15000)
      expect(await saving).toBeFalse()
      expect(fetchRequest.calls.mostRecent().args[1]?.signal?.aborted).toBeTrue()
    } finally {
      jasmine.clock().uninstall()
    }
  })
})
