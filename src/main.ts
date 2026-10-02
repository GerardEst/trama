import { APP_INITIALIZER, inject } from '@angular/core'
import { bootstrapApplication } from '@angular/platform-browser'
import { provideRouter, TitleStrategy, withComponentInputBinding } from '@angular/router'
import { appRoutes } from './app/routes'
import { AppComponent } from './app/app.component'
import { provideAnimations } from '@angular/platform-browser/animations'
import { I18nService } from './app/core/i18n/i18n.service'
import { I18nTitleStrategy } from './app/core/i18n/i18n-title.strategy'

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(appRoutes, withComponentInputBinding()),
    provideAnimations(),
    { provide: TitleStrategy, useClass: I18nTitleStrategy },
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        const i18n = inject(I18nService)
        return () => i18n.init()
      },
    },
  ],
})
