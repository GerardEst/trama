import { Component, computed, inject, output } from '@angular/core'
import { Router, RouterLink } from '@angular/router'
import { AuthService } from 'src/app/core/services/auth.service'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { I18nService } from 'src/app/core/i18n/i18n.service'
import { SITE_PAGES, siteUrl } from 'src/app/core/site-links'

/**
 * The person's account, which also leads to their plan, the guide and signing out, as items of
 * whichever menu holds them.
 */
@Component({
  selector: 'polo-account-links',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './account-links.component.html',
  styleUrl: './account-links.component.css',
})
export class AccountLinksComponent {
  private readonly i18n = inject(I18nService)
  readonly docsUrl = computed(() => siteUrl(this.i18n.lang(), SITE_PAGES.features))
  /** A link was picked, so the menu around it can close. */
  readonly picked = output<void>()
  private readonly auth = inject(AuthService)
  private readonly router = inject(Router)

  logout() {
    this.picked.emit()
    this.auth.logoutUser()
    this.router.navigate(['/login'])
  }
}
