// The features guide: groups of chapters, each with steps, an example and a note.
// Every language shares the same chapter ids, so deep links work in all of them.

export interface GuideFeature {
  id: string
  title: string
  summary: string
  steps: readonly string[]
  example: { label: string; lines: readonly string[] }
  note: string
}

export interface GuideGroup {
  title: string
  description: string
  features: readonly GuideFeature[]
}
