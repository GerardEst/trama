import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { StoryCategory, StoryVariable } from './story-token.extensions'

describe('Story tokens', () => {
  it('survive HTML editing and reopening without losing their identity', () => {
    const html = '<p>Hello <span data-trama-variable="" data-kind="property" data-key="name">#name</span></p>' +
      '<div data-trama-category="" data-key="inventory">[Inventory]</div>'
    const createEditor = (content: string) => new Editor({
      element: document.createElement('div'),
      extensions: [StarterKit, StoryVariable, StoryCategory],
      content,
    })
    const first = createEditor(html)
    const saved = first.getHTML()
    const reopened = createEditor(saved)
    expect(reopened.getJSON().content?.[0].content?.[1]).toEqual(jasmine.objectContaining({
      type: 'storyVariable', attrs: jasmine.objectContaining({ key: 'name', kind: 'property' }),
    }))
    expect(reopened.getJSON().content?.[1]).toEqual(jasmine.objectContaining({
      type: 'storyCategory', attrs: jasmine.objectContaining({ key: 'inventory' }),
    }))
    first.destroy()
    reopened.destroy()
  })
})
