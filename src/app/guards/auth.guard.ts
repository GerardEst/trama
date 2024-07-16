import { CanActivateFn, Router } from '@angular/router'
import { DatabaseService } from '../services/database.service'
import { inject } from '@angular/core'

export const authGuard: CanActivateFn = async (route, state) => {
  const db = inject(DatabaseService)
  const router = inject(Router)

  const user = await db.getUser()

  if (!user) {
    router.navigate(['/login'])
    return false
  }

  return !!user
}
