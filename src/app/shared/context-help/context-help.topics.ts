import { TranslationKey } from 'src/app/core/i18n/i18n.types'

// Adding a topic only requires translated copy and an explicit template placement.
export const CONTEXT_HELP_TOPICS = {
  'board.events': {
    title: 'contextHelp.topics.events.title',
    body: 'contextHelp.topics.events.body',
    docsFragment: 'events',
  },
  'board.requirements': {
    title: 'contextHelp.topics.requirements.title',
    body: 'contextHelp.topics.requirements.body',
    docsFragment: 'requirements',
  },
  'board.references': {
    title: 'contextHelp.topics.references.title',
    body: 'contextHelp.topics.references.body',
    docsFragment: 'events',
  },
  'board.nodes.content': {
    title: 'board.node.types.content',
    body: 'contextHelp.topics.contentNode.body',
    docsFragment: 'content-nodes',
  },
  'board.nodes.text': {
    title: 'board.node.types.text',
    body: 'contextHelp.topics.textNode.body',
    docsFragment: 'player-input',
  },
  'board.nodes.distributor': {
    title: 'board.node.types.distributor',
    body: 'contextHelp.topics.distributorNode.body',
    docsFragment: 'distributors',
  },
  'board.nodes.end': {
    title: 'board.node.types.end',
    body: 'contextHelp.topics.endNode.body',
    docsFragment: 'share-node',
  },
} as const satisfies Record<string, {
  title: TranslationKey
  body: TranslationKey
  docsFragment: string
}>

export type ContextHelpTopic = keyof typeof CONTEXT_HELP_TOPICS

// Both board nodes and their creation menu use the same explanations.
export const NODE_CONTEXT_HELP_TOPICS = {
  text: 'board.nodes.text',
  content: 'board.nodes.content',
  distributor: 'board.nodes.distributor',
  end: 'board.nodes.end',
} as const satisfies Record<string, ContextHelpTopic>
