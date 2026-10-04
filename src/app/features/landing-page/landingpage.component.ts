import {
  AfterViewInit,
  afterNextRender,
  Component,
  effect,
  ElementRef,
  inject,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core'
import { DOCUMENT } from '@angular/common'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { DatabaseService } from 'src/app/core/services/database.service'
import { Meta } from '@angular/platform-browser'
import { I18nService } from 'src/app/core/i18n/i18n.service'
import { isLang, Lang, LANGS } from 'src/app/core/i18n/i18n.types'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { LanguageSelectorComponent } from 'src/app/shared/components/ui/language-selector/language-selector.component'
import { LandingStoryDemoComponent } from './components/landing-story-demo/landing-story-demo.component'
import { LandingFeaturesComponent } from './components/landing-features/landing-features.component'
import { PricingComponent } from 'src/app/shared/components/pricing/pricing.component'
import { BillingCycleComponent } from 'src/app/shared/components/billing-cycle/billing-cycle.component'

@Component({
  selector: 'polo-landingpage',
  standalone: true,
  imports: [
    LandingStoryDemoComponent,
    LandingFeaturesComponent,
    PricingComponent,
    BillingCycleComponent,
    LanguageSelectorComponent,
    TranslatePipe,
    RouterLink,
  ],
  templateUrl: './landingpage.component.html',
  styleUrls: [
    './landingpage.component.css',
    './landingpage-conversion.css',
  ],
})
export class LandingpageComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('closingSection') closingSection?: ElementRef<HTMLElement>

  // Set by the /es and /ca routes. The plain landing URL is the English page.
  @Input() lang?: Lang

  loggedUserEmail?: string
  loggedUserPlan?: string
  payAnnually = false

  private readonly i18n = inject(I18nService)
  private readonly router = inject(Router)
  private readonly document = inject(DOCUMENT)
  private readonly route = inject(ActivatedRoute)
  private readonly injector = inject(Injector)
  private alternateLinks: HTMLLinkElement[] = []

  get creationUrl() {
    return this.loggedUserEmail ? '/dashboard' : '/login?mode=register'
  }

  get homeUrl() {
    return landingUrl(this.i18n.lang())
  }

  get licenseEnquiryUrl() {
    const subject = encodeURIComponent(this.i18n.t('landing.pricing.license.subject'))
    return `mailto:gesteve.12@gmail.com?subject=${subject}`
  }

  constructor(
    private meta: Meta,
    public db: DatabaseService
  ) {
    // Scope anchor scrolling to the landing so editor navigation is unaffected.
    this.route.fragment.pipe(takeUntilDestroyed()).subscribe((fragment) => {
      if (!fragment || !['main-content', 'features', 'pricing', 'try-it'].includes(fragment)) return
      afterNextRender(() => {
        this.document.getElementById(fragment)?.scrollIntoView({ block: 'start' })
      }, { injector: this.injector })
    })

    // The route title follows the language too (see I18nTitleStrategy).
    effect(() => {
      this.meta.updateTag({ name: 'description', content: this.i18n.t('landing.meta.description') })
    })
  }

  async ngOnInit() {
    this.checkLoggedUser()
    this.addAlternateLinks()

    const routeLang = isLang(this.lang) ? this.lang : 'en'
    // Visitors who prefer another language land on its own URL.
    if (routeLang === 'en' && this.i18n.lang() !== 'en') {
      this.router.navigate([landingUrl(this.i18n.lang())], { replaceUrl: true, preserveFragment: true })
    } else if (routeLang !== this.i18n.lang()) {
      await this.i18n.setLang(routeLang, { persist: false })
    }
  }

  changeLanguage(lang: Lang) {
    this.router.navigate([landingUrl(lang)], { preserveFragment: true })
  }

  private closingObserver?: IntersectionObserver

  ngAfterViewInit() {
    this.revealClosingOnScroll()
  }

  ngOnDestroy() {
    this.closingObserver?.disconnect()
    this.alternateLinks.forEach((link) => link.remove())
  }

  // Tells search engines about the other translations of the landing page.
  private addAlternateLinks() {
    const origin = 'https://trama.app'
    const alternates = [...LANGS, 'x-default'].map((hreflang) => {
      const link = this.document.createElement('link')
      link.rel = 'alternate'
      link.hreflang = hreflang
      link.href = origin + landingUrl(isLang(hreflang) ? hreflang : 'en')
      return link
    })
    this.alternateLinks = alternates
    this.document.head.append(...alternates)
  }

  // The section only starts hidden once we know it can be revealed, so it never stays invisible.
  revealClosingOnScroll() {
    const section = this.closingSection?.nativeElement
    if (!section || typeof IntersectionObserver === 'undefined') return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    section.classList.add('closing-section--pending')
    this.closingObserver = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        section.classList.replace('closing-section--pending', 'closing-section--revealed')
        this.closingObserver?.disconnect()
      },
      { threshold: 0.35 }
    )
    this.closingObserver.observe(section)
  }

  async checkLoggedUser() {
    const loggedUser = await this.db.getUser()
    if (!loggedUser) return

    this.loggedUserEmail = loggedUser.email
    this.loggedUserPlan =
      (loggedUser.profile.subscription_status === 'active' &&
        loggedUser.profile.plan) ||
      'free'
  }
}

function landingUrl(lang: Lang) {
  return lang === 'en' ? '/' : `/${lang}`
}
