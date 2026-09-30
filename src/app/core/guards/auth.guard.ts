import { CanActivateFn, Router } from '@angular/router'
import { DatabaseService } from '../services/database.service'
import { inject } from '@angular/core'

export const authGuard: CanActivateFn = async (route, state) => {
  const db = inject(DatabaseService)
  const router = inject(Router)
  const user = await db.getUser()

  if (!user) {
    // A failed user check can be a temporary network error. Deny navigation
    // without revoking a recoverable session or clearing unsaved editor state.
    router.navigate(['/login'])
    return false
  }

  return !!user
}
