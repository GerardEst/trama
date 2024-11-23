import { Routes } from '@angular/router'
import { authGuard } from './core/guards/auth.guard'
import { loginRoutes } from './features/login/routes'
import { playgroundRoutes } from './features/playground/routes'
import { dashboardRoutes } from './features/dashboard/routes'
import { landingRoutes } from './features/landing-page/routes'
import { statisticsRoutes } from './features/statistics/routes'

export const appRoutes: Routes = [
  ...landingRoutes,
  ...loginRoutes,
  ...dashboardRoutes,
  ...statisticsRoutes,

  // This must be the last item on the router
  ...playgroundRoutes,
]
