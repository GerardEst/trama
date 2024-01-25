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
  constructor(private treeError: TreeErrorFinderService) {
    this.treeError.errors$.subscribe((error) => {
      console.log('notifier says', error)
    })
  }
}
