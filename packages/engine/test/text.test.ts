import { describe, expect, it } from 'vitest'
import { inlineHtml, interpolate, loadStory, plainText, PlayerState } from '../src'

const story = loadStory({
  nodes: [],
  refs: {
    stat_gold: { name: 'gold', type: 'stat', category: 'bag' },
    condition_key: { name: 'key', type: 'condition', category: 'bag' },
    condition_map: { name: 'map', type: 'condition', category: 'bag' },
  },
})
const player: PlayerState = {
  properties: { property_name: 'Ada', property_html: '<b>x</b>' },
  stats: { stat_gold: 5 },
  conditions: ['condition_key'],
}
const variable = (kind: string, key: string) =>
  `<span data-trama-variable="" data-kind="${kind}" data-key="${key}">#${key}</span>`

describe('interpolate', () => {
  it('leaves text without tokens untouched, including literal hashes and brackets', () => {
    expect(interpolate('Hi #property_name [bag]', story, player)).toBe('Hi #property_name [bag]')
    expect(interpolate('<p>#property_name</p>', story, player)).toBe('<p>#property_name</p>')
  })

  it('resolves rich text tokens and escapes player values', () => {
    const text = `<p>${variable('property', 'property_name')} has ${variable('stat', 'stat_gold')}</p>`
    expect(interpolate(text, story, player)).toBe('<p>Ada has 5</p>')
    expect(interpolate(`<p>${variable('property', 'property_html')}</p>`, story, player))
      .toBe('<p>&lt;b&gt;x&lt;/b&gt;</p>')
    expect(interpolate(`<p>${variable('condition', 'condition_map')}</p>`, story, player)).toBe('<p>-</p>')
  })

  it('does not interpolate inserted values twice, nor plain hashes or attributes inside HTML', () => {
    const tricky: PlayerState = { ...player, properties: { property_name: '<Ada> #property_html' } }
    expect(interpolate(`<p>${variable('property', 'property_name')}</p>`, story, tricky))
      .toBe('<p>&lt;Ada&gt; #property_html</p>')
    expect(interpolate('<p data-note="#property_name">#property_name</p>', story, player))
      .toBe('<p data-note="#property_name">#property_name</p>')
  })

  it('expands rich text categories and leaves ordinary HTML alone', () => {
    const text = '<p>#not_a_token</p><div data-trama-category="" data-key="bag">[bag]</div>'
    expect(interpolate(text, story, player))
      .toBe('<p>#not_a_token</p><div class="storyCategory__entries">Gold: 5\nKey</div>')
  })
})

describe('inlineHtml', () => {
  it('turns paragraphs into line breaks only when the text is all paragraphs', () => {
    expect(inlineHtml('<p>One <strong>a</strong> <em>b</em></p>\n<p>Two</p>')).toBe('One <strong>a</strong> <em>b</em><br>Two')
    expect(inlineHtml('<p>One</p><ul><li>x</li></ul>')).toBe('<p>One</p><ul><li>x</li></ul>')
    expect(inlineHtml('<p>One</p><div>Other content</div>')).toBe('<p>One</p><div>Other content</div>')
    expect(inlineHtml('Plain')).toBe('Plain')
    expect(inlineHtml('<pre>code</pre>')).toBe('<pre>code</pre>')
  })
})

describe('plainText', () => {
  it('strips markup and decodes entities', () => {
    expect(plainText('<p>&nbsp;</p>').trim()).toBe('')
    expect(plainText('<p><br></p>').trim()).toBe('')
    expect(plainText('<p>A &amp; B&#39;s</p>')).toBe('A & B\'s')
  })
})
