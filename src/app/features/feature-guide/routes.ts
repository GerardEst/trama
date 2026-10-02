import { Routes } from '@angular/router'

export const featureGuideRoutes: Routes = [
  {
    // Keep single-segment public story links (including /docs) available.
    path: 'docs/features',
    title: 'guide.meta.title',
    loadComponent: () =>
      import('./feature-guide.component').then((m) => m.FeatureGuideComponent),
  },
]
