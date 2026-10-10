import { join, node, storyEntryPoint } from 'src/app/core/interfaces/interfaces'
import { ENTRY_POINT_ORIGIN } from './board-interactions'

export interface ProjectedBoardJoin {
  id: string
  origin: string
  destiny: string
  toAnswer: boolean
  fromAnchor: string
  toAnchor: string
  /** Visible owners, not necessarily the original story nodes (collapsed groups). */
  fromNode?: string
  toNode?: string
  fromBoundary: boolean
  toBoundary: boolean
}

interface JoinOrigin {
  id: string
  joins?: join[]
}

/** Projects story joins onto one editor level without rewriting the playable graph. */
export function projectBoardJoins(
  nodes: node[],
  groupId?: string,
  entryPoint?: storyEntryPoint
): ProjectedBoardJoin[] {
  const byId = new Map(nodes.map((storyNode) => [storyNode.id, storyNode]))
  const projected: ProjectedBoardJoin[] = []

  // The visible endpoint is either a node on this level, its enclosing group,
  // or the boundary of the group currently being edited.
  const visibleEndpoint = (nodeId: string): string | undefined => {
    let current = byId.get(nodeId)
    if (!current) return undefined
    while (current.groupId !== groupId) {
      if (!current.groupId) return undefined
      current = byId.get(current.groupId)
      if (!current) return undefined
    }
    return current.id
  }

  const entryTarget = entryPoint?.targetNodeId
  const destination = entryTarget ? byId.get(entryTarget) : undefined
  if (destination && destination.type !== 'group') {
    const toNode = visibleEndpoint(destination.id)
    if (toNode) {
      projected.push({
        id: `${ENTRY_POINT_ORIGIN}::${destination.id}::node`,
        origin: ENTRY_POINT_ORIGIN,
        destiny: destination.id,
        toAnswer: false,
        fromNode: groupId ? undefined : ENTRY_POINT_ORIGIN,
        toNode,
        fromBoundary: groupId !== undefined,
        toBoundary: false,
        fromAnchor: groupId ? `${groupId}_boundary-in` : `${ENTRY_POINT_ORIGIN}_join`,
        toAnchor: toNode === destination.id
          ? `${destination.id}_joiner`
          : `${toNode}_group-entry`,
      })
    }
  }

  const origins = (storyNode: node): JoinOrigin[] => [
    { id: storyNode.id, joins: storyNode.join },
    ...(storyNode.answers ?? []).map((answer) => ({
      id: answer.id, joins: answer.join,
    })),
    ...(storyNode.conditions ?? []).map((condition) => ({
      id: condition.id, joins: condition.join,
    })),
    ...(storyNode.fallbackCondition
      ? [{
          id: storyNode.fallbackCondition.id,
          joins: storyNode.fallbackCondition.join,
        }]
      : []),
  ]

  for (const storyNode of nodes) {
    if (storyNode.type === 'group') continue
    const fromNode = visibleEndpoint(storyNode.id)
    for (const origin of origins(storyNode)) {
      for (const storyJoin of origin.joins ?? []) {
        const destination = byId.get(storyJoin.node)
        if (!destination || destination.type === 'group') continue
        const toNode = visibleEndpoint(storyJoin.node)
        // A connection entirely outside this level, or entirely within a
        // collapsed child group, cannot be represented here.
        if ((!fromNode && !toNode) || (fromNode && fromNode === toNode)) continue
        if (groupId === undefined && (!fromNode || !toNode)) continue

        const toAnswer = !!storyJoin.toAnswer
        const fromBoundary = !fromNode
        const toBoundary = !toNode
        projected.push({
          id: `${origin.id}::${storyJoin.node}::${toAnswer ? 'answers' : 'node'}`,
          origin: origin.id,
          destiny: storyJoin.node,
          toAnswer,
          fromNode,
          toNode,
          fromBoundary,
          toBoundary,
          fromAnchor: fromBoundary
            ? `${groupId}_boundary-in`
            : fromNode === storyNode.id
              ? `${origin.id}_join`
              : `${fromNode}_group-exit`,
          toAnchor: toBoundary
            ? `${groupId}_boundary-out`
            : toNode === storyJoin.node
              ? `${storyJoin.node}_joiner${toAnswer ? '--answers' : ''}`
              : `${toNode}_group-entry`,
        })
      }
    }
  }
  return projected
}
