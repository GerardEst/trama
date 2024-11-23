import { Routes } from '@angular/router'
import { DashboardComponent } from './dashboard.component'
import { authGuard } from 'src/app/core/guards/auth.guard'

export const dashboardRoutes: Routes = [
  {
    path: 'dashboard',
    title: 'Dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
]
