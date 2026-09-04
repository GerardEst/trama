import {
  node,
  node_answer,
  node_conditions,
  node_fallbackCondition,
  tree,
} from '../../core/interfaces/interfaces'

export function findNodeInTree(
  nodeId: string,
  storyTree: tree
): node | undefined {
  return storyTree.nodes.find((storyNode) => storyNode.id === nodeId)
}

export function findAnswerInTree(
  answerId: string,
  storyTree: tree
): node_answer | undefined {
  const answerNodeId = answerId.split('_')[1]
  const storyNode = findNodeInTree(`node_${answerNodeId}`, storyTree)

  return storyNode?.answers?.find((answer) => answer.id === answerId)
}

export function findConditionsInTree(
  conditionId: string,
  storyTree: tree
): node_conditions | node_fallbackCondition | undefined {
  const conditionNodeId = conditionId.split('_')[1]
  const storyNode = findNodeInTree(`node_${conditionNodeId}`, storyTree)
  if (!storyNode) return undefined

  if (conditionId.endsWith('_fallback')) return storyNode.fallbackCondition
  return storyNode.conditions?.find((condition) => condition.id === conditionId)
}

export function getNodeIdFromAnswerId(answerId: string) {
  const nodeNumber = answerId.split('_')[1]
  return 'node_' + nodeNumber
}

// ID Generators

export function generateIDForNewNode(nodes: node[] | undefined) {
  const nodeIds = []
  if (!nodes || nodes.length === 0) return 'node_0'

  for (const storyNode of nodes) {
    nodeIds.push(parseInt(storyNode.id.split('_')[1]))
  }
  const greatestId = Math.max(...nodeIds) > 0 ? Math.max(...nodeIds) : 0

  return `node_${greatestId + 1}`
}

export function generateIDForNewAnswer(
  nodeId: string,
  currentAnswers: node_answer[] | undefined
) {
  const answerIds = []
  if (!currentAnswers) return `answer_${nodeId.split('_')[1]}_0`

  for (const answer of currentAnswers) {
    answerIds.push(parseInt(answer.id.split('_')[2]))
  }
  const greatestId = Math.max(...answerIds) > 0 ? Math.max(...answerIds) : 0

  return `answer_${nodeId.split('_')[1]}_${greatestId + 1}`
}

export function generateIDForNewCondition(
  nodeId: string,
  currentConditions: node_conditions[] | undefined
) {
  const conditionIds = []
  if (!currentConditions) return `condition_${nodeId.split('_')[1]}_0`

  for (const condition of currentConditions) {
    conditionIds.push(parseInt(condition.id.split('_')[2]))
  }
  const greatestId =
    Math.max(...conditionIds) > 0 ? Math.max(...conditionIds) : 0

  return `condition_${nodeId.split('_')[1]}_${greatestId + 1}`
}

export function generateIDForNewRequirement(
  refs?: Readonly<Record<string, unknown>>
) {
  if (!refs || Object.keys(refs).length === 0) return 0

  const ids = Object.keys(refs).map((key) => parseInt(key.split('_')[1]))
  return Math.max(...ids) + 1
}
