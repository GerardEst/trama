import type { StoryAnswer, StoryNode, StoryTree } from '@trama-app/engine'
import { copyFor, type Lang } from '../../../i18n'
import { landingCopyFor } from '../content'
import { atlasFor, type LiveId } from '.'

// Small stories that show one feature each. They are real story trees: the
// page plays them with the real engine, so an example cannot claim what the
// product does not do (see trees.test.ts).

const content = (id: string, text: string, answers: StoryAnswer[]): StoryNode => ({ id, type: 'content', text: `<p>${text}</p>`, answers })
const ending = (id: string, text: string): StoryNode => ({ id, type: 'end', text: `<p>${text}</p>` })
const tree = (nodes: StoryNode[], refs: StoryTree['refs'] = {}, unavailableAnswerDisplay: StoryTree['unavailableAnswerDisplay'] = 'hidden'): StoryTree => ({
  nodes,
  refs,
  categories: [],
  entryPoint: { targetNodeId: nodes[0]!.id },
  unavailableAnswerDisplay,
})

export function liveTree(id: LiveId, lang: Lang): StoryTree {
  const a = landingCopyFor(lang).art
  const v = copyFor(lang).visuals
  const atlas = atlasFor(lang)
  const l = atlas.live
  const art = atlas.art

  switch (id) {
    case 'scene':
      return tree([
        content('start', a.crossroadsText, [
          { id: 'forest', text: a.forest, join: [{ node: 'forest_end' }] },
          { id: 'river', text: a.river, join: [{ node: 'river_end' }] },
        ]),
        ending('forest_end', l.forestEnd),
        ending('river_end', l.riverEnd),
      ])
    case 'connections':
      return tree(
        [
          content('market', a.marketText, [
            {
              id: 'buy',
              text: a.buyLamp,
              events: [{ action: 'alterStat', type: 'stat', target: 'stat_lamps', amount: '1' }],
              join: [{ node: 'market', toAnswer: true }],
            },
            { id: 'leave', text: a.leave, join: [{ node: 'gone' }] },
          ]),
          ending('gone', l.leftMarket),
        ],
        { stat_lamps: { name: l.lampsRef, type: 'stat' } },
      )
    case 'random':
      return tree([
        content('toss', l.tossText, [
          { id: 'coin', text: art.coin, join: [{ node: 'heads' }, { node: 'tails' }] },
        ]),
        ending('heads', l.headsEnd),
        ending('tails', l.tailsEnd),
      ])
    case 'events':
      return tree(
        [
          content('room', l.roomText, [
            {
              id: 'help',
              text: a.helpStranger,
              events: [{ action: 'alterStat', type: 'stat', target: 'stat_trust', amount: '1' }],
              join: [{ node: 'room', toAnswer: true }],
            },
            {
              id: 'key',
              text: a.takeKey,
              events: [{ action: 'alterCondition', type: 'condition', target: 'condition_key', amount: '1' }],
              requirements: [{ target: 'condition_key', type: 'condition', amount: 0 }],
              join: [{ node: 'room', toAnswer: true }],
            },
            { id: 'leave', text: l.leave, join: [{ node: 'out' }] },
          ]),
          ending('out', l.roomEnd),
        ],
        {
          stat_trust: { name: l.trustRef, type: 'stat' },
          condition_key: { name: l.keyRef, type: 'condition' },
        },
      )
    case 'requirements':
      return tree(
        [
          content('door', l.doorText, [
            {
              id: 'open',
              text: v.openArchive,
              requirements: [{ target: 'condition_key', type: 'condition', amount: 1 }],
              join: [{ node: 'open_end' }],
            },
            {
              id: 'key',
              text: a.takeKey,
              unavailableAnswerDisplay: 'hidden',
              events: [{ action: 'alterCondition', type: 'condition', target: 'condition_key', amount: '1' }],
              requirements: [{ target: 'condition_key', type: 'condition', amount: 0 }],
              join: [{ node: 'door', toAnswer: true }],
            },
          ]),
          ending('open_end', l.doorEnd),
        ],
        { condition_key: { name: l.keyRef, type: 'condition' } },
        'requirements',
      )
    case 'distributors':
      return tree(
        [
          content('guard', l.guardText, [
            {
              id: 'help',
              text: l.guardHelp,
              events: [{ action: 'alterStat', type: 'stat', target: 'stat_trust', amount: '1' }],
              join: [{ node: 'route' }],
            },
            { id: 'ignore', text: l.guardIgnore, join: [{ node: 'route' }] },
          ]),
          {
            id: 'route',
            type: 'distributor',
            conditions: [{ id: 'kind', rules: [{ ref: 'stat_trust', comparator: 'morethan', value: 0 }], join: [{ node: 'open' }] }],
            fallbackCondition: { join: [{ node: 'shut' }] },
          },
          ending('open', l.guardOpen),
          ending('shut', l.guardShut),
        ],
        { stat_trust: { name: l.trustRef, type: 'stat' } },
      )
    case 'input':
      return tree(
        [
          {
            id: 'ask',
            type: 'text',
            text: `<p>${a.question}</p>`,
            userTextOptions: { property: 'property_name' },
            join: [{ node: 'greet' }],
          },
          {
            id: 'greet',
            type: 'end',
            text: `<p>${a.welcome} <strong><span data-trama-variable="" data-kind="property" data-key="property_name">#property_name</span></strong>.</p>`,
          },
        ],
        { property_name: { name: a.name, type: 'property' } },
      )
  }
}
