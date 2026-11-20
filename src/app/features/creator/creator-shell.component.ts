import { Component, computed, inject } from '@angular/core'
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { I18nService } from 'src/app/core/i18n/i18n.service'
import { siteUrl } from 'src/app/core/site-links'
import { UserMenuComponent } from 'src/app/shared/components/user-menu/user-menu.component'
import { WordmarkComponent } from 'src/app/shared/components/wordmark/wordmark.component'

/** The author's workspace: their stories, readers and public profile. The person's own settings live in /settings. */
@Component({
  selector: 'polo-creator-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe, UserMenuComponent, WordmarkComponent],
  templateUrl: './creator-shell.component.html',
  styleUrl: '../../shared/layout/shell.css',
})
export class CreatorShellComponent {
  private readonly i18n = inject(I18nService)
  readonly homeUrl = computed(() => siteUrl(this.i18n.lang()))
}
