import { Routes } from '@angular/router'
import { authGuard } from 'src/app/core/guards/auth.guard'

export const dashboardRoutes: Routes = [
  {
    path: 'dashboard',
    title: 'Dashboard',
    loadComponent: () =>
      import('./dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [authGuard],
  },
]
