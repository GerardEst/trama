import { inject, isDevMode } from '@angular/core'
import { Router, Routes } from '@angular/router'
import { loginRoutes } from './features/login/routes'
import { playgroundRoutes } from './features/playground/routes'
import { dashboardRoutes } from './features/dashboard/routes'
import { statisticsRoutes } from './features/statistics/routes'
import { featureGuideRoutes } from './features/feature-guide/routes'

/**
 * The landing pages (/, /es and /ca) are the Astro site in site/, served next
 * to the app, so in-app links to them leave the app. The dev server only
 * serves the app, so there they open the dashboard instead.
 */
export const leaveForSite = () => {
  if (isDevMode()) return inject(Router).parseUrl('/dashboard')
  window.location.assign('/')
  return false
}

export const appRoutes: Routes = [
  { path: '', pathMatch: 'full', canActivate: [leaveForSite], children: [] },
  ...featureGuideRoutes,
  ...loginRoutes,
  ...dashboardRoutes,
  ...statisticsRoutes,

  // This must be the last item on the router
  ...playgroundRoutes,
]
