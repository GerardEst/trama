import { Routes } from '@angular/router'

export const playgroundRoutes: Routes = [
  {
    path: 'private/:storyId',
    loadComponent: () =>
      import('./pages/playground/playground.component').then(
        (m) => m.PlaygroundComponent
      ),
  },
  {
    path: 'not-found',
    loadComponent: () =>
      import('./pages/story-not-found/story-not-found.component').then(
        (m) => m.StoryNotFoundComponent
      ),
  },

  // This must be the last item on the router
  {
    path: ':customId',
    loadComponent: () =>
      import('./pages/playground/playground.component').then(
        (m) => m.PlaygroundComponent
      ),
  },
]
