import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { Meta, Title } from '@angular/platform-browser'
import { FeatureGuideComponent } from './feature-guide.component'
import { FEATURE_GUIDE } from './feature-guide.content'
import { I18nService } from 'src/app/core/i18n/i18n.service'

describe('FeatureGuideComponent', () => {
  let fixture: ComponentFixture<FeatureGuideComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureGuideComponent],
      providers: [provideRouter([])],
    }).compileComponents()
    fixture = TestBed.createComponent(FeatureGuideComponent)
    fixture.detectChanges()
    await fixture.whenStable()
  })

  it('uses the shared landing theme and readable documentation typography', () => {
    const page = fixture.nativeElement as HTMLElement
    const style = getComputedStyle(page)
    const theme = getComputedStyle(document.documentElement)
    expect(style.backgroundColor).toBe(getComputedStyle(document.body).backgroundColor)
    expect(style.getPropertyValue('--polo-color-action')).toBe(theme.getPropertyValue('--polo-color-action'))
    expect(style.getPropertyValue('--polo-color-accent').trim()).toBe('#f6ce6a')
    expect(style.backgroundImage).toContain('linear-gradient')
    expect(getComputedStyle(page.querySelector('h1')!).fontFamily).toContain('Raleway')
    expect(page.querySelector('.guide-header polo-language-selector')).toBeNull()
    expect(page.querySelectorAll('polo-language-selector').length).toBe(1)
    expect(page.querySelector('.guide-footer polo-language-selector')).toBeTruthy()
  })

  it('uses documentation headings and configuration labels in every language', async () => {
    const i18n = TestBed.inject(I18nService)
    const page = fixture.nativeElement as HTMLElement
    try {
      for (const [lang, title, setup, notes] of [
        ['en', 'Docs', 'Setup', 'Notes and limitations'],
        ['ca', 'Documentació', 'Configuració', 'Notes i limitacions'],
        ['es', 'Documentación', 'Configuración', 'Notas y limitaciones'],
      ] as const) {
        await i18n.setLang(lang, { persist: false })
        fixture.detectChanges()
        await fixture.whenStable()
        expect(page.querySelector('h1')?.textContent?.trim()).toBe(title)
        expect(page.querySelector('.guide-chapter h3')?.textContent?.trim()).toBe(setup)
        expect(page.querySelector('.guide-note span')?.textContent?.trim()).toBe(notes)
        expect(page.querySelectorAll('.guide-chapter').length).toBe(12)
      }
    } finally {
      await i18n.setLang('en', { persist: false })
    }
  })

  it('places the index on a solid surface and separates the footer from the content', () => {
    const page = fixture.nativeElement as HTMLElement
    const sidebar = getComputedStyle(page.querySelector('.guide-sidebar')!)
    const content = getComputedStyle(page.querySelector('.guide-content')!)
    const footer = page.querySelector('.guide-footer')!

    expect(sidebar.backgroundColor).toBe(content.backgroundColor)
    expect(sidebar.borderTopWidth).toBe('1px')
    expect(parseFloat(getComputedStyle(footer).marginTop)).toBeGreaterThanOrEqual(40)
    expect(footer.querySelector('polo-language-selector')).toBeTruthy()
  })

  it('documents all twelve features with unique, linkable chapters and practical instructions', () => {
    const page = fixture.nativeElement as HTMLElement
    const features = FEATURE_GUIDE.flatMap((group) => group.features)
    expect(features.length).toBe(12)
    expect(new Set(features.map((feature) => feature.id)).size).toBe(12)
    expect(page.querySelectorAll('.guide-chapter').length).toBe(12)
    for (const feature of features) {
      const chapter = page.querySelector(`#${feature.id}`)
      expect(chapter?.querySelector('h2')?.textContent).toBe(feature.title)
      expect(chapter?.querySelectorAll('ol li').length).toBe(
        feature.steps.length
      )
      expect(chapter?.querySelector('figcaption')?.textContent).toBe(
        feature.example.label
      )
      expect(chapter?.querySelector('.guide-note p')?.textContent).toBe(
        feature.note
      )
      expect(
        page.querySelector(`.guide-sidebar a[href$="#${feature.id}"]`)
      ).toBeTruthy()
    }
  })

  it('explains current limitations instead of advertising unsupported behaviour', () => {
    const page = fixture.nativeElement as HTMLElement
    expect(page.querySelector('#content-nodes')?.textContent).toContain(
      'Answers need a connected destination'
    )
    expect(page.querySelector('#requirements')?.textContent).toContain(
      'filtered out'
    )
    expect(page.querySelector('#distributors')?.textContent).toContain(
      'first matching route wins'
    )
    expect(page.querySelector('#share-node')?.textContent).toContain(
      'External links require a paid subscription'
    )
    expect(page.querySelector('#organisation')?.textContent).toContain(
      'do not change the story’s logic'
    )
    expect(page.querySelector('#player-input')?.textContent).toContain(
      'fixed Continue button'
    )
    expect(page.querySelector('#variables')?.textContent).toContain(
      'variable picker handles those IDs'
    )
  })

  it('is a lightweight guide with metadata and routes back to creation, not an editor or a playable story', () => {
    const page = fixture.nativeElement as HTMLElement
    expect(TestBed.inject(Title).getTitle()).toBe('Docs — Trama')
    expect(
      TestBed.inject(Meta).getTag('name="description"')?.content
    ).toContain('Trama’s story-building tools')
    expect(page.querySelectorAll('h1').length).toBe(1)
    expect(
      page.querySelector('polo-board, polo-game, polo-rich-text-editor')
    ).toBeNull()
    expect(page.querySelector('.guide-next a')?.getAttribute('href')).toBe(
      '/login?mode=register'
    )
    expect(page.querySelector('.guide-intro a')?.getAttribute('href')).toBe('/')
  })
})
