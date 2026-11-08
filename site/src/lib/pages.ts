// Every page of the site, as a path without the language prefix. Each one is
// built in every language (see localeStaticPaths) and listed in the sitemap.
export const PAGES = {
  home: '',
  features: 'docs/features',
} as const

export type PagePath = (typeof PAGES)[keyof typeof PAGES]
