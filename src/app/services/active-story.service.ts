import { Injectable, signal, computed } from '@angular/core'

@Injectable({
  providedIn: 'root',
})
export class ActiveStoryService {
  /** todo -> Aqui s'ha de posar i gestionar des d'aqui les opcions
   * de la historia activa, com el track i la vista
   */
  storyName = signal('')
  storyRefs = signal({})

  constructor() {}
}
