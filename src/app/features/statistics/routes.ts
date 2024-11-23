import { Routes } from '@angular/router'
import { StatisticsComponent } from './statistics.component'
import { authGuard } from 'src/app/core/guards/auth.guard'

export const statisticsRoutes: Routes = [
  {
    path: 'stadistics/:storyId',
    title: 'Statistics',
    component: StatisticsComponent,
    canActivate: [authGuard],
  },
]
