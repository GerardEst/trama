import { CanActivateFn, Router } from '@angular/router'
import { DatabaseService } from '../services/database.service'
import { inject } from '@angular/core'
import { AuthService } from '../services/auth.service'

export const authGuard: CanActivateFn = async (route, state) => {
  const db = inject(DatabaseService)
  const router = inject(Router)
  const authService = inject(AuthService)

  const user = await db.getUser()

  if (!user) {
    authService.logoutUser()

    router.navigate(['/login'])
    return false
  }

  return !!user
}
