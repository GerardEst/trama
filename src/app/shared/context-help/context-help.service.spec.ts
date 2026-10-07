import { TestBed } from '@angular/core/testing'
import { ContextHelpService } from './context-help.service'

const KEY = 'polo-context-help'

describe('ContextHelpService', () => {
  let previous: string | null

  beforeEach(() => {
    previous = localStorage.getItem(KEY)
    localStorage.removeItem(KEY)
    TestBed.configureTestingModule({})
  })

  afterEach(() => {
    if (previous === null) localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, previous)
  })

  it('enables help by default and ignores invalid stored preferences', () => {
    localStorage.setItem(KEY, 'invalid')
    expect(TestBed.inject(ContextHelpService).enabled()).toBeTrue()
  })

  it('restores an explicit opt-out', () => {
    localStorage.setItem(KEY, 'false')
    expect(TestBed.inject(ContextHelpService).enabled()).toBeFalse()
  })

  it('persists changes and dismisses active help when disabled', () => {
    const help = TestBed.inject(ContextHelpService)
    help.open('first')
    help.setEnabled(false)
    expect(help.enabled()).toBeFalse()
    expect(help.activeId()).toBeNull()
    expect(localStorage.getItem(KEY)).toBe('false')
    help.open('second')
    expect(help.activeId()).toBeNull()
    help.setEnabled(true)
    expect(help.enabled()).toBeTrue()
    expect(localStorage.getItem(KEY)).toBe('true')
    expect(help.activeId()).toBeNull()
  })

  it('allows only one active explanation and does not dismiss a newer one', () => {
    const help = TestBed.inject(ContextHelpService)
    help.open('first')
    help.open('second')
    help.close('first')
    expect(help.activeId()).toBe('second')
    help.close('second')
    expect(help.activeId()).toBeNull()
  })

  it('works when browser storage is blocked', () => {
    spyOn(localStorage, 'getItem').and.throwError('blocked')
    spyOn(localStorage, 'setItem').and.throwError('blocked')
    const help = TestBed.inject(ContextHelpService)
    expect(help.enabled()).toBeTrue()
    expect(() => help.setEnabled(false)).not.toThrow()
    expect(help.enabled()).toBeFalse()
  })
})
