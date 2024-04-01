import { Injectable } from '@angular/core'
import { Subject } from 'rxjs'

@Injectable({ providedIn: 'root' })
export class SharedBoardService {
  public updatedJoins = new Subject()
  boardReference: any
  focusElements: boolean = true

  constructor() {}

  resumeBoardDrag() {
    console.log('Resume board drag')
    this.boardReference.resume()
  }
}
