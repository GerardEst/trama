import { TestBed } from '@angular/core/testing'
import { provideRouter, Router, withComponentInputBinding } from '@angular/router'
import { RouterTestingHarness } from '@angular/router/testing'
import { DatabaseService } from 'src/app/core/services/database.service'
import { I18nService } from 'src/app/core/i18n/i18n.service'
import { landingRoutes } from './routes'
import { LandingpageComponent } from './landingpage.component'

describe('Localised landing navigation', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(landingRoutes, withComponentInputBinding()),
        {
          provide: DatabaseService,
          useValue: { getUser: () => Promise.resolve(null), user: () => undefined },
        },
      ],
    })
  })

  for (const [lang, path, docs] of [
    ['en', '/', 'Docs'],
    ['ca', '/ca', 'Documentació'],
    ['es', '/es', 'Documentación'],
  ] as const) {
    it(`keeps ${lang} section links on the current page and scrolls to their targets`, async () => {
      await TestBed.inject(I18nService).setLang(lang, { persist: false })
      const harness = await RouterTestingHarness.create()
      await harness.navigateByUrl(path, LandingpageComponent)
      harness.detectChanges()
      await harness.fixture.whenStable()
      const page = harness.routeNativeElement!
      const scroll = spyOn(HTMLElement.prototype, 'scrollIntoView')

      for (const id of ['features', 'pricing', 'try-it', 'main-content']) {
        const link = page.querySelector<HTMLAnchorElement>(`a[href="${path}#${id}"]`)!
        expect(link).toBeTruthy()
        scroll.calls.reset()
        link.click()
        await harness.fixture.whenStable()
        harness.detectChanges()
        await harness.fixture.whenStable()
        expect(TestBed.inject(Router).url).toBe(`${path}#${id}`)
        expect(scroll).toHaveBeenCalledWith({ block: 'start' })
        expect(scroll.calls.mostRecent().object as HTMLElement).toBe(page.querySelector<HTMLElement>(`#${id}`)!)
      }

      for (const link of Array.from(page.querySelectorAll('a[href="/docs/features"]'))) {
        expect(link.textContent?.trim()).toContain(docs)
      }
    })
  }

  it('preserves the selected section when changing language', async () => {
    await TestBed.inject(I18nService).setLang('ca', { persist: false })
    const harness = await RouterTestingHarness.create()
    const component = await harness.navigateByUrl('/ca#pricing', LandingpageComponent)
    component.changeLanguage('es')
    await harness.fixture.whenStable()
    expect(TestBed.inject(Router).url).toBe('/es#pricing')
  })
})
