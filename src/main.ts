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
import { ResetPasswordComponent } from './app/pages/reset-password/reset-password.component'
import { ChangePasswordComponent } from './app/pages/change-password/change-password.component'
import { authGuard } from './app/guards/auth.guard'
import * as Cronitor from '@cronitorio/cronitor-rum'

const appRoutes: Routes = [
  { path: '', title: 'Text&play', component: LandingpageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  {
    path: 'change-password',
    component: ChangePasswordComponent,
    canActivate: [authGuard],
  },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'stadistics/:id',
    title: 'Statistics',
    component: StadisticsComponent,
    canActivate: [authGuard],
  },
  { path: 'private/:storyId', component: PlaygroundComponent },
  // This must be the last item on the router
  { path: ':customId', component: PlaygroundComponent },
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
  trackMode: 'off', // <-- You can change this to 'off' to track events manually
})
