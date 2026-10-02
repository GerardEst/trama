import { inject, Pipe, PipeTransform } from '@angular/core'
import { I18nService } from './i18n.service'
import { TranslationKey, TranslationParams } from './i18n.types'

// Impure so open views update as soon as the language changes.
@Pipe({ name: 't', standalone: true, pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly i18n = inject(I18nService)

  transform(key: TranslationKey, params?: TranslationParams): string {
    return this.i18n.t(key, params)
  }
}
