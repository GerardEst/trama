import { Injectable, computed, signal } from '@angular/core'
import {
  config,
  storyReferenceUsage,
  tree,
} from '../../core/interfaces/interfaces'
import { getRequirementRefId } from '../utils/story-requirements'

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const nestedValue of Object.values(value as Record<string, unknown>)) {
      deepFreeze(nestedValue)
    }
    Object.freeze(value)
  }

  return value
}

const createEmptyTree = (): tree =>
  deepFreeze({
    nodes: [],
    refs: {},
    categories: [],
  })

const createInitialConfiguration = (): config =>
  deepFreeze({
    title: '',
    showLockedAnswers: false,
    sharing: false,
    tapLink: false,
    cumulativeMode: false,
    footer: {},
    tracking: false,
    customId: undefined,
  })

@Injectable({
  providedIn: 'root',
})
export class ActiveStoryService {
  private readonly activeStoryId = signal('')
  private readonly activeTree = signal<tree>(createEmptyTree())
  private readonly activeStoryName = signal('')
  private readonly activeConfiguration = signal<config>(
    createInitialConfiguration()
  )

  readonly storyId = this.activeStoryId.asReadonly()
  readonly entireTree = this.activeTree.asReadonly()
  readonly storyName = this.activeStoryName.asReadonly()
  readonly storyConfiguration = this.activeConfiguration.asReadonly()

  readonly referenceUsages = computed(() =>
    this.buildReferenceUsages(this.activeTree())
  )

  load(storyId: string, storyName: string, storyTree: Partial<tree>) {
    this.activeStoryId.set(storyId)
    this.activeStoryName.set(storyName)
    this.activeTree.set(this.normalizeTree(storyTree))
    this.activeConfiguration.set(createInitialConfiguration())
  }

  updateTree(mutate: (draft: tree) => boolean | void): tree | undefined {
    const nextTree = structuredClone(this.activeTree())
    const changed = mutate(nextTree) !== false
    if (!changed) return undefined

    const frozenTree = this.freezeTree(nextTree)
    this.activeTree.set(frozenTree)
    return frozenTree
  }

  setStoryName(storyName: string) {
    this.activeStoryName.set(storyName)
  }

  patchConfiguration(configuration: Partial<config>) {
    this.activeConfiguration.update((current) =>
      deepFreeze({
        ...current,
        ...configuration,
        footer: configuration.footer
          ? { ...configuration.footer }
          : current.footer,
      })
    )
  }

  reset() {
    this.activeStoryId.set('')
    this.activeTree.set(createEmptyTree())
    this.activeStoryName.set('')
    this.activeConfiguration.set(createInitialConfiguration())
  }

  private normalizeTree(storyTree: Partial<tree> | null | undefined): tree {
    return this.freezeTree(structuredClone(storyTree ?? {}))
  }

  private freezeTree(storyTree: Partial<tree>): tree {
    return deepFreeze({
      ...storyTree,
      nodes: storyTree.nodes ?? [],
      refs: storyTree.refs ?? {},
      categories: storyTree.categories ?? [],
    })
  }

  private buildReferenceUsages(storyTree: tree): storyReferenceUsage[] {
    const usages: storyReferenceUsage[] = []

    for (const node of storyTree.nodes) {
      this.addEventUsages(usages, storyTree, node.id, node.events)

      for (const answer of node.answers ?? []) {
        for (const requirement of answer.requirements ?? []) {
          const refId = getRequirementRefId(requirement)
          if (!refId) continue

          this.addUsage(
            usages,
            storyTree,
            refId,
            node.id,
            'requirement',
            answer.id
          )
        }

        this.addEventUsages(
          usages,
          storyTree,
          node.id,
          answer.events,
          answer.id
        )
      }
    }

    return usages
  }

  private addEventUsages(
    usages: storyReferenceUsage[],
    storyTree: tree,
    nodeId: string,
    events: tree['nodes'][number]['events'],
    answerId?: string
  ) {
    for (const storyEvent of events ?? []) {
      if (!storyEvent.target) continue
      this.addUsage(
        usages,
        storyTree,
        storyEvent.target,
        nodeId,
        'event',
        answerId
      )
    }
  }

  private addUsage(
    usages: storyReferenceUsage[],
    storyTree: tree,
    refId: string,
    nodeId: string,
    on: storyReferenceUsage['on'],
    answerId?: string
  ) {
    const storyRef = storyTree.refs[refId]
    if (!storyRef) return

    usages.push({
      ...storyRef,
      id: refId,
      node: nodeId,
      answer: answerId,
      on,
    })
  }
}
