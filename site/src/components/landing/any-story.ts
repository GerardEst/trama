import type { StoryTree } from '@trama-app/engine'
import type { InterfaceCopy } from './copy'

// The story the example interfaces play. It is small but uses what an interface
// has to react to: a stat and a condition changed by events, a distributor that
// reads the stat, an answer locked by a requirement, and two endings.

export const TRUST = 'stat_trust'
export const KEY = 'condition_key'

const p = (text: string) => `<p>${text}</p>`

export function anyStory(e: InterfaceCopy): StoryTree {
  return {
    nodes: [
      {
        id: 'square',
        type: 'content',
        text: p(e.anySquare),
        answers: [
          {
            id: 'help',
            text: e.anyHelp,
            events: [{ action: 'alterStat', type: 'stat', target: TRUST, amount: '1' }],
            requirements: [{ target: KEY, type: 'condition', amount: 0 }],
            unavailableAnswerDisplay: 'hidden',
            join: [{ node: 'stranger' }],
          },
          {
            id: 'tower',
            text: e.anyTower,
            requirements: [{ target: KEY, type: 'condition', amount: 1 }],
            join: [{ node: 'top' }],
          },
          { id: 'leave', text: e.anyLeave, join: [{ node: 'gone' }] },
        ],
      },
      {
        id: 'stranger',
        type: 'distributor',
        conditions: [{ id: 'trusted', rules: [{ ref: TRUST, comparator: 'morethan', value: 1 }], join: [{ node: 'gift' }] }],
        fallbackCondition: { join: [{ node: 'square', toAnswer: true }] },
      },
      {
        id: 'gift',
        type: 'content',
        text: p(e.anyGift),
        events: [{ action: 'alterCondition', type: 'condition', target: KEY, amount: '1' }],
        answers: [{ id: 'thank', text: e.anyThank, join: [{ node: 'square', toAnswer: true }] }],
      },
      { id: 'top', type: 'end', text: p(e.anyTop) },
      { id: 'gone', type: 'end', text: p(e.anyGone) },
    ],
    refs: {
      [TRUST]: { name: e.anyTrust, type: 'stat' },
      [KEY]: { name: e.anyKey, type: 'condition' },
    },
    categories: [],
    entryPoint: { targetNodeId: 'square' },
    unavailableAnswerDisplay: 'requirements',
  }
}
