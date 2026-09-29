import { appRoutes } from './routes'
import { authGuard } from './core/guards/auth.guard'
import { DashboardComponent } from './features/dashboard/dashboard.component'
import { PlaygroundComponent } from './features/playground/pages/playground/playground.component'

describe('appRoutes', () => {
  it('loads each page on demand while preserving route order and auth guards', async () => {
    expect(appRoutes.map((route) => route.path)).toEqual([
      '', 'reset-password', 'change-password', 'login', 'dashboard',
      'stadistics/:storyId', 'private/:storyId', 'not-found', ':customId',
    ])
    expect(appRoutes.every((route) => !!route.loadComponent && !route.component)).toBeTrue()
    expect(appRoutes.find((route) => route.path === 'dashboard')?.canActivate).toEqual([authGuard])
    expect(appRoutes.find((route) => route.path === 'change-password')?.canActivate).toEqual([authGuard])
    expect(appRoutes.find((route) => route.path === 'stadistics/:storyId')?.canActivate).toEqual([authGuard])

    const dashboard = appRoutes.find((route) => route.path === 'dashboard')!
    const privateStory = appRoutes.find((route) => route.path === 'private/:storyId')!
    const publicStory = appRoutes.find((route) => route.path === ':customId')!
    expect(await dashboard.loadComponent!()).toBe(DashboardComponent)
    expect(await privateStory.loadComponent!()).toBe(PlaygroundComponent)
    expect(await publicStory.loadComponent!()).toBe(PlaygroundComponent)
  })
})
