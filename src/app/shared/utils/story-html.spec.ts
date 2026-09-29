import { storyInlineHtml, storyPlainText } from './story-html'

describe('story HTML helpers', () => {
  it('turns answer paragraphs into phrasing content without dropping formatting', () => {
    expect(storyInlineHtml('<p>One <strong>bold</strong></p><p>Two</p>'))
      .toBe('One <strong>bold</strong><br>Two')
    expect(storyInlineHtml('Plain answer')).toBe('Plain answer')
  })

  it('leaves unsupported mixed HTML intact instead of dropping content', () => {
    const html = '<p>One</p><div>Other content</div>'
    expect(storyInlineHtml(html)).toBe(html)
  })

  it('extracts text for tracking and sharing', () => {
    expect(storyPlainText('<p>Hello <strong>Ada</strong></p>')).toBe('Hello Ada')
  })
})
