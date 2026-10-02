import { Component, EventEmitter, inject, Output } from '@angular/core'
import { I18nService } from 'src/app/core/i18n/i18n.service'
import { Lang } from 'src/app/core/i18n/i18n.types'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'

// Language names stay in their own language so everybody can find theirs.
const OPTIONS: readonly { lang: Lang; code: string; name: string }[] = [
  { lang: 'en', code: 'EN', name: 'English' },
  { lang: 'es', code: 'ES', name: 'Español' },
  { lang: 'ca', code: 'CA', name: 'Català' },
]

@Component({
  selector: 'polo-language-selector',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './language-selector.component.html',
  styleUrl: './language-selector.component.sass',
})
export class LanguageSelectorComponent {
  readonly i18n = inject(I18nService)
  readonly options = OPTIONS

  @Output() langChange = new EventEmitter<Lang>()

  async select(lang: Lang) {
    if (lang === this.i18n.lang()) return
    await this.i18n.setLang(lang)
    this.langChange.emit(lang)
  }
}
