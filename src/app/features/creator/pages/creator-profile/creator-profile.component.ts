import { Component, computed, inject } from '@angular/core'
import { DatabaseService } from 'src/app/core/services/database.service'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { environment } from 'src/environments/environment'

/**
 * How readers see the author, apart from the account (email, password, billing).
 * Design only for now: nothing here is saved yet, so the form stays disabled.
 */
@Component({
  selector: 'polo-creator-public-profile',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './creator-profile.component.html',
  styleUrls: ['../../../../shared/layout/page.css', './creator-profile.component.css'],
})
export class CreatorProfileComponent {
  private readonly db = inject(DatabaseService)
  readonly host = new URL(environment.baseRoute).host
  readonly name = computed(() => this.db.user()?.profile?.user_name ?? '')
  readonly initial = computed(() => this.name().trim().charAt(0).toUpperCase() || 'T')
}
