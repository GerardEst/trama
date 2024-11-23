import { PlaygroundComponent } from './pages/playground/playground.component'
import { StoryNotFoundComponent } from './pages/story-not-found/story-not-found.component'

export const playgroundRoutes = [
  { path: 'private/:storyId', component: PlaygroundComponent },
  { path: 'not-found', component: StoryNotFoundComponent },

  // This must be the last item on the router
  { path: ':customId', component: PlaygroundComponent },
]
