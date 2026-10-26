import { ComponentFixture, TestBed } from '@angular/core/testing'
import { I18nService } from 'src/app/core/i18n/i18n.service'
import { LandingAuthoringComponent } from './landing-authoring.component'

describe('LandingAuthoringComponent', () => {
  let fixture: ComponentFixture<LandingAuthoringComponent>
  let host: HTMLElement

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LandingAuthoringComponent] }).compileComponents()
    await TestBed.inject(I18nService).setLang('en', { persist: false })
    fixture = TestBed.createComponent(LandingAuthoringComponent)
    fixture.detectChanges()
    host = fixture.nativeElement
  })

  it('starts with a lazy-loaded real writing capture and four selectable steps', () => {
    expect(host.querySelectorAll('button').length).toBe(4)
    expect(host.querySelectorAll('button[aria-pressed="true"]').length).toBe(1)
    expect(host.querySelector('img')?.getAttribute('src')).toBe('/assets/images/landing/authoring/en-write.webp')
    expect(host.querySelector('img')?.getAttribute('loading')).toBe('lazy')
    expect(host.querySelector('img')?.getAttribute('width')).toBe('1600')
    expect(host.querySelector('img')?.getAttribute('height')).toBe('1000')
  })

  it('selects each view without embedding the authenticated board or text editor', () => {
    const buttons = host.querySelectorAll('button')
    fixture.componentInstance.views.forEach((view, index) => {
      buttons[index].click()
      fixture.detectChanges()
      expect(host.querySelector('img')?.getAttribute('src')).toBe(`/assets/images/landing/authoring/en-${view}.webp`)
      expect(host.querySelector('img')?.getAttribute('alt')?.trim()).toBeTruthy()
      expect(buttons[index].getAttribute('aria-pressed')).toBe('true')
      expect(host.querySelectorAll('button[aria-pressed="true"]').length).toBe(1)
      expect(host.querySelector('a')?.getAttribute('href')).toBe(`/assets/images/landing/authoring/en-${view}.webp`)
    })
    expect(host.querySelector('polo-board, polo-rich-text-editor')).toBeNull()
  })

  for (const lang of ['ca', 'es'] as const) {
    it(`updates the capture and copy in ${lang}, preserving the selected view`, async () => {
      fixture.componentInstance.selected.set('map')
      await TestBed.inject(I18nService).setLang(lang, { persist: false })
      fixture.detectChanges()
      expect(host.querySelector('img')?.getAttribute('src')).toBe(`/assets/images/landing/authoring/${lang}-map.webp`)
      expect(host.querySelector('button[aria-pressed="true"]')?.textContent).toContain(TestBed.inject(I18nService).t('landing.authoring.map.title'))
      expect(host.querySelector('h2')?.textContent).not.toContain('From your first scene')
    })
  }
})
