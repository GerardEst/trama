import { inject, isDevMode } from '@angular/core'
import { Router, Routes } from '@angular/router'
import { loginRoutes } from './features/login/routes'
import { playgroundRoutes } from './features/playground/routes'
import { dashboardRoutes } from './features/dashboard/routes'
import { creatorRoutes } from './features/creator/routes'
import { settingsRoutes } from './features/settings/routes'
import { statisticsRoutes } from './features/statistics/routes'
import { storyRoutes } from './features/story/routes'

/**
 * The public pages (the landing and the docs) are the Astro site in site/,
 * served next to the app, so in-app links to them leave the app. The dev server only
 * serves the app, so there they open the author's dashboard instead.
 */
export const leaveForSite = () => {
  if (isDevMode()) return inject(Router).parseUrl('/dashboard')
  window.location.assign('/')
  return false
}

export const appRoutes: Routes = [
  { path: '', pathMatch: 'full', canActivate: [leaveForSite], children: [] },
  ...loginRoutes,
  ...creatorRoutes,
  ...settingsRoutes,
  ...dashboardRoutes,
  // After the editor, whose /story/:storyId/board this route would otherwise try first.
  ...storyRoutes,
  ...statisticsRoutes,

  // This must be the last item on the router
  ...playgroundRoutes,
]
