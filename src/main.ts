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
import { StoryNotFoundComponent } from './app/pages/story-not-found/story-not-found.component'

const appRoutes: Routes = [
  { path: '', title: 'Text&play', component: LandingpageComponent },
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
    path: 'stadistics/:storyId',
    title: 'Statistics',
    component: StadisticsComponent,
    canActivate: [authGuard],
  },
  { path: 'private/:storyId', component: PlaygroundComponent },
  { path: 'not-found', component: StoryNotFoundComponent },
  // This must be the last item on the router
  { path: ':customId', component: PlaygroundComponent },
]

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(appRoutes, withComponentInputBinding()),
    provideAnimations(),
  ],
})
