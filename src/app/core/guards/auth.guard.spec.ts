import { TestBed } from '@angular/core/testing'
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router'
import { AuthService } from '../services/auth.service'
import { DatabaseService } from '../services/database.service'
import { appUser } from '../interfaces/interfaces'
import { authGuard } from './auth.guard'

describe('authGuard session preservation', () => {
  let database: jasmine.SpyObj<DatabaseService>
  let auth: jasmine.SpyObj<AuthService>
  let router: jasmine.SpyObj<Router>

  beforeEach(() => {
    database = jasmine.createSpyObj<DatabaseService>('DatabaseService', ['getUser'])
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['logoutUser'])
    router = jasmine.createSpyObj<Router>('Router', ['navigate'])
    router.navigate.and.resolveTo(true)
    TestBed.configureTestingModule({ providers: [
      { provide: DatabaseService, useValue: database },
      { provide: AuthService, useValue: auth },
      { provide: Router, useValue: router },
    ] })
  })

  const checkAccess = () => TestBed.runInInjectionContext(() =>
    authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
  )

  it('denies access on a failed user check without signing out or clearing the editor', async () => {
    database.getUser.and.resolveTo(false)
    expect(await checkAccess()).toBeFalse()
    expect(router.navigate).toHaveBeenCalledWith(['/login'])
    expect(auth.logoutUser).not.toHaveBeenCalled()
  })

  it('allows a verified user without navigating or revoking the session', async () => {
    database.getUser.and.resolveTo({ id: 'author-1' } as appUser)
    expect(await checkAccess()).toBeTrue()
    expect(router.navigate).not.toHaveBeenCalled()
    expect(auth.logoutUser).not.toHaveBeenCalled()
  })
})
