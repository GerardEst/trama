import { Injectable, signal } from '@angular/core'

@Injectable({
  providedIn: 'root',
})
export class ActiveStoryService {
  storyName = signal('')

  constructor() {}
}
