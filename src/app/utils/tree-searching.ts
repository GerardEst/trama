export function findAnswerInTree(answerId: string, tree: any) {
  const answerNodeId = answerId.split('_')[1]

  const node = tree.nodes.find(
    (node: any) => node.id === `node_${answerNodeId}`
  )

  return node.answers?.filter((answer: any) => answer.id === answerId)
}
