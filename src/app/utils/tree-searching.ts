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

// ID Generators

export function generateIDForNewAnswer(
  nodeId: string,
  currentAnswers: any[] | undefined
) {
  let answer_ids = []
  if (!currentAnswers) return `answer_${nodeId.split('_')[1]}_0`

  for (let answer of currentAnswers)
    answer_ids.push(parseInt(answer.id.split('_')[2]))
  const great_id = Math.max(...answer_ids) > 0 ? Math.max(...answer_ids) : 0

  return `answer_${nodeId.split('_')[1]}_${great_id + 1}`
}

export function generateIDForNewCondition(
  nodeId: string,
  currentConditions: any[] | undefined
) {
  let condition_ids = []
  if (!currentConditions) return `condition_${nodeId.split('_')[1]}_0`

  for (let condition of currentConditions)
    condition_ids.push(parseInt(condition.id.split('_')[2]))
  const great_id =
    Math.max(...condition_ids) > 0 ? Math.max(...condition_ids) : 0

  return `condition_${nodeId.split('_')[1]}_${great_id + 1}`
}

export function generateIDForNewRequirement(refs?: any) {
  if (!refs || Object.keys(refs).length === 0) return 0

  if (refs) {
    const ids = Object.keys(refs).map((key) => parseInt(key.split('_')[1]))

    const maxId = Math.max(...ids)

    return maxId + 1
  }
  return 1
}
