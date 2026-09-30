import { TestBed } from '@angular/core/testing'
import { createClient } from '@supabase/supabase-js'
import { tree } from 'src/app/core/interfaces/interfaces'
import { DatabaseService } from './database.service'

describe('DatabaseService story saves', () => {
  let database: DatabaseService
  let fetchRequest: jasmine.Spy<typeof fetch>
  const storyTree: tree = { nodes: [], refs: {}, categories: [] }

  beforeEach(() => {
    TestBed.configureTestingModule({})
    database = TestBed.inject(DatabaseService)
    fetchRequest = jasmine.createSpy<typeof fetch>('fetch').and.resolveTo(
      new Response(JSON.stringify({ id: 'story-1' }), { status: 200 })
    )
    database.supabase = createClient('http://127.0.0.1:54321', 'public-test-key', {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storageKey: crypto.randomUUID() },
      global: { fetch: fetchRequest },
    })
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
