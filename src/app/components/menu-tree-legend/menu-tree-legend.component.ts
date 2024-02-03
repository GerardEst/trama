import { Component, Input, effect } from '@angular/core'
import { TreeErrorNotifierComponent } from 'src/app/components/tree-error-notifier/tree-error-notifier.component'
import { ActiveStoryService } from 'src/app/services/active-story.service'

@Component({
  selector: 'polo-menu-tree-legend',
  standalone: true,
  imports: [TreeErrorNotifierComponent],
  templateUrl: './menu-tree-legend.component.html',
  styleUrl: './menu-tree-legend.component.sass',
})
export class MenuTreeLegendComponent {
  @Input() treeId?: string
  arrayOfRefs: any = []

  constructor(public activeStory: ActiveStoryService) {
    effect(() => {
      const countById = activeStory
        .storyRefs()
        .reduce((acc: any, { id, name }: { id: string; name: string }) => {
          acc[id] = acc[id] || { id, name, times: 0 }
          acc[id].times++
          return acc
        }, {})

      this.arrayOfRefs = Object.values(countById)
    })
  }

  focusNodesWith(refId: string) {
    // todo -> si els nodes estiguessin en una signal, podria
    // reflexar els canvis tranquilament?
    // I no és reactiu, seguuur que es pot fer millor
    const refs = this.activeStory
      .storyRefs()
      .filter((ref: any) => ref.id === refId)
    for (let ref of refs) {
      const DOMNode = document.querySelector('#' + ref.node)
      if (DOMNode) DOMNode.classList.add('highlighted')
    }
  }
  blurNodesWith(refId: string) {
    // todo -> si els nodes estiguessin en una signal, podria
    // reflexar els canvis tranquilament?
    // I no és reactiu, seguuur que es pot fer millor
    const refs = this.activeStory
      .storyRefs()
      .filter((ref: any) => ref.id === refId)
    for (let ref of refs) {
      const DOMNode = document.querySelector('#' + ref.node)
      if (DOMNode) DOMNode.classList.remove('highlighted')
    }
  }

  async goToPlayground() {
    //await this.saveToDb()
    window.open('/playground/' + this.treeId, '_blank')
  }
}
