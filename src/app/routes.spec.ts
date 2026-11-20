import { UrlSegment } from '@angular/router'
import { appRoutes, leaveForSite } from './routes'
import { boardMatcher } from './features/dashboard/routes'
import { authGuard } from './core/guards/auth.guard'
import { DashboardComponent } from './features/dashboard/dashboard.component'
import { CreatorShellComponent } from './features/creator/creator-shell.component'
import { SettingsShellComponent } from './features/settings/settings-shell.component'
import { StoryShellComponent } from './features/story/story-shell.component'
import { PlaygroundComponent } from './features/playground/pages/playground/playground.component'

describe('appRoutes', () => {
  it('loads each page on demand while preserving route order and auth guards', async () => {
    expect(appRoutes.map((route) => route.path)).toEqual([
      '',
      'reset-password',
      'change-password',
      'login',
      'dashboard',
      'settings',
      undefined,
      'story/:storyId',
      'stadistics/:storyId',
      'private/:storyId',
      'not-found',
      ':customId',
    ])
    // The landing and the docs are the Astro site (site/); '' only leaves the app.
    expect(appRoutes[0].canActivate).toEqual([leaveForSite])
    // Every page loads lazily; the old statistics address only redirects into the story.
    expect(
      appRoutes.slice(1).every((route) => (!!route.loadComponent || !!route.redirectTo) && !route.component)
    ).toBeTrue()
    expect(
      appRoutes.find((route) => route.path === 'dashboard')?.canActivate
    ).toEqual([authGuard])
    expect(
      appRoutes.find((route) => route.path === 'settings')?.canActivate
    ).toEqual([authGuard])
    expect(
      appRoutes.find((route) => route.matcher === boardMatcher)?.canActivate
    ).toEqual([authGuard])
    expect(
      appRoutes.find((route) => route.path === 'change-password')?.canActivate
    ).toEqual([authGuard])
    expect(
      appRoutes.find((route) => route.path === 'stadistics/:storyId')?.redirectTo
    ).toBe('story/:storyId/statistics')
    expect(
      appRoutes.find((route) => route.path === 'story/:storyId')?.children?.map((route) => route.path)
    ).toEqual(['', 'sharing', 'statistics'])

    const dashboard = appRoutes.find((route) => route.path === 'dashboard')!
    const settings = appRoutes.find((route) => route.path === 'settings')!
    const board = appRoutes.find((route) => route.matcher === boardMatcher)!
    const privateStory = appRoutes.find(
      (route) => route.path === 'private/:storyId'
    )!
    const publicStory = appRoutes.find((route) => route.path === ':customId')!
    expect(await dashboard.loadComponent!()).toBe(CreatorShellComponent)
    expect(dashboard.children?.map((route) => route.path)).toEqual(['', 'access', 'profile'])
    expect(dashboard.children?.every((route) => !!route.loadComponent)).toBeTrue()
    // The person's settings are their own area, apart from the workspace.
    expect(await settings.loadComponent!()).toBe(SettingsShellComponent)
    expect(settings.children?.map((route) => route.path)).toEqual(['', 'account', 'preferences', 'billing'])
    expect(settings.children?.[0].redirectTo).toBe('account')
    // A story outside the editor: its options, its sharing and its statistics.
    const story = appRoutes.find((route) => route.path === 'story/:storyId')!
    expect(story.canActivate).toEqual([authGuard])
    expect(await story.loadComponent!()).toBe(StoryShellComponent)
    expect(story.children?.map((route) => route.path)).toEqual(['', 'sharing', 'statistics'])
    // The sharing page became a dialog; its old address opens General, where its settings are.
    expect(story.children?.find((route) => route.path === 'sharing')?.redirectTo).toBe('')
    expect(appRoutes.indexOf(story)).toBeGreaterThan(appRoutes.indexOf(board))
    expect(await board.loadComponent!()).toBe(DashboardComponent)
    expect(await privateStory.loadComponent!()).toBe(PlaygroundComponent)
    expect(await publicStory.loadComponent!()).toBe(PlaygroundComponent)
  })

  it('opens the editor at /board and at /story/:storyId/board with one route', () => {
    const match = (path: string) => boardMatcher(path.split('/').map((part) => new UrlSegment(part, {})))
    expect(match('board')?.consumed.length).toBe(1)
    expect(match('board')?.posParams).toBeUndefined()
    expect(match('story/abc/board')?.posParams?.['storyId'].path).toBe('abc')
    for (const path of ['story', 'story/abc', 'story/abc/board/extra', 'boards', 'story/abc/stats']) {
      expect(match(path)).withContext(path).toBeNull()
    }
  })
})
