import { node } from 'src/app/core/interfaces/interfaces'
import { projectBoardJoins } from './board-join-projection'
import { ENTRY_POINT_ORIGIN } from './board-interactions'

describe('projectBoardJoins', () => {
  it('projects the entry into nested groups without inserting a fake node', () => {
    const nodes: node[] = [
      { id: 'node_0', type: 'content', left: 0, top: 0, groupId: 'node_2' },
      { id: 'node_1', type: 'group', left: 0, top: 0 },
      { id: 'node_2', type: 'group', left: 0, top: 0, groupId: 'node_1' },
    ]
    const entry = { left: -180, top: 0, targetNodeId: 'node_0' }
    expect(projectBoardJoins(nodes, undefined, entry).map(path => [path.fromAnchor, path.toAnchor])).toEqual([
      [`${ENTRY_POINT_ORIGIN}_join`, 'node_1_group-entry'],
    ])
    expect(projectBoardJoins(nodes, 'node_1', entry).map(path => [path.fromAnchor, path.toAnchor])).toEqual([
      ['node_1_boundary-in', 'node_2_group-entry'],
    ])
    expect(projectBoardJoins(nodes, 'node_2', entry).map(path => [path.fromAnchor, path.toAnchor])).toEqual([
      ['node_2_boundary-in', 'node_0_joiner'],
    ])
    expect(projectBoardJoins(nodes, 'outside', entry)).toEqual([])
    expect(projectBoardJoins(nodes, undefined, { ...entry, targetNodeId: 'missing' })).toEqual([])
    expect(projectBoardJoins(nodes, undefined, { ...entry, targetNodeId: 'node_1' })).toEqual([])
    expect(nodes).toHaveSize(3)
  })

  it('retains answer joins through nested groups at every board level', () => {
    const nodes: node[] = [
      {
        id: 'node_0', type: 'content', left: 0, top: 0,
        answers: [{ id: 'answer_0_0', join: [{ node: 'node_1', toAnswer: true }] }],
      },
      { id: 'node_1', type: 'content', left: 100, top: 0, groupId: 'node_3',
        join: [{ node: 'node_2' }] },
      { id: 'node_2', type: 'content', left: 200, top: 0, groupId: 'node_4',
        conditions: [{ id: 'condition_2_0', join: [{ node: 'node_5' }] }] },
      { id: 'node_3', type: 'group', left: 100, top: 0 },
      { id: 'node_4', type: 'group', left: 200, top: 0, groupId: 'node_3' },
      { id: 'node_5', type: 'end', left: 300, top: 0 },
    ]

    expect(projectBoardJoins(nodes).map((path) => [path.fromAnchor, path.toAnchor])).toEqual([
      ['answer_0_0_join', 'node_3_group-entry'],
      ['node_3_group-exit', 'node_5_joiner'],
    ])
    expect(projectBoardJoins(nodes, 'node_3').map((path) => [path.fromAnchor, path.toAnchor])).toEqual([
      ['node_3_boundary-in', 'node_1_joiner--answers'],
      ['node_1_join', 'node_4_group-entry'],
      ['node_4_group-exit', 'node_3_boundary-out'],
    ])
    expect(projectBoardJoins(nodes, 'node_4').map((path) => [path.fromAnchor, path.toAnchor])).toEqual([
      ['node_4_boundary-in', 'node_2_joiner'],
      ['condition_2_0_join', 'node_4_boundary-out'],
    ])
    expect(projectBoardJoins(nodes, 'node_3')[0]).toEqual(jasmine.objectContaining({
      origin: 'answer_0_0', destiny: 'node_1', toAnswer: true,
    }))
    expect(nodes[0].answers?.[0].join).toEqual([{ node: 'node_1', toAnswer: true }])
  })

  it('does not invent a port for a dangling join or draw internal links on the parent board', () => {
    const nodes: node[] = [
      { id: 'node_0', type: 'content', left: 0, top: 0, join: [{ node: 'missing' }] },
      { id: 'node_1', type: 'content', left: 0, top: 0, groupId: 'node_3', join: [{ node: 'node_2' }] },
      { id: 'node_2', type: 'end', left: 0, top: 0, groupId: 'node_3' },
      { id: 'node_3', type: 'group', left: 0, top: 0 },
    ]
    expect(projectBoardJoins(nodes)).toEqual([])
    expect(projectBoardJoins(nodes, 'node_3').map((path) => path.id)).toEqual([
      'node_1::node_2::node',
    ])
  })
})
