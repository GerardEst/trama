import { join, node } from 'src/app/core/interfaces/interfaces'

export interface ProjectedBoardJoin {
  id: string
  origin: string
  destiny: string
  toAnswer: boolean
  fromAnchor: string
  toAnchor: string
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
  groupId?: string
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
