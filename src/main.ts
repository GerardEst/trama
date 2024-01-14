import { bootstrapApplication } from '@angular/platform-browser'
import {
  provideRouter,
  Routes,
  withComponentInputBinding,
} from '@angular/router'
import { AppComponent } from './app/app.component'
import { provideAnimations } from '@angular/platform-browser/animations'
import { DashboardComponent } from './app/pages/dashboard/dashboard.component'
import { PlaygroundComponent } from './app/pages/playground/playground.component'
import { StadisticsComponent } from './app/pages/stadistics/stadistics.component'

const appRoutes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'playground/:id', component: PlaygroundComponent },
  { path: 'stadistics/:id', component: StadisticsComponent },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
]

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(appRoutes, withComponentInputBinding()),
    provideAnimations(),
  ],
})
