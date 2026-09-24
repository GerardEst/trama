describe('authoring theme', () => {
  let dashboard: HTMLElement
  let statistics: HTMLElement
  let account: HTMLElement
  let playground: HTMLElement
  let previousTheme: string | undefined
  let previousStorybookTheme: string | undefined

  beforeEach(() => {
    previousTheme = document.documentElement.dataset['poloTheme']
    previousStorybookTheme = document.documentElement.dataset['storybookTheme']
    delete document.documentElement.dataset['poloTheme']
    delete document.documentElement.dataset['storybookTheme']
    dashboard = document.createElement('polo-dashboard')
    statistics = document.createElement('polo-stadistics')
    account = document.createElement('polo-profile-modal')
    playground = document.createElement('polo-playground')
    document.body.append(dashboard, statistics, account, playground)
  })

  afterEach(() => {
    dashboard.remove()
    statistics.remove()
    account.remove()
    playground.remove()
    if (previousTheme) document.documentElement.dataset['poloTheme'] = previousTheme
    else delete document.documentElement.dataset['poloTheme']
    if (previousStorybookTheme) document.documentElement.dataset['storybookTheme'] = previousStorybookTheme
    else delete document.documentElement.dataset['storybookTheme']
  })

  const surface = (element: HTMLElement) =>
    getComputedStyle(element).getPropertyValue('--polo-color-surface').trim()

  it('follows the system scheme without changing public stories', () => {
    const dark = window.matchMedia('(prefers-color-scheme: dark)').matches
    expect(surface(dashboard)).toBe(dark ? '#232d3d' : '#ffffff')
    expect(surface(playground)).toBe('#ffffff')
  })

  it('allows a saved preference to override the system on both authoring pages', () => {
    document.documentElement.dataset['poloTheme'] = 'dark'
    expect(surface(dashboard)).toBe('#232d3d')
    expect(surface(statistics)).toBe('#232d3d')
    expect(surface(account)).toBe('#232d3d')

    document.documentElement.dataset['poloTheme'] = 'light'
    expect(surface(dashboard)).toBe('#ffffff')
    expect(surface(statistics)).toBe('#ffffff')
    expect(surface(account)).toBe('#ffffff')
    expect(surface(playground)).toBe('#ffffff')
  })

  it('turns only authoring icons white in dark mode', () => {
    const icon = document.createElement('img')
    icon.setAttribute('src', '/assets/icons/plus.svg')
    const storyImage = document.createElement('img')
    storyImage.setAttribute('src', '/assets/images/landing/background.webp')
    dashboard.append(icon, storyImage)

    document.documentElement.dataset['poloTheme'] = 'dark'
    expect(getComputedStyle(icon).filter).toBe('brightness(0) invert(1)')
    expect(getComputedStyle(storyImage).filter).toBe('none')
    expect(getComputedStyle(dashboard).getPropertyValue('--polo-icon-play')).toContain('play-white.svg')
    expect(getComputedStyle(dashboard).getPropertyValue('--polo-icon-drag')).toContain('drag-white.svg')

    document.documentElement.dataset['poloTheme'] = 'light'
    expect(getComputedStyle(icon).filter).toBe('none')
    expect(getComputedStyle(dashboard).getPropertyValue('--polo-icon-play')).toBe('')
  })

  it('themes the Storybook canvas independently of the app preference', () => {
    const icon = document.createElement('img')
    icon.setAttribute('src', '/assets/icons/plus.svg')
    document.body.append(icon)
    try {
      document.documentElement.dataset['storybookTheme'] = 'dark'
      expect(surface(document.documentElement)).toBe('#232d3d')
      expect(getComputedStyle(icon).filter).toBe('brightness(0) invert(1)')

      document.documentElement.dataset['storybookTheme'] = 'light'
      expect(surface(document.documentElement)).toBe('#ffffff')
      expect(getComputedStyle(icon).filter).toBe('none')
    } finally {
      icon.remove()
    }
  })
})
