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
import * as Cronitor from '@cronitorio/cronitor-rum'

const appRoutes: Routes = [
  { path: '', title: 'Textandplay', component: LandingpageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'playground/:storyId', component: PlaygroundComponent },
  {
    path: 'dashboard',
    title: 'Dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'stadistics/:id',
    title: 'Stadistics',
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

// Load the Cronitor tracker once in your app
Cronitor.load('1f9fd1f09a4375fd53191b6a385e06f9', {
  debug: false, // <-- You can enable this to see logs in the console
  trackMode: 'history', // <-- You can change this to 'off' to track events manually
})
