import { Component, effect, Input } from '@angular/core'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { ContextMenusService } from 'src/app/core/services/context-menus.service'
import { SelectOrCreateComponent } from 'src/app/shared/components/ui/select-or-create/select-or-create.component'
import { BasicButtonComponent } from 'src/app/shared/components/ui/basic-button/basic-button.component'
import { StadisticsLayerComponent } from '../stadistics-layer/stadistics-layer.component'
import { DatabaseService } from 'src/app/core/services/database.service'
import { ShareStoryComponent } from 'src/app/features/dashboard/modals/share-story/share-story.component'
import { ModalService } from 'src/app/core/services/modal.service'

@Component({
  selector: 'polo-menu-tree-legend',
  standalone: true,
  imports: [BasicButtonComponent, StadisticsLayerComponent],
  templateUrl: './menu-tree-legend.component.html',
  styleUrl: './menu-tree-legend.component.sass',
})
export class MenuTreeLegendComponent {
  @Input() showLegend: boolean = true
  arrayOfRefs: any = []
  unusedRefs: any = []
  mode: 'refs' | 'games' = 'refs'

  constructor(
    public db: DatabaseService,
    public activeStory: ActiveStoryService,
    public contextMenu: ContextMenusService,
    private modal: ModalService
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
      const allRefs = this.activeStory.getRefs()
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
    const refs = this.activeStory
      .storyRefs()
      .filter((ref: any) => ref.id === refId)
    for (let ref of refs) {
      const DOMNode = document.querySelector('#' + ref.node)
      if (DOMNode) DOMNode.classList.add('highlighted')
    }
  }
  blurNodesWith(refId: string) {
    const refs = this.activeStory
      .storyRefs()
      .filter((ref: any) => ref.id === refId)
    for (let ref of refs) {
      const DOMNode = document.querySelector('#' + ref.node)
      if (DOMNode) DOMNode.classList.remove('highlighted')
    }
  }

  updateRefName(event: any, refId: string) {
    this.activeStory.updateRefName(refId, event.target.value)
  }

  getCategories() {
    return this.activeStory.getCategories()
  }

  deleteRef(refId: string) {
    this.activeStory.deleteRef(refId)
    this.unusedRefs = this.unusedRefs.filter((ref: any) => ref.id !== refId)
  }

  async goToPlayground() {
    window.open('/private/' + this.activeStory.storyId(), '_blank')
  }

  openSelectorFor(clickEvent: Event, refId: string) {
    const contextMenu = this.contextMenu.launch(
      SelectOrCreateComponent,
      clickEvent.target
    )

    contextMenu.setInput('options', this.getCategories())
    contextMenu.setInput('message', 'Select a category or create a new one')
    contextMenu.setInput('selectedOption', refId)

    contextMenu.instance.onSelectOption.subscribe(
      (event: { value: string; previousValue: string }) => {
        this.activeStory.setCategoryToRef(refId, event.value)
        this.arrayOfRefs.find((ref: any) => ref.id === refId).category =
          event.value

        this.contextMenu.close()
      }
    )
    contextMenu.instance.onNewOption.subscribe((event: string) => {
      this.activeStory.createCategory(event)
      this.activeStory.setCategoryToRef(refId, event)
      this.arrayOfRefs.find((ref: any) => ref.id === refId).category = event

      this.contextMenu.close()
    })
  }

  toggleLegend() {
    this.showLegend = !this.showLegend
  }

  openShareModal() {
    this.modal.launch(ShareStoryComponent)
  }
}
