import { Component, effect } from '@angular/core'
import { TreeErrorNotifierComponent } from 'src/app/components/tree-error-notifier/tree-error-notifier.component'
import { ActiveStoryService } from 'src/app/services/active-story.service'
import { StorageService } from 'src/app/services/storage.service'
import { SelectorComponent } from '../ui/selector/selector.component'

@Component({
  selector: 'polo-menu-tree-legend',
  standalone: true,
  imports: [TreeErrorNotifierComponent, SelectorComponent],
  templateUrl: './menu-tree-legend.component.html',
  styleUrl: './menu-tree-legend.component.sass',
})
export class MenuTreeLegendComponent {
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
            {
              id,
              name,
              type,
              category,
            }: { id: string; name: string; type: string; category: string }
          ) => {
            acc[id] = acc[id] || { id, name, type, category, times: 0 }
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
            category: allRefs[refId].category,
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

  // create a new category
  // category names are the ids, cannot be repeated and cant have spaces or strange characters
  // save categories in an array
  // the array of categories can be saved to the tree, but we dont need them
  // in the adventure, its just for the selectors. Anyways, it wont be bad
  newCategory(category: string) {
    this.storage.createCategory(category)
  }

  changeCategory(category: any, refId: string) {
    this.storage.addCategoryToRef(refId, category.value)
  }

  getCategories() {
    return this.storage.getCategories()
  }

  deleteRef(refId: string) {
    this.storage.deleteRef(refId)
    this.unusedRefs = this.unusedRefs.filter((ref: any) => ref.id !== refId)
  }

  async goToPlayground() {
    window.open('/playground/' + this.activeStory.storyId(), '_blank')
  }
}
