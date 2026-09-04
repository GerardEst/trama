import { Component, effect, Input } from '@angular/core'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { ContextMenusService } from 'src/app/core/services/context-menus.service'
import { SelectOrCreateComponent } from 'src/app/shared/components/ui/select-or-create/select-or-create.component'
import { BasicButtonComponent } from 'src/app/shared/components/ui/basic-button/basic-button.component'
import { StadisticsLayerComponent } from '../stadistics-layer/stadistics-layer.component'
import { DatabaseService } from 'src/app/core/services/database.service'
import { ShareStoryComponent } from 'src/app/features/dashboard/modals/share-story/share-story.component'
import { ModalService } from 'src/app/core/services/modal.service'
import { StoryReferencesService } from 'src/app/features/board/services/story-references.service'
import { refType } from 'src/app/core/interfaces/interfaces'

interface DisplayedRef {
  id: string
  name: string
  type: refType
  category?: string
  times?: number
}

@Component({
  selector: 'polo-menu-tree-legend',
  standalone: true,
  imports: [BasicButtonComponent, StadisticsLayerComponent],
  templateUrl: './menu-tree-legend.component.html',
  styleUrl: './menu-tree-legend.component.sass',
})
export class MenuTreeLegendComponent {
  @Input() showLegend: boolean = true
  arrayOfRefs: DisplayedRef[] = []
  unusedRefs: DisplayedRef[] = []
  mode: 'refs' | 'games' = 'refs'

  constructor(
    public db: DatabaseService,
    public activeStory: ActiveStoryService,
    public contextMenu: ContextMenusService,
    private modal: ModalService,
    private storyReferences: StoryReferencesService
  ) {
    effect(() => {
      this.unusedRefs = []
      const countById = activeStory
        .referenceUsages()
        .reduce<
          Record<string, DisplayedRef>
        >((acc, { id, name, type, category }) => {
          acc[id] = acc[id] || { id, name, type, category, times: 0 }
          acc[id].times = (acc[id].times ?? 0) + 1
          return acc
        }, {})

      this.arrayOfRefs = Object.values(countById)

      // Check and list unused refs
      const allRefs = this.storyReferences.getAll()
      for (const refId in allRefs) {
        if (!this.arrayOfRefs.find((storyRef) => storyRef.id === refId)) {
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
      .referenceUsages()
      .filter((ref) => ref.id === refId)
    for (const ref of refs) {
      const DOMNode = document.querySelector('#' + ref.node)
      if (DOMNode) DOMNode.classList.add('highlighted')
    }
  }
  blurNodesWith(refId: string) {
    const refs = this.activeStory
      .referenceUsages()
      .filter((ref) => ref.id === refId)
    for (const ref of refs) {
      const DOMNode = document.querySelector('#' + ref.node)
      if (DOMNode) DOMNode.classList.remove('highlighted')
    }
  }

  updateRefName(event: any, refId: string) {
    this.storyReferences.rename(refId, event.target.value)
  }

  getCategories() {
    return this.storyReferences.getCategories()
  }

  deleteRef(refId: string) {
    this.storyReferences.delete(refId)
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
        this.storyReferences.setCategory(refId, event.value)
        const selectedRef = this.arrayOfRefs.find(
          (storyRef) => storyRef.id === refId
        )
        if (selectedRef) selectedRef.category = event.value

        this.contextMenu.close()
      }
    )
    contextMenu.instance.onNewOption.subscribe((event: string) => {
      this.storyReferences.createCategory(event)
      this.storyReferences.setCategory(refId, event)
      const selectedRef = this.arrayOfRefs.find(
        (storyRef) => storyRef.id === refId
      )
      if (selectedRef) selectedRef.category = event

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
