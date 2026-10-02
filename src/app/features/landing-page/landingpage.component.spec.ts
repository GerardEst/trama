import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { By } from '@angular/platform-browser'
import { LandingpageComponent } from './landingpage.component'
import { DatabaseService } from 'src/app/core/services/database.service'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { LandingStoryDemoComponent } from './components/landing-story-demo/landing-story-demo.component'

describe('LandingpageComponent', () => {
  let component: LandingpageComponent
  let fixture: ComponentFixture<LandingpageComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingpageComponent],
      providers: [
        provideRouter([]),
        {
          provide: DatabaseService,
          useValue: {
            getUser: () => Promise.resolve(null),
            user: () => undefined,
          },
        },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(LandingpageComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()
  })

  it('keeps the playable story and takes authors to registration', () => {
    const hero = fixture.nativeElement.querySelector('.hero') as HTMLElement
    const primaryAction = hero.querySelector('a.button--primary') as HTMLAnchorElement
    const storyAction = hero.querySelector('a.text-link') as HTMLAnchorElement

    expect(hero.querySelectorAll('h1').length).toBe(1)
    expect(hero.querySelector('h1')?.textContent).toContain('You write the story.')
    expect(hero.querySelector('.hero__description')?.textContent).toContain('interactive story')
    expect(hero.querySelector('.hero__reassurance')?.textContent).toContain('No credit card')
    expect(hero.querySelectorAll('.hero__reassurance span').length).toBe(3)
    expect(primaryAction.getAttribute('href')).toBe('/login?mode=register')
    expect(storyAction.getAttribute('href')).toBe('#try-it')
    expect(hero.querySelector('#try-it polo-game')).toBeTruthy()
    const demoImage = hero.querySelector('.story-player__scene img') as HTMLImageElement
    expect(demoImage.getAttribute('src')).toBe('/assets/images/landing/modest-hero.webp')
    expect(demoImage.getAttribute('width')).toBe('1368')
    expect(demoImage.getAttribute('height')).toBe('768')
    const demo = fixture.debugElement.query(By.directive(LandingStoryDemoComponent))
    expect(demo.injector.get(ActiveStoryService).entireTree().nodes[0].text).toContain(
      'The library closes at midnight'
    )
    expect(TestBed.inject(ActiveStoryService).entireTree().nodes).toEqual([])
  })

  it('goes straight from the demo to pricing without a board or dead navigation links', () => {
    const main = fixture.nativeElement.querySelector('main') as HTMLElement
    const sections = Array.from(main.querySelectorAll(':scope > section'))

    expect(sections.map((section) => section.id)).toEqual(['', 'pricing', ''])
    expect(main.querySelector('polo-board, #features, #toolkit, .hero__foot')).toBeNull()
    expect(main.textContent).not.toContain('Here’s how')
    expect(fixture.nativeElement.querySelector('a[href="#features"]')).toBeNull()
    expect(fixture.nativeElement.querySelector('.nav-links a[href="/docs/features"]')?.textContent).toBe('Docs')
    expect(fixture.nativeElement.querySelector('.footer a[href="/docs/features"]')).toBeTruthy()
  })

  it('offers creation as soon as the playable demo ends', () => {
    const demo = fixture.nativeElement.querySelector('#try-it') as HTMLElement
    expect(demo.querySelector('.story-player__next')).toBeNull()

    const firstAnswer = demo.querySelector('polo-game-answer button') as HTMLButtonElement
    firstAnswer.click()
    fixture.detectChanges()
    const nextAnswer = demo.querySelector('polo-game-answer button') as HTMLButtonElement
    nextAnswer.click()
    fixture.detectChanges()

    const next = demo.querySelector('.story-player__next a') as HTMLAnchorElement
    expect(next.getAttribute('href')).toBe('/login?mode=register')
    expect(next.textContent).toContain('Create your first story free')
  })

  it('only offers to start over once a choice has been made', () => {
    const demo = fixture.nativeElement.querySelector('#try-it') as HTMLElement
    expect(demo.querySelector('.story-player__footer button')).toBeNull()

    const firstAnswer = demo.querySelector('polo-game-answer button') as HTMLButtonElement
    firstAnswer.click()
    fixture.detectChanges()

    expect(demo.querySelector('.story-player__footer button')?.textContent).toContain('Start over')
  })

  it('shows the ending call to action before the player footer', () => {
    const demo = fixture.nativeElement.querySelector('#try-it') as HTMLElement
    const firstAnswer = demo.querySelector('polo-game-answer button') as HTMLButtonElement
    firstAnswer.click()
    fixture.detectChanges()
    const nextAnswer = demo.querySelector('polo-game-answer button') as HTMLButtonElement
    nextAnswer.click()
    fixture.detectChanges()

    const next = demo.querySelector('.story-player__next') as HTMLElement
    const footer = demo.querySelector('.story-player__footer') as HTMLElement
    expect(next.nextElementSibling).toBe(footer)
    expect(footer.textContent).not.toContain('No sign-up')
  })

  it('restarts the playable story without leaving the landing page', async () => {
    const demo = fixture.nativeElement.querySelector('#try-it') as HTMLElement
    const firstAnswer = demo.querySelector('polo-game-answer button') as HTMLButtonElement
    firstAnswer.click()
    fixture.detectChanges()
    expect(demo.textContent).toContain('As you write')

    const restart = demo.querySelector('.story-player__footer button') as HTMLButtonElement
    restart.click()
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()

    expect(demo.textContent).toContain('The library closes at midnight')
    expect(demo.textContent).not.toContain('As you write')
    expect(demo.querySelector('.story-player__next')).toBeNull()
  })

  it('keeps only available subscriptions in the boxed comparison', () => {
    expect(fixture.nativeElement.querySelectorAll('.pricing__plan').length).toBe(2)
    expect(fixture.nativeElement.querySelector('.pricing__coming-soon')).toBeNull()
    expect(fixture.nativeElement.querySelectorAll('.pricing__details:not([open])').length).toBe(2)
  })

  it('presents a separate professional export license with a fixed one-time price and an enquiry link', () => {
    const license = fixture.nativeElement.querySelector('.export-license') as HTMLElement
    const price = license.querySelector('.export-license__price') as HTMLElement
    const enquiry = license.querySelector('a') as HTMLAnchorElement

    expect(license.getAttribute('aria-labelledby')).toBe('export-license-title')
    expect(license.querySelector('h3')?.textContent).toContain('Export License')
    expect(license.textContent).toContain('FOR PROFESSIONALS')
    expect(price.textContent).toBe('299€')
    expect(license.querySelector('.export-license__frequency')?.textContent).toContain('One payment.')
    expect(license.querySelector('.export-license__frequency')?.textContent).toContain('No subscription.')
    expect(license.textContent).toContain('No royalties.')
    expect(license.textContent).toContain('No Trama-hosted games, share links or player analytics.')
    expect(license.textContent).toContain('Not available to buy yet.')
    expect(enquiry.getAttribute('href')).toBe('mailto:gesteve.12@gmail.com?subject=Export%20License%20enquiry')
    expect(enquiry.textContent).toContain('Ask about the license')
    expect(license.classList).not.toContain('pricing__plan')
    expect(license.closest('polo-pricing')).toBeNull()

    component.payAnnually = true
    fixture.detectChanges()
    expect(price.textContent).toBe('299€')
  })

  it('routes returning authors to their dashboard', () => {
    component.loggedUserEmail = 'author@example.com'
    fixture.detectChanges()
    expect(component.creationUrl).toBe('/dashboard')
    expect(fixture.nativeElement.querySelector('.hero .button--primary').getAttribute('href')).toBe('/dashboard')
  })
})
