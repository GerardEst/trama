import { frameColorToken, isFrameColor, samePalette } from './frame-colors'

describe('Frame colors', () => {
  it('renders preset tokens and only accepts preset IDs as presets', () => {
    expect(frameColorToken('mint')).toBe('var(--polo-color-frame-mint)')
    expect(isFrameColor('mint')).toBeTrue()
    expect(isFrameColor('#aabbcc')).toBeFalse()
  })

  it('compares palettes by content so tree clones do not count as changes', () => {
    const palette = [{ id: 'battle', name: 'Battle', value: '#112233' as const }]
    expect(samePalette(palette, structuredClone(palette))).toBeTrue()
    expect(samePalette(palette, [{ ...palette[0], name: 'Fight' }])).toBeFalse()
    expect(samePalette(palette, [])).toBeFalse()
  })

  it('resolves stable palette IDs before presets without allowing overrides to the default', () => {
    const palette = [
      { id: 'battle', name: 'Battle', value: '#112233' as const },
      { id: 'mint', name: 'Conversation', value: '#445566' as const },
      { id: 'default', name: 'Invalid default override', value: '#abcdef' as const },
      { id: 'unsafe', name: 'Invalid hex', value: '#invalid' as const },
    ]
    expect(frameColorToken('battle', palette)).toBe('#112233')
    expect(frameColorToken('mint', palette)).toBe('#445566')
    expect(frameColorToken('default', palette)).toBe('var(--polo-color-border-hover)')
    expect(frameColorToken('unsafe', palette)).toBe('var(--polo-color-border-hover)')
    expect(frameColorToken('missing', palette)).toBe('var(--polo-color-border-hover)')
  })

  it('falls back safely for missing or invalid persisted colors', () => {
    for (const color of [undefined, 'unknown', 'red', '#123', '#aabbcc', 'url(example)']) {
      expect(frameColorToken(color)).toBe('var(--polo-color-border-hover)')
    }
  })
})
