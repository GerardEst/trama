import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { LandingFeaturesComponent } from './landing-features.component'
import { FEATURE_GUIDE } from 'src/app/features/feature-guide/feature-guide.content'

describe('LandingFeaturesComponent', () => {
  let fixture: ComponentFixture<LandingFeaturesComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingFeaturesComponent],
      providers: [provideRouter([])],
    }).compileComponents()

    fixture = TestBed.createComponent(LandingFeaturesComponent)
    fixture.detectChanges()
  })

  it('renders a card with a visual for every feature', () => {
    const cards = fixture.nativeElement.querySelectorAll('polo-landing-feature-card')

    expect(cards.length).toBe(fixture.componentInstance.features.length)
    cards.forEach((card: HTMLElement) => {
      expect(card.querySelector('h3')?.textContent?.trim()).toBeTruthy()
      expect(card.querySelector('polo-landing-feature-visual')).toBeTruthy()
    })
  })

  it('links to the full documentation below the feature cards', () => {
    const host = fixture.nativeElement as HTMLElement
    const link = host.querySelector<HTMLAnchorElement>('.features__footer a')!
    const grid = host.querySelector('.features__grid')!

    expect(link.getAttribute('href')).toBe('/docs/features')
    expect(link.textContent?.trim()).toBeTruthy()
    expect(grid.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(link.querySelector('span')?.getAttribute('aria-hidden')).toBe('true')
  })

  it('links every card to an existing chapter of the feature guide', () => {
    const guideIds = FEATURE_GUIDE.flatMap((group) => group.features.map((feature) => feature.id))
    const links = Array.from(
      fixture.nativeElement.querySelectorAll('.card__link') as NodeListOf<HTMLAnchorElement>
    )

    expect(links.length).toBe(fixture.componentInstance.features.length)
    links.forEach((link) => {
      const url = new URL(link.href)
      expect(url.pathname).toBe('/docs/features')
      expect(guideIds).toContain(url.hash.slice(1))
    })
  })
})
