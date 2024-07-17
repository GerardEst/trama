import { Component, effect } from '@angular/core'
import { ActiveStoryService } from 'src/app/services/active-story.service'
import { SelectorComponent } from '../ui/selector/selector.component'
import { ContextMenusService } from 'src/app/services/context-menus.service'
import { SelectOrCreateComponent } from 'src/app/context-menus/select-or-create/select-or-create.component'
import { BasicButtonComponent } from 'src/app/components/ui/basic-button/basic-button.component'
import { StadisticsLayerComponent } from '../stadistics-layer/stadistics-layer.component'
import { DatabaseService } from 'src/app/services/database.service'

@Component({
  selector: 'polo-menu-tree-legend',
  standalone: true,
  imports: [
    SelectorComponent,
    SelectOrCreateComponent,
    BasicButtonComponent,
    StadisticsLayerComponent,
  ],
  templateUrl: './menu-tree-legend.component.html',
  styleUrl: './menu-tree-legend.component.sass',
})
export class MenuTreeLegendComponent {
  arrayOfRefs: any = []
  unusedRefs: any = []
  mode: 'H' | 'S' = 'H'

  constructor(
    public db: DatabaseService,
    public activeStory: ActiveStoryService,
    public contextMenu: ContextMenusService
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
}
