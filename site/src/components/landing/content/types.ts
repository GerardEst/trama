// Copy for the landing’s feature examples; shared interface text comes from i18n/.

export const CHAPTERS = ['write', 'connect', 'remember', 'publish'] as const
export type ChapterId = (typeof CHAPTERS)[number]

export const FEATURE_IDS = [
  'scene',
  'focus',
  'images',
  'connections',
  'organisation',
  'events',
  'requirements',
  'distributors',
  'input',
  'variables',
  'preview',
  'share',
  'analytics',
  'engine',
] as const
export type FeatureId = (typeof FEATURE_IDS)[number]

export type ArtView = 'author' | 'reader'

export interface FeatureInfo {
  id: FeatureId
  chapter: ChapterId
  /** Chapter of the docs page that explains it in depth, if there is one. */
  docs?: string
  /** The view that explains the feature best when only one fits. */
  view: ArtView
  /** Features it works with. */
  pairs: readonly FeatureId[]
}

export const FEATURES: readonly FeatureInfo[] = [
  { id: 'scene', chapter: 'write', docs: 'content-nodes', view: 'author', pairs: ['connections', 'images'] },
  { id: 'focus', chapter: 'write', docs: 'focus-mode', view: 'author', pairs: ['variables', 'scene'] },
  { id: 'images', chapter: 'write', docs: 'images', view: 'reader', pairs: ['scene', 'share'] },
  { id: 'connections', chapter: 'connect', docs: 'connections', view: 'author', pairs: ['scene', 'distributors'] },
  { id: 'organisation', chapter: 'connect', docs: 'organisation', view: 'author', pairs: ['connections', 'preview'] },
  { id: 'events', chapter: 'remember', docs: 'events', view: 'author', pairs: ['requirements', 'distributors'] },
  { id: 'requirements', chapter: 'remember', docs: 'requirements', view: 'reader', pairs: ['events', 'distributors'] },
  { id: 'distributors', chapter: 'remember', docs: 'distributors', view: 'author', pairs: ['events', 'requirements'] },
  { id: 'input', chapter: 'remember', docs: 'player-input', view: 'reader', pairs: ['variables', 'events'] },
  { id: 'variables', chapter: 'remember', docs: 'variables', view: 'author', pairs: ['input', 'focus'] },
  { id: 'preview', chapter: 'publish', view: 'author', pairs: ['share', 'organisation'] },
  { id: 'share', chapter: 'publish', docs: 'share-node', view: 'author', pairs: ['analytics', 'preview'] },
  { id: 'analytics', chapter: 'publish', view: 'author', pairs: ['events', 'share'] },
  { id: 'engine', chapter: 'publish', view: 'author', pairs: ['share', 'variables'] },
]

/** The feature each chapter opens with: drawn large, while the rest are listed. */
export const LEAD_FEATURES: Record<ChapterId, FeatureId> = {
  write: 'scene',
  connect: 'connections',
  remember: 'events',
  publish: 'share',
}

/**
 * A chapter's lead feature and the rest. The engine has a section of its own.
 */
export function chapterParts(chapter: ChapterId): { lead: FeatureInfo; rest: FeatureInfo[] } {
  const all = FEATURES.filter(feature => feature.chapter === chapter && feature.id !== 'engine')
  const lead = all.find(feature => feature.id === LEAD_FEATURES[chapter])!
  return { lead, rest: all.filter(feature => feature !== lead) }
}

export interface FeatureCopy {
  name: string
  title: string
  body: string
  /** What the author does. */
  author: string
  /** What the reader gets. */
  reader: string
}

export interface LandingCopy {
  ui: {
    catalogueEyebrow: string
    catalogueTitle: string
    catalogueDescription: string
    you: string
    reader: string
    learnMore: string
    pairsWith: string
    memoryLabel: string
    memoryEmpty: string
    enginePoints: string
    agentField: string
    deckStats: readonly [string, string, string]
    suitFilterLabel: string
    allSuits: string
    /** A plain FAQ heading. */
    faqTitle: string
    /** Heading of the compact list of the features no chapter draws large. */
    indexTitle: string
    /** Label over an example the reader can play. */
    playable: string
    /** The trust section's saving and history items, asked as questions. */
    trustQuestions: readonly [string, string]
    worksWithoutCode: string
  }
  chapters: Record<ChapterId, { name: string; title: string; description: string }>
  features: Record<FeatureId, FeatureCopy>
  art: {
    node: string
    crossroads: string
    crossroadsText: string
    forest: string
    river: string
    focusBold: string
    addImage: string
    letterText: string
    read: string
    hide: string
    market: string
    marketText: string
    firstVisit: string
    comingBack: string
    entryText: string
    entryAnswers: string
    buyLamp: string
    leave: string
    frame: string
    group: string
    scene1: string
    scene2: string
    scene3: string
    oneStory: string
    helpStranger: string
    takeKey: string
    trust: string
    hasKey: string
    remembers: string
    strangerNods: string
    coins: string
    secretPassage: string
    question: string
    property: string
    name: string
    readerName: string
    welcome: string
    previewTab: string
    editTab: string
    back: string
    shareTitle: string
    slug: string
    copyLink: string
    shareButton: string
    externalLinks: string
    endingText: string
    passOn: string
    moreStories: string
    plays: string
    date: string
    terminalChoice: string
  }
}
