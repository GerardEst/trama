import { Routes } from '@angular/router'
import { authGuard } from 'src/app/core/guards/auth.guard'

// One story outside the editor: its settings, sharing among them, and how it is played.
// The editor is /story/:storyId/board.
export const storyRoutes: Routes = [
  {
    path: 'story/:storyId',
    loadComponent: () =>
      import('./story-shell.component').then((m) => m.StoryShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'dashboard.story.generalTitle',
        loadComponent: () =>
          import('./pages/general/general.component').then((m) => m.StoryGeneralComponent),
      },
      // Sharing is a dialog now, and its settings live in General with the other settings.
      { path: 'sharing', redirectTo: '' },
      {
        path: 'statistics',
        title: 'dashboard.statistics.title',
        loadComponent: () =>
          import('./pages/statistics/statistics.component').then((m) => m.StoryStatisticsComponent),
      },
    ],
  },
]
