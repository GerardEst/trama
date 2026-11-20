import { Component, Input, computed, inject } from '@angular/core'
import { DatabaseService } from 'src/app/core/services/database.service'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { AccountLinksComponent } from 'src/app/shared/components/account-links/account-links.component'
import { tetherPopover } from 'src/app/shared/utils/popover-tether'

let nextId = 0

/**
 * The person behind the stories: their name and the way to their settings and the guide.
 * Logging out lives in the account settings.
 * A native popover, so it closes on Escape and outside clicks without listeners of its own.
 */
@Component({
  selector: 'polo-user-menu',
  standalone: true,
  imports: [TranslatePipe, AccountLinksComponent],
  templateUrl: './user-menu.component.html',
  styleUrl: './user-menu.component.css',
  host: { '[class.compact]': 'compact' },
})
export class UserMenuComponent {
  private readonly db = inject(DatabaseService)
  /** Only the avatar, as on phones: for the corner of the board, beside its toolbar. */
  @Input() compact = false

  readonly menuId = `polo-user-menu-${nextId++}`
  readonly email = computed(() => this.db.user()?.email ?? '')
  readonly name = computed(() => this.db.user()?.profile?.user_name || this.email())
  readonly initial = computed(() => this.name().trim().charAt(0).toUpperCase() || 'T')

  readonly tether = tetherPopover
}
