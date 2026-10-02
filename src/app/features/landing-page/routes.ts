import { Routes } from '@angular/router'

const loadLanding = () =>
  import('./landingpage.component').then((m) => m.LandingpageComponent)

export const landingRoutes: Routes = [
  {
    path: '',
    title: 'landing.meta.title',
    loadComponent: loadLanding,
  },
  // Localised landing pages, so each language has its own indexable URL.
  { path: 'es', title: 'landing.meta.title', data: { lang: 'es' }, loadComponent: loadLanding },
  { path: 'ca', title: 'landing.meta.title', data: { lang: 'ca' }, loadComponent: loadLanding },
]
