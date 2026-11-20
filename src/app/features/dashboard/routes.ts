import { Routes, UrlMatchResult, UrlSegment } from '@angular/router'
import { authGuard } from 'src/app/core/guards/auth.guard'
import { pendingEditorGuard } from 'src/app/core/guards/pending-editor.guard'

/**
 * The editor answers both /story/:storyId/board, one story, and /board, the last one edited
 * (or the example for a new author). One route for both keeps the board alive while the author
 * moves between stories or the address gains the id of the story that opened.
 */
export function boardMatcher(segments: UrlSegment[]): UrlMatchResult | null {
  if (segments.length === 1 && segments[0].path === 'board') return { consumed: segments }
  if (segments.length === 3 && segments[0].path === 'story' && segments[2].path === 'board') {
    return { consumed: segments, posParams: { storyId: segments[1] } }
  }
  return null
}

export const dashboardRoutes: Routes = [
  {
    matcher: boardMatcher,
    title: 'dashboard.boardTitle',
    loadComponent: () =>
      import('./dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [authGuard],
    canDeactivate: [pendingEditorGuard],
  },
]
