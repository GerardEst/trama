import { Component, effect } from '@angular/core'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { ContextMenusService } from 'src/app/core/services/context-menus.service'
import { SelectOrCreateComponent } from 'src/app/shared/components/ui/select-or-create/select-or-create.component'
import { StoryReferencesService } from 'src/app/features/board/services/story-references.service'
import { refType } from 'src/app/core/interfaces/interfaces'
import { EditableNameComponent } from 'src/app/shared/components/ui/editable-name/editable-name.component'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { I18nService } from 'src/app/core/i18n/i18n.service'

interface DisplayedRef {
  id: string
  name: string
  type: refType
  category?: string
  times?: number
}

/**
 * The open story's stats, conditions and properties, in the project panel: their names, how many
 * times the story uses each one and their category. Hovering one highlights the nodes that use it;
 * one that nothing uses can be deleted.
 */
@Component({
  selector: 'polo-story-references',
  standalone: true,
  imports: [EditableNameComponent, TranslatePipe],
  templateUrl: './story-references.component.html',
  styleUrl: './story-references.component.css',
})
export class StoryReferencesComponent {
  usedRefs: DisplayedRef[] = []
  unusedRefs: DisplayedRef[] = []

  constructor(
    public activeStory: ActiveStoryService,
    private contextMenu: ContextMenusService,
    private storyReferences: StoryReferencesService,
    private i18n: I18nService
  ) {
    effect(() => {
      const countById = activeStory
        .referenceUsages()
        .reduce<Record<string, DisplayedRef>>((acc, { id, name, type, category }) => {
          acc[id] = acc[id] || { id, name, type, category, times: 0 }
          acc[id].times = (acc[id].times ?? 0) + 1
          return acc
        }, {})
      this.usedRefs = Object.values(countById)

      const allRefs = this.storyReferences.getAll()
      this.unusedRefs = Object.keys(allRefs)
        .filter((refId) => !countById[refId])
        .map((refId) => ({
          id: refId,
          name: allRefs[refId].name,
          type: allRefs[refId].type,
          category: allRefs[refId].category,
        }))
    })
  }

  get isEmpty() {
    return this.usedRefs.length === 0 && this.unusedRefs.length === 0
  }

  highlightNodesWith(refId: string, highlighted: boolean) {
    for (const ref of this.activeStory.referenceUsages().filter((usage) => usage.id === refId)) {
      document.getElementById(ref.node)?.classList.toggle('highlighted', highlighted)
    }
  }

  updateRefName(name: string, refId: string) {
    this.storyReferences.rename(refId, name)
  }

  deleteRef(refId: string) {
    this.storyReferences.delete(refId)
    this.unusedRefs = this.unusedRefs.filter((ref) => ref.id !== refId)
  }

  refTypeName(type: refType) {
    return this.i18n.t(`common.refTypes.${type}`)
  }

  openSelectorFor(clickEvent: Event, refId: string) {
    const contextMenu = this.contextMenu.launch(SelectOrCreateComponent, clickEvent.target)
    contextMenu.setInput('options', this.storyReferences.getCategories())
    contextMenu.setInput('message', this.i18n.t('dashboard.legend.categoryMessage'))
    contextMenu.setInput('selectedOption', refId)

    const setCategory = (category: string) => {
      this.storyReferences.setCategory(refId, category)
      const selectedRef = this.usedRefs.find((storyRef) => storyRef.id === refId)
      if (selectedRef) selectedRef.category = category
      this.contextMenu.close()
    }
    contextMenu.instance.onSelectOption.subscribe((event: { value: string }) => setCategory(event.value))
    contextMenu.instance.onNewOption.subscribe((category: string) => {
      this.storyReferences.createCategory(category)
      setCategory(category)
    })
  }
}
