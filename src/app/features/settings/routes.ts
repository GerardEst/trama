import { Routes } from '@angular/router'
import { authGuard } from 'src/app/core/guards/auth.guard'

// The person's own settings, reached from the avatar menu wherever they are.
export const settingsRoutes: Routes = [
  {
    path: 'settings',
    loadComponent: () =>
      import('./settings-shell.component').then((m) => m.SettingsShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'account' },
      {
        path: 'account',
        title: 'settings.account.title',
        loadComponent: () =>
          import('./pages/account/account.component').then((m) => m.AccountComponent),
      },
      {
        path: 'preferences',
        title: 'settings.preferences.title',
        loadComponent: () =>
          import('./pages/preferences/preferences.component').then((m) => m.PreferencesComponent),
      },
      {
        path: 'billing',
        title: 'settings.billing.title',
        loadComponent: () =>
          import('./pages/billing/billing.component').then((m) => m.BillingComponent),
      },
    ],
  },
]
