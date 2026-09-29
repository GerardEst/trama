import { Routes } from '@angular/router'
import { authGuard } from 'src/app/core/guards/auth.guard'

export const statisticsRoutes: Routes = [
  {
    path: 'stadistics/:storyId',
    title: 'Statistics',
    loadComponent: () =>
      import('./statistics.component').then((m) => m.StatisticsComponent),
    canActivate: [authGuard],
  },
]
