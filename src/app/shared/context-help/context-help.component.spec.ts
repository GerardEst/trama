import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing'
import { ContextHelpComponent } from './context-help.component'
import { ContextHelpService } from './context-help.service'
import { I18nService } from 'src/app/core/i18n/i18n.service'
import { CONTEXT_HELP_TOPICS } from './context-help.topics'

const KEY = 'polo-context-help'

describe('ContextHelpComponent', () => {
  let fixture: ComponentFixture<ContextHelpComponent>
  let help: ContextHelpService
  let previous: string | null

  beforeEach(() => {
    previous = localStorage.getItem(KEY)
    localStorage.removeItem(KEY)
    TestBed.configureTestingModule({ imports: [ContextHelpComponent] })
    fixture = TestBed.createComponent(ContextHelpComponent)
    fixture.componentRef.setInput('topic', 'board.events')
    help = TestBed.inject(ContextHelpService)
    fixture.detectChanges()
    document.body.appendChild(fixture.nativeElement)
  })

  afterEach(() => {
    fixture.destroy()
    fixture.nativeElement.remove()
    if (previous === null) localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, previous)
  })

  function trigger(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button')
  }

  function panel(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.contextHelp__panel')
  }

  function open() {
    trigger().click()
    fixture.detectChanges()
    tick()
  }

  function pointer(type: string, pointerType = 'mouse') {
    return new PointerEvent(type, { pointerType })
  }

  it('renders only an accessible question mark until opened', () => {
    expect(trigger().getAttribute('aria-label')).toBe('Help: Events')
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
    expect(panel()).toBeNull()
  })

  it('opens on delayed hover without stealing focus and enters the top layer', fakeAsync(() => {
    trigger().dispatchEvent(pointer('pointerenter'))
    tick(249)
    fixture.detectChanges()
    expect(panel()).toBeNull()
    const previousFocus = document.activeElement
    tick(1)
    fixture.detectChanges()
    tick()
    expect(panel()?.matches(':popover-open')).toBeTrue()
    expect(panel()?.textContent).toContain('Events change the player')
    expect(document.activeElement).toBe(previousFocus)
    expect(trigger().getAttribute('aria-describedby')).toBe(panel()!.id + '-body')
  }))

  it('provides a safe new-tab documentation link for every topic', fakeAsync(() => {
    for (const [topic, copy] of Object.entries(CONTEXT_HELP_TOPICS)) {
      fixture.componentRef.setInput('topic', topic)
      fixture.detectChanges()
      if (!panel()) open()
      const link = panel()!.querySelector<HTMLAnchorElement>('a')!
      expect(link.getAttribute('href')).toBe(`/docs/features#${copy.docsFragment}`)
      expect(link.textContent).toContain('View in the documentation')
      expect(link.target).toBe('_blank')
      expect(link.rel).toBe('noopener noreferrer')
      expect(link.getAttribute('aria-label')).toContain('Opens in a new tab')
      expect(panel()!.getAttribute('role')).toBe('dialog')
      expect(panel()!.getAttribute('aria-modal')).toBe('false')
      expect(panel()!.getAttribute('aria-labelledby')).toBe(panel()!.id + '-title')
      expect(trigger().getAttribute('aria-haspopup')).toBe('dialog')
      expect(trigger().getAttribute('aria-controls')).toBe(panel()!.id)
    }
  }))

  it('aligns the documentation button to the right of the panel', fakeAsync(() => {
    open()
    const popup = panel()!
    const link = popup.querySelector<HTMLAnchorElement>('a')!
    const style = getComputedStyle(popup)
    const contentRight = popup.getBoundingClientRect().right
      - parseFloat(style.paddingRight) - parseFloat(style.borderRightWidth)
    expect(link.getBoundingClientRect().right).toBeCloseTo(contentRight, 0)
  }))

  it('keeps the panel open while keyboard focus moves into its documentation link', fakeAsync(() => {
    trigger().focus()
    fixture.detectChanges()
    tick()
    const link = panel()!.querySelector<HTMLAnchorElement>('a')!
    link.focus()
    tick(200)
    fixture.detectChanges()
    expect(panel()).not.toBeNull()
    expect(document.activeElement).toBe(link)
    link.blur()
    tick(180)
    fixture.detectChanges()
    expect(panel()).toBeNull()
  }))

  it('returns focus from the documentation link on Escape without reopening help', fakeAsync(() => {
    open()
    const link = panel()!.querySelector<HTMLAnchorElement>('a')!
    link.focus()
    link.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    fixture.detectChanges()
    tick(200)
    fixture.detectChanges()
    expect(panel()).toBeNull()
    expect(document.activeElement).toBe(trigger())
    expect(help.activeId()).toBeNull()
  }))

  it('cancels hover if the pointer leaves before the delay', fakeAsync(() => {
    trigger().dispatchEvent(pointer('pointerenter'))
    tick(100)
    trigger().dispatchEvent(pointer('pointerleave'))
    tick(300)
    fixture.detectChanges()
    expect(panel()).toBeNull()
  }))

  it('lets the pointer cross the gap and hover over the explanation', fakeAsync(() => {
    trigger().dispatchEvent(pointer('pointerenter'))
    tick(250)
    fixture.detectChanges()
    tick()
    trigger().dispatchEvent(pointer('pointerleave'))
    tick(100)
    panel()!.dispatchEvent(pointer('pointerenter'))
    tick(200)
    fixture.detectChanges()
    expect(panel()).not.toBeNull()
    panel()!.dispatchEvent(pointer('pointerleave'))
    tick(180)
    fixture.detectChanges()
    expect(panel()).toBeNull()
  }))

  it('opens on keyboard focus and Escape does not dismiss the surrounding editor', fakeAsync(() => {
    trigger().focus()
    fixture.detectChanges()
    tick()
    expect(panel()).not.toBeNull()
    const surroundingEscape = jasmine.createSpy('surroundingEscape')
    document.addEventListener('keydown', surroundingEscape)
    try {
      trigger().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      fixture.detectChanges()
      expect(panel()).toBeNull()
      expect(document.activeElement).toBe(trigger())
      expect(surroundingEscape).not.toHaveBeenCalled()
    } finally {
      document.removeEventListener('keydown', surroundingEscape)
    }
  }))

  it('closes after focus leaves and the pointer is outside', fakeAsync(() => {
    trigger().focus()
    fixture.detectChanges()
    tick()
    trigger().blur()
    tick(180)
    fixture.detectChanges()
    expect(panel()).toBeNull()
  }))

  it('pins on the first click even when focus already opened it, then toggles closed', fakeAsync(() => {
    trigger().focus()
    fixture.detectChanges()
    tick()
    trigger().click()
    trigger().dispatchEvent(pointer('pointerleave'))
    trigger().blur()
    tick(200)
    fixture.detectChanges()
    expect(panel()).not.toBeNull()
    trigger().click()
    fixture.detectChanges()
    expect(panel()).toBeNull()
  }))

  it('does not open on touch hover but opens with a tap/click', fakeAsync(() => {
    trigger().dispatchEvent(pointer('pointerenter', 'touch'))
    tick(300)
    fixture.detectChanges()
    expect(panel()).toBeNull()
    open()
    expect(panel()).not.toBeNull()
  }))

  it('closes on an outside pointer event but not on the panel itself', fakeAsync(() => {
    open()
    panel()!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    fixture.detectChanges()
    expect(panel()).not.toBeNull()
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    fixture.detectChanges()
    expect(panel()).toBeNull()
  }))

  it('hides the question mark and closes active help immediately when disabled', fakeAsync(() => {
    open()
    help.setEnabled(false)
    fixture.detectChanges()
    expect(panel()).toBeNull()
    expect(fixture.nativeElement.querySelector('button')).toBeNull()
    expect(getComputedStyle(fixture.nativeElement).display).toBe('none')
    help.setEnabled(true)
    fixture.detectChanges()
    expect(trigger()).not.toBeNull()
    expect(panel()).toBeNull()
  }))

  it('cancels a pending hover when disabled, even if re-enabled before the delay', fakeAsync(() => {
    trigger().dispatchEvent(pointer('pointerenter'))
    help.setEnabled(false)
    fixture.detectChanges()
    help.setEnabled(true)
    fixture.detectChanges()
    tick(300)
    fixture.detectChanges()
    expect(panel()).toBeNull()
  }))

  it('replaces an existing explanation without its teardown closing the newer one', fakeAsync(() => {
    open()
    const second = TestBed.createComponent(ContextHelpComponent)
    second.componentRef.setInput('topic', 'board.requirements')
    second.detectChanges()
    document.body.appendChild(second.nativeElement)
    try {
      second.nativeElement.querySelector('button').click()
      fixture.detectChanges()
      second.detectChanges()
      tick()
      expect(panel()).toBeNull()
      expect(second.nativeElement.querySelector('.contextHelp__panel')).not.toBeNull()
      expect(help.activeId()).toBe(second.componentInstance.id)
    } finally {
      second.destroy()
      second.nativeElement.remove()
    }
  }))

  it('keeps the panel within the viewport near the bottom-right corner', fakeAsync(() => {
    spyOn(trigger(), 'getBoundingClientRect').and.returnValue(
      new DOMRect(window.innerWidth - 25, window.innerHeight - 25, 24, 24)
    )
    open()
    const rect = panel()!.getBoundingClientRect()
    expect(rect.left).toBeGreaterThanOrEqual(12)
    expect(rect.right).toBeLessThanOrEqual(window.innerWidth - 12)
    expect(rect.bottom).toBeLessThanOrEqual(window.innerHeight - 25 - 6)
  }))

  it('closes when the board pans and releases its document listeners', fakeAsync(() => {
    open()
    document.dispatchEvent(new CustomEvent('poloBoardPanStart'))
    fixture.detectChanges()
    expect(panel()).toBeNull()
    const escape = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true })
    document.dispatchEvent(escape)
    expect(escape.defaultPrevented).toBeFalse()
  }))

  it('cancels delayed work when destroyed', fakeAsync(() => {
    trigger().dispatchEvent(pointer('pointerenter'))
    fixture.destroy()
    tick(300)
    expect(help.activeId()).toBeNull()
  }))

  it('updates translated copy while open', async () => {
    const i18n = TestBed.inject(I18nService)
    const previousLang = document.documentElement.lang
    try {
      trigger().click()
      fixture.detectChanges()
      await i18n.setLang('ca', { persist: false })
      fixture.detectChanges()
      expect(trigger().getAttribute('aria-label')).toBe('Ajuda: Esdeveniments')
      expect(panel()?.textContent).toContain('Els esdeveniments canvien')
      expect(panel()?.querySelector('a')?.textContent).toContain('Veure-ho a la documentació')
    } finally {
      document.documentElement.lang = previousLang
    }
  })
})
