import { Component } from '@angular/core'
import { TreeErrorFinderService } from 'src/app/services/tree-error-finder.service'

@Component({
  selector: 'polo-tree-error-notifier',
  standalone: true,
  imports: [],
  templateUrl: './tree-error-notifier.component.html',
  styleUrl: './tree-error-notifier.component.sass',
})
export class TreeErrorNotifierComponent {
  errors: any = []
  show: boolean = false

  constructor(private treeError: TreeErrorFinderService) {
    this.treeError.errors$.subscribe((error) => {
      this.errors = error
    })
  }

  /** Maybe it's good to have it opened, so don't make it close when user
   * click outside. Allow it to be opened but make it clear how to close
   */
  toggleErrors() {
    this.show = !this.show
  }

  thereAreErrors() {
    return this.errors.find((error: any) => error.type === 'error')
  }
}
