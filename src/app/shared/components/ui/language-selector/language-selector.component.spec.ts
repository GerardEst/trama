import { TestBed } from '@angular/core/testing'
import { LanguageSelectorComponent } from './language-selector.component'
import { I18nService } from 'src/app/core/i18n/i18n.service'

describe('LanguageSelectorComponent', () => {
  let previous: string | null

  beforeEach(() => {
    previous = localStorage.getItem('polo-lang')
  })

  afterEach(async () => {
    await TestBed.inject(I18nService).setLang('en', { persist: false })
    if (previous === null) localStorage.removeItem('polo-lang')
    else localStorage.setItem('polo-lang', previous)
  })

  it('marks the active language and switches to the chosen one', async () => {
    const fixture = TestBed.createComponent(LanguageSelectorComponent)
    const emitted: string[] = []
    fixture.componentInstance.langChange.subscribe((lang) => emitted.push(lang))
    fixture.detectChanges()

    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll(
        'button'
      ) as NodeListOf<HTMLButtonElement>
    )
    expect(buttons.map((button) => button.textContent?.trim())).toEqual([
      'EN',
      'ES',
      'CA',
    ])
    expect(buttons[0].getAttribute('aria-pressed')).toBe('true')

    await fixture.componentInstance.select('ca')
    fixture.detectChanges()

    expect(buttons[2].getAttribute('aria-pressed')).toBe('true')
    expect(buttons[0].getAttribute('aria-pressed')).toBe('false')
    expect(emitted).toEqual(['ca'])
    expect(localStorage.getItem('polo-lang')).toBe('ca')
  })
})
