import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { Meta, Title } from '@angular/platform-browser'
import { FeatureGuideComponent } from './feature-guide.component'
import { FEATURE_GUIDE } from './feature-guide.content'

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

  it('documents all eleven features with unique, linkable chapters and practical instructions', () => {
    const page = fixture.nativeElement as HTMLElement
    const features = FEATURE_GUIDE.flatMap((group) => group.features)
    expect(features.length).toBe(11)
    expect(new Set(features.map((feature) => feature.id)).size).toBe(11)
    expect(page.querySelectorAll('.guide-chapter').length).toBe(11)
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
    expect(TestBed.inject(Title).getTitle()).toBe('Feature guide — Trama')
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
