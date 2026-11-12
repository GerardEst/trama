// The complete landing catalogue: every capability of Trama, each with
// a one-sentence answer, a concrete example and its documentation.

export const ATLAS_CHAPTERS = ['write', 'connect', 'remember', 'publish', 'build'] as const
export type AtlasChapter = (typeof ATLAS_CHAPTERS)[number]

export const ATLAS_IDS = [
  'scene', 'rich-text', 'interpolation', 'focus', 'images',
  'connections', 'random', 'organisation',
  'events', 'requirements', 'distributors', 'input', 'variables',
  'preview', 'modes', 'share', 'endings', 'brand', 'analytics', 'safety',
  'engine', 'api', 'agents',
] as const
export type AtlasId = (typeof ATLAS_IDS)[number]

export type LiveId = 'scene' | 'connections' | 'random' | 'events' | 'requirements' | 'distributors' | 'input'

export const REPO = 'https://github.com/GerardEst/trama/blob/main'

export interface AtlasInfo {
  id: AtlasId
  chapter: AtlasChapter
  /** Chapter of /docs/features that explains it, when one exists. */
  docs?: string
  /** A reference outside the features page, for what has no chapter there. */
  reference?: string
  /** A story the reader can play in place, run by the real engine. */
  live?: LiveId
}

export const ATLAS: readonly AtlasInfo[] = [
  { id: 'scene', chapter: 'write', docs: 'content-nodes', live: 'scene' },
  { id: 'rich-text', chapter: 'write', docs: 'focus-mode' },
  { id: 'interpolation', chapter: 'write', docs: 'variables' },
  { id: 'focus', chapter: 'write', docs: 'focus-mode' },
  { id: 'images', chapter: 'write', docs: 'images' },
  { id: 'connections', chapter: 'connect', docs: 'connections', live: 'connections' },
  { id: 'random', chapter: 'connect', reference: `${REPO}/skills/trama-engine/references/story-format.md#joins`, live: 'random' },
  { id: 'organisation', chapter: 'connect', docs: 'organisation' },
  { id: 'events', chapter: 'remember', docs: 'events', live: 'events' },
  { id: 'requirements', chapter: 'remember', docs: 'requirements', live: 'requirements' },
  { id: 'distributors', chapter: 'remember', docs: 'distributors', live: 'distributors' },
  { id: 'input', chapter: 'remember', docs: 'player-input', live: 'input' },
  { id: 'variables', chapter: 'remember', docs: 'variables' },
  { id: 'preview', chapter: 'publish' },
  { id: 'modes', chapter: 'publish', reference: `${REPO}/skills/trama-engine/references/story-format.md#published-story` },
  { id: 'share', chapter: 'publish', docs: 'share-node' },
  { id: 'endings', chapter: 'publish', docs: 'share-node' },
  { id: 'brand', chapter: 'publish', reference: `${REPO}/skills/trama-engine/references/story-format.md#published-story` },
  { id: 'analytics', chapter: 'publish' },
  { id: 'safety', chapter: 'publish' },
  { id: 'engine', chapter: 'build', reference: `${REPO}/packages/engine/README.md` },
  { id: 'api', chapter: 'build', reference: `${REPO}/skills/trama-engine/references/story-format.md` },
  { id: 'agents', chapter: 'build', reference: `${REPO}/skills/README.md` },
]

export const COMPETITORS = ['twine', 'ink', 'choicescript', 'arcweave', 'articy'] as const
export type CompetitorId = (typeof COMPETITORS)[number]

export const COMPETITOR_NAMES: Record<CompetitorId, string> = {
  twine: 'Twine',
  ink: 'ink + Inky',
  choicescript: 'ChoiceScript',
  arcweave: 'Arcweave',
  articy: 'articy:draft X',
}

/** Where each cell of the comparison comes from: official pages only. */
export const COMPETITOR_SOURCES: Record<CompetitorId, readonly string[]> = {
  twine: ['https://twinery.org/', 'https://twinery.org/reference/en/publishing/publishing.html', 'https://twine2.neocities.org/'],
  ink: ['https://www.inklestudios.com/ink/'],
  choicescript: ['https://www.choiceofgames.com/make-your-own-games/choicescript-intro/', 'https://github.com/dfabulich/choicescript', 'https://www.choiceofgames.com/about-us/faq-2/', 'https://www.choiceofgames.com/make-your-own-games/exporting-and-publishing-your-game/'],
  arcweave: ['https://arcweave.com/', 'https://arcweave.com/pricing', 'https://arcweave.com/docs/1.0/arcscript', 'https://arcweave.com/docs/1.0/sharing', 'https://docs.arcweave.com/project-tools/export'],
  articy: ['https://www.articy.com/en/articydraft/free/', 'https://www.articy.com/help/Scripting_Conditions_Instructions.html', 'https://www.articy.com/en/articydraft-x-now-on-mac-os/'],
}

export const COMPARISON_CHECKED = '2026-11-09'

export const ROWS = ['editor', 'logic', 'link', 'stats', 'open', 'engines', 'file', 'team', 'price'] as const
export type RowId = (typeof ROWS)[number]

export interface AtlasCopy {
  meta: { title: string; description: string; definition: string }
  ui: {
    announceLabel: string
    announce: string
    audiences: { label: string; authors: string; developers: string }
    proofLabel: string
    proof: readonly [string, string, string, string]
    whatTitle: string
    whatUpdated: string
    playTitle: string
    playLead: string
    howEyebrow: string
    indexTitle: string
    indexLead: string
    example: string
    youSet: string
    result: string
    docs: string
    reference: string
    tryIt: string
    restart: string
    remembers: string
    nothingYet: string
    compareNav: string
    compareTitle: string
    compareLead: string
    compareCaption: string
    compareRow: string
    compareLegend: string
    compareChecked: string
    sources: string
    winsTitle: string
    buildTitle: string
    buildLead: string
    aiTitle: string
    aiLead: string
    aiLinks: readonly [string, string, string, string]
    faqTitle: string
  }
  facts: readonly { label: string; value: string }[]
  chapters: Record<AtlasChapter, { name: string; title: string; lead: string }>
  features: Record<AtlasId, { name: string; question: string; answer: string; example: string }>
  rows: Record<RowId, { label: string; trama: string } & Record<CompetitorId, string>>
  wins: readonly { title: string; body: string }[]
  faq: readonly { question: string; answer: string }[]
  art: {
    coin: string
    heads: string
    tails: string
    atRandom: string
    cumulative: string
    previousStep: string
    footerText: string
    footerLink: string
    hideLink: string
    yourBrand: string
    saved: string
    undo: string
    redo: string
    exportJson: string
    recovered: string
    customAddress: string
    stableLink: string
  }
  live: {
    forestEnd: string
    riverEnd: string
    leftMarket: string
    tossText: string
    headsEnd: string
    tailsEnd: string
    roomText: string
    roomEnd: string
    doorText: string
    doorEnd: string
    guardText: string
    guardHelp: string
    guardIgnore: string
    guardOpen: string
    guardShut: string
    trustRef: string
    keyRef: string
    lampsRef: string
    leave: string
  }
}
