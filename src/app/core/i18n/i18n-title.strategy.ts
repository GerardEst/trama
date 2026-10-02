import { effect, Injectable, signal } from '@angular/core'
import { Title } from '@angular/platform-browser'
import { RouterStateSnapshot, TitleStrategy } from '@angular/router'
import { I18nService } from './i18n.service'

// Route titles may be translation keys; they follow the active language.
@Injectable()
export class I18nTitleStrategy extends TitleStrategy {
  private readonly routeTitle = signal<string | undefined>(undefined)

  constructor(
    private readonly title: Title,
    private readonly i18n: I18nService
  ) {
    super()
    effect(() => {
      const routeTitle = this.routeTitle()
      if (routeTitle === undefined) return
      this.title.setTitle(
        this.i18n.has(routeTitle) ? this.i18n.t(routeTitle) : routeTitle
      )
    })
  }

  override updateTitle(snapshot: RouterStateSnapshot) {
    this.routeTitle.set(this.buildTitle(snapshot))
  }
}
