export function findNodeInTree(nodeId: string, tree: any) {
  return tree.nodes.find((node: any) => node.id === nodeId)
}

export function findAnswerInTree(answerId: string, tree: any) {
  const answerNodeId = answerId.split('_')[1]
  const node = findNodeInTree(`node_${answerNodeId}`, tree)

  // TODO -> Make it find, not filter. Update active-story to use the returned directly, not the first element
  return node.answers?.filter((answer: any) => answer.id === answerId)
}

export function getNodeIdFromAnswerId(answerId: string) {
  const nodeNumber = answerId.split('_')[1]

  return 'node_' + nodeNumber
}

export function getNewIdForRequirement(refs?: any) {
  if (!refs || Object.keys(refs).length === 0) return 0

  if (refs) {
    const ids = Object.keys(refs).map((key) => parseInt(key.split('_')[1]))

    const maxId = Math.max(...ids)

    return maxId + 1
  }
  return 1
}
