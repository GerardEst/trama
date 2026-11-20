import { Component } from '@angular/core'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'

/**
 * Who can read which private story. Design only for now: the readers, groups and
 * per-person access are not stored anywhere yet.
 */
@Component({
  selector: 'polo-creator-access',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './access.component.html',
  styleUrls: ['../../../../shared/layout/page.css', './access.component.css'],
})
export class AccessComponent {
  readonly steps = [
    { title: 'dashboard.access.step1Title', text: 'dashboard.access.step1Text' },
    { title: 'dashboard.access.step2Title', text: 'dashboard.access.step2Text' },
    { title: 'dashboard.access.step3Title', text: 'dashboard.access.step3Text' },
  ] as const
}
