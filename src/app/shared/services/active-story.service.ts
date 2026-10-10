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

const HISTORY_LIMIT = 15

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

  private historyActive = false
  private historyGroupDepth = 0
  private historyGeneration = 0
  private readonly pastTrees = signal<readonly tree[]>([])
  private readonly futureTrees = signal<readonly tree[]>([])
  private coalescingKey?: string
  readonly canUndo = computed(() => this.pastTrees().length > 0)
  readonly canRedo = computed(() => this.futureTrees().length > 0)
  private readonly retainedImagePaths = computed(() => {
    const paths = new Set<string>()
    for (const storyTree of [this.activeTree(), ...this.pastTrees(), ...this.futureTrees()]) {
      for (const node of storyTree.nodes) {
        if (node.image?.path) paths.add(node.image.path)
      }
    }
    return paths
  })

  readonly storyId = this.activeStoryId.asReadonly()
  readonly entireTree = this.activeTree.asReadonly()
  readonly storyName = this.activeStoryName.asReadonly()
  readonly storyConfiguration = this.activeConfiguration.asReadonly()
  // Catalog equality is independent of cloning nodes and the rest of the tree.
  readonly references = computed(() => this.activeTree().refs, {
    equal: (previous, next) => JSON.stringify(previous) === JSON.stringify(next),
  })

  readonly referenceUsages = computed(() =>
    this.buildReferenceUsages(this.activeTree())
  )

  load(storyId: string, storyName: string, storyTree: Partial<tree>) {
    const sameStory = this.activeStoryId() === storyId
    if (!sameStory) this.clearHistory()
    this.activeStoryId.set(storyId)
    this.activeStoryName.set(storyName)
    this.activeTree.set(this.normalizeTree(storyTree))
    if (!sameStory) this.activeConfiguration.set(createInitialConfiguration())
  }

  updateTree(mutate: (draft: tree) => boolean | void, coalescingKey?: string): tree | undefined {
    const nextTree = structuredClone(this.activeTree())
    const changed = mutate(nextTree) !== false
    if (!changed) return undefined

    const frozenTree = this.freezeTree(nextTree)
    if (this.historyActive && this.historyGroupDepth === 0) {
      if (!coalescingKey || coalescingKey !== this.coalescingKey || !this.canUndo() || this.canRedo()) {
        this.remember(this.activeTree())
      }
      this.coalescingKey = coalescingKey
    }
    this.activeTree.set(frozenTree)
    return frozenTree
  }

  /** History is editor-session-only; snapshots are already deeply frozen. */
  beginHistorySession() {
    this.clearHistory()
    this.historyActive = true
  }

  endHistorySession() {
    this.historyActive = false
    this.clearHistory()
  }

  /** A blur, explicit commit or another action ends a consecutive text edit. */
  endHistoryCoalescing() {
    this.coalescingKey = undefined
  }

  groupTreeChanges<T>(action: () => T): T {
    this.endHistoryCoalescing()
    const previousTree = this.activeTree()
    const generation = this.historyGeneration
    this.historyGroupDepth++
    try {
      return action()
    } finally {
      this.historyGroupDepth--
      if (this.historyActive && this.historyGroupDepth === 0 &&
        generation === this.historyGeneration && this.activeTree() !== previousTree) {
        this.remember(previousTree)
      }
    }
  }

  undoTree(): tree | undefined {
    if (this.historyGroupDepth > 0) return undefined
    this.endHistoryCoalescing()
    const previousTree = this.pastTrees().at(-1)
    if (!previousTree) return undefined
    this.pastTrees.update(past => past.slice(0, -1))
    this.futureTrees.update(future => [...future, this.activeTree()])
    this.activeTree.set(previousTree)
    return previousTree
  }

  redoTree(): tree | undefined {
    if (this.historyGroupDepth > 0) return undefined
    this.endHistoryCoalescing()
    const nextTree = this.futureTrees().at(-1)
    if (!nextTree) return undefined
    this.futureTrees.update(future => future.slice(0, -1))
    this.pastTrees.update(past => [...past, this.activeTree()])
    this.activeTree.set(nextTree)
    return nextTree
  }

  /** Assets must survive while any reachable version can restore them. */
  retainsImage(imagePath: string): boolean {
    return this.retainedImagePaths().has(imagePath)
  }

  private remember(previousTree: tree) {
    this.endHistoryCoalescing()
    this.futureTrees.set([])
    this.pastTrees.update(past => [...past, previousTree].slice(-HISTORY_LIMIT))
  }

  private clearHistory() {
    this.historyGeneration++
    this.endHistoryCoalescing()
    this.pastTrees.set([])
    this.futureTrees.set([])
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
    this.clearHistory()
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

      for (const route of node.conditions ?? []) {
        for (const rule of route.rules ?? [route]) {
          if (rule.ref) {
            this.addUsage(usages, storyTree, rule.ref, node.id, 'requirement')
          }
        }
      }

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
