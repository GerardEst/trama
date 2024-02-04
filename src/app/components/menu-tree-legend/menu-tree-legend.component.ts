import { Component, Input, effect } from '@angular/core'
import { TreeErrorNotifierComponent } from 'src/app/components/tree-error-notifier/tree-error-notifier.component'
import { ActiveStoryService } from 'src/app/services/active-story.service'
import { StorageService } from 'src/app/services/storage.service'

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
  unusedRefs: any = []

  constructor(
    public activeStory: ActiveStoryService,
    private storage: StorageService
  ) {
    effect(() => {
      this.unusedRefs = []
      const countById = activeStory
        .storyRefs()
        .reduce(
          (
            acc: any,
            { id, name, type }: { id: string; name: string; type: string }
          ) => {
            acc[id] = acc[id] || { id, name, type, times: 0 }
            acc[id].times++
            return acc
          },
          {}
        )

      this.arrayOfRefs = Object.values(countById)

      // Check and list unused refs
      const allRefs = this.storage.getRefs()
      for (let refId in allRefs) {
        if (!this.arrayOfRefs.find((ref: any) => ref.id === refId)) {
          this.unusedRefs.push({
            id: refId,
            name: allRefs[refId].name,
            type: allRefs[refId].type,
          })
        }
      }
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

  updateRefName(event: any, refId: string) {
    this.storage.updateRefName(refId, event.target.value)
  }

  deleteRef(refId: string) {
    this.storage.deleteRef(refId)
    this.unusedRefs = this.unusedRefs.filter((ref: any) => ref.id !== refId)
  }

  async goToPlayground() {
    window.open('/playground/' + this.treeId, '_blank')
  }
}
