import { authGuard } from 'src/app/core/guards/auth.guard'
import { Routes } from '@angular/router'
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component'
import { ChangePasswordComponent } from './pages/change-password/change-password.component'
import { LoginComponent } from './pages/login/login.component'

export const loginRoutes: Routes = [
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
  },
  {
    path: 'change-password',
    component: ChangePasswordComponent,
    canActivate: [authGuard],
  },
  { path: 'login', component: LoginComponent },
]
