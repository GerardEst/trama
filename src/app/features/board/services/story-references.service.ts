import { Injectable } from '@angular/core'
import { ref, refCategory, refType } from 'src/app/core/interfaces/interfaces'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { StoryMutationService } from 'src/app/shared/services/story-mutation.service'
import { generateIDForNewRequirement } from 'src/app/shared/utils/tree-searching'

export interface StoryRefOption extends ref {
  id: string
}

/** Manages the reference catalogue and its categories for the story editor. */
@Injectable({
  providedIn: 'root',
})
export class StoryReferencesService {
  constructor(
    private activeStory: ActiveStoryService,
    private mutations: StoryMutationService
  ) {}

  create(name: string, type: refType): StoryRefOption | undefined {
    const refs = this.activeStory.entireTree().refs
    const duplicatedRefId = Object.keys(refs).find(
      (refId) => refs[refId].name === name && refs[refId].type === type
    )

    if (duplicatedRefId) return undefined

    const id = `${type}_${generateIDForNewRequirement(refs)}`
    const createdRef = { id, name, type }

    this.mutations.update((tree) => {
      tree.refs[id] = { name, type }
    })

    return createdRef
  }

  rename(refId: string, newName: string) {
    this.mutations.update((tree) => {
      const storyRef = tree.refs[refId]
      if (!storyRef) return false

      storyRef.name = newName
      return true
    })
  }

  delete(refId: string) {
    this.mutations.update((tree) => {
      if (!tree.refs[refId]) return false

      delete tree.refs[refId]
      return true
    })
  }

  setCategory(refId: string, categoryId: string) {
    this.mutations.update((tree) => {
      const storyRef = tree.refs[refId]
      if (!storyRef) return false

      storyRef.category = categoryId
      return true
    })
  }

  createCategory(name: string) {
    const alreadyExists = this.activeStory
      .entireTree()
      .categories.some((category) => category.id === name)
    if (alreadyExists) return

    this.mutations.update((tree) => {
      tree.categories.push({ id: name, name })
    })
  }

  getAll(): Readonly<Record<string, ref>> {
    return this.activeStory.entireTree().refs
  }

  getName(refId: string): string {
    return this.activeStory.entireTree().refs[refId]?.name ?? ''
  }

  getByType(type: refType): StoryRefOption[] {
    return Object.entries(this.activeStory.entireTree().refs)
      .filter(([, storyRef]) => storyRef.type === type)
      .map(([id, storyRef]) => ({ id, ...storyRef }))
  }

  getCategories(): readonly refCategory[] {
    return this.activeStory.entireTree().categories
  }
}
