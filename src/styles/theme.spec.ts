describe('shared application theme', () => {
  let pages: HTMLElement[]
  let previousTheme: string | undefined
  let previousStorybookTheme: string | undefined

  beforeEach(() => {
    previousTheme = document.documentElement.dataset['poloTheme']
    previousStorybookTheme = document.documentElement.dataset['storybookTheme']
    delete document.documentElement.dataset['poloTheme']
    delete document.documentElement.dataset['storybookTheme']
    pages = [
      'polo-dashboard', 'polo-stadistics', 'polo-profile-modal', 'polo-playground',
      'polo-landingpage', 'polo-login', 'polo-feature-guide', 'polo-share-story',
    ].map(selector => document.createElement(selector))
    document.body.append(...pages)
  })

  afterEach(() => {
    pages.forEach(page => page.remove())
    if (previousTheme) document.documentElement.dataset['poloTheme'] = previousTheme
    else delete document.documentElement.dataset['poloTheme']
    if (previousStorybookTheme) document.documentElement.dataset['storybookTheme'] = previousStorybookTheme
    else delete document.documentElement.dataset['storybookTheme']
  })

  // Resolve native light-dark() through a real color property, not its CSS source text.
  const color = (element: HTMLElement, token: string) => {
    const sample = document.createElement('span')
    sample.style.color = `var(${token})`
    element.append(sample)
    const value = getComputedStyle(sample).color
    sample.remove()
    return value
  }
  const surface = (element: HTMLElement) => color(element, '--polo-color-surface')

  it('uses one system palette for public pages, the editor, player and dialogs', () => {
    const expected = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'rgb(38, 46, 40)' : 'rgb(255, 254, 250)'
    pages.forEach(page => expect(surface(page)).toBe(expected))
  })

  it('applies an explicit preference to every page without page-specific overrides', () => {
    document.documentElement.dataset['poloTheme'] = 'dark'
    pages.forEach(page => expect(surface(page)).toBe('rgb(38, 46, 40)'))
    document.documentElement.dataset['poloTheme'] = 'light'
    pages.forEach(page => expect(surface(page)).toBe('rgb(255, 254, 250)'))
  })

  it('keeps legacy aliases and semantic tokens on the same palette in both variants', () => {
    for (const variant of ['light', 'dark'] as const) {
      document.documentElement.dataset['poloTheme'] = variant
      const page = pages[0]
      expect(color(page, '--light-gray')).toBe(surface(page))
      expect(color(page, '--text-color')).toBe(color(page, '--polo-color-text'))
      expect(color(page, '--important-color')).toBe(color(page, '--polo-color-focus'))
      expect(color(page, '--polo-color-canvas')).toBe(variant === 'light' ? 'rgb(251, 249, 244)' : 'rgb(27, 33, 29)')
    }
  })

  it('keeps amber actions readable in both variants', () => {
    for (const variant of ['light', 'dark'] as const) {
      document.documentElement.dataset['poloTheme'] = variant
      expect(color(pages[0], '--polo-color-accent')).toBe('rgb(246, 206, 106)')
      expect(color(pages[0], '--polo-color-text-on-accent')).toBe('rgb(37, 39, 32)')
    }
  })

  it('changes UI icons globally without filtering story images', () => {
    const icon = document.createElement('img')
    icon.setAttribute('src', '/assets/icons/plus.svg')
    const storyImage = document.createElement('img')
    storyImage.setAttribute('src', '/assets/images/landing/background.webp')
    pages[0].append(icon, storyImage)

    document.documentElement.dataset['poloTheme'] = 'dark'
    expect(getComputedStyle(icon).filter).toBe('brightness(0) invert(1)')
    expect(getComputedStyle(storyImage).filter).toBe('none')
    expect(getComputedStyle(pages[0]).getPropertyValue('--polo-icon-play')).toContain('play-white.svg')
    expect(getComputedStyle(pages[0]).getPropertyValue('--polo-icon-drag')).toContain('drag-white.svg')

    document.documentElement.dataset['poloTheme'] = 'light'
    expect(getComputedStyle(icon).filter).toBe('none')
    expect(getComputedStyle(pages[0]).getPropertyValue('--polo-icon-play')).toContain("'/assets/icons/play.svg'")
    expect(getComputedStyle(pages[0]).getPropertyValue('--polo-icon-drag')).toContain("'/assets/icons/drag.svg'")
  })

  it('lets Storybook choose a preference independently while sharing the same tokens', () => {
    const icon = document.createElement('img')
    icon.setAttribute('src', '/assets/icons/plus.svg')
    pages[0].append(icon)
    document.documentElement.dataset['poloTheme'] = 'dark'
    document.documentElement.dataset['storybookTheme'] = 'light'
    expect(surface(document.documentElement)).toBe('rgb(255, 254, 250)')
    expect(getComputedStyle(icon).filter).toBe('none')

    document.documentElement.dataset['poloTheme'] = 'light'
    document.documentElement.dataset['storybookTheme'] = 'dark'
    expect(surface(document.documentElement)).toBe('rgb(38, 46, 40)')
    expect(getComputedStyle(icon).filter).toBe('brightness(0) invert(1)')
  })
})
