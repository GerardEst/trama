import { bootstrapApplication } from '@angular/platform-browser'
import {
  provideRouter,
  Routes,
  withComponentInputBinding,
} from '@angular/router'
import { AppComponent } from './app/app.component'
import { provideAnimations } from '@angular/platform-browser/animations'
import { LandingpageComponent } from './app/pages/landingpage/landingpage.component'
import { DashboardComponent } from './app/pages/dashboard/dashboard.component'
import { PlaygroundComponent } from './app/pages/playground/playground.component'
import { StadisticsComponent } from './app/pages/stadistics/stadistics.component'
import { LoginComponent } from './app/pages/login/login.component'
import { authGuard } from './app/guards/auth.guard'

const appRoutes: Routes = [
  { path: '', component: LandingpageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'playground/:id', component: PlaygroundComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'stadistics/:id',
    component: StadisticsComponent,
    canActivate: [authGuard],
  },
]

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(appRoutes, withComponentInputBinding()),
    provideAnimations(),
  ],
})
