import { storyPlainText } from './story-html'

describe('story HTML helpers', () => {
  it('extracts text for tracking and sharing', () => {
    expect(storyPlainText('<p>Hello <strong>Ada</strong></p>')).toBe('Hello Ada')
  })
})
