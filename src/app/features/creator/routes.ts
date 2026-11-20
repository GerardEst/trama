import { Routes } from '@angular/router'
import { authGuard } from 'src/app/core/guards/auth.guard'

// The author's workspace: everything about their stories that is not editing one.
// The person's own account and plan are in /settings.
export const creatorRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./creator-shell.component').then((m) => m.CreatorShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'dashboard.overview.title',
        loadComponent: () =>
          import('./pages/overview/overview.component').then((m) => m.OverviewComponent),
      },
      {
        path: 'access',
        title: 'dashboard.access.title',
        loadComponent: () =>
          import('./pages/access/access.component').then((m) => m.AccessComponent),
      },
      {
        path: 'profile',
        title: 'dashboard.creatorProfile.title',
        loadComponent: () =>
          import('./pages/creator-profile/creator-profile.component').then((m) => m.CreatorProfileComponent),
      },
    ],
  },
]
