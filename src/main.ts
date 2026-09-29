import { bootstrapApplication } from '@angular/platform-browser'
import { provideRouter, withComponentInputBinding } from '@angular/router'
import { appRoutes } from './app/routes'
import { AppComponent } from './app/app.component'
import { provideAnimations } from '@angular/platform-browser/animations'

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(appRoutes, withComponentInputBinding()),
    provideAnimations(),
  ],
})
