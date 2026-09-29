import { Routes } from '@angular/router'

export const landingRoutes: Routes = [
  {
    path: '',
    title: 'Trama',
    loadComponent: () =>
      import('./landingpage.component').then((m) => m.LandingpageComponent),
  },
]
