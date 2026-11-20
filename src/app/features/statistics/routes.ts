import { Routes } from '@angular/router'

// Statistics live with the rest of the story now; old links and bookmarks still arrive there.
export const statisticsRoutes: Routes = [
  { path: 'stadistics/:storyId', redirectTo: 'story/:storyId/statistics' },
]
