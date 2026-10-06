import { Node } from '@tiptap/core'
import { Placeholder } from '@tiptap/extensions'
import StarterKit from '@tiptap/starter-kit'

export function storyEditorExtensions(inlineOnly: boolean, placeholder = '') {
  return [
    Placeholder.configure({ placeholder }),
    StarterKit.configure({
      link: false,
      // Otherwise opening a heading/list silently appends an empty paragraph.
      trailingNode: false,
      ...(inlineOnly ? {
        heading: false, bulletList: false, orderedList: false, listItem: false,
        blockquote: false, codeBlock: false, horizontalRule: false,
      } : {}),
    }),
    StoryVariable,
    // Existing category tokens must survive correction even in answer fields.
    // The inline-only toolbar still does not offer block/category insertion.
    StoryCategory,
  ]
}

export const StoryVariable = Node.create({
  name: 'storyVariable',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,
  addAttributes() {
    return {
      kind: { default: 'property', parseHTML: element => element.getAttribute('data-kind') },
      key: { default: '', parseHTML: element => element.getAttribute('data-key') },
      label: { default: '', parseHTML: element => element.textContent },
    }
  },
  parseHTML() { return [{ tag: 'span[data-trama-variable]' }] },
  renderHTML({ node }) {
    return ['span', {
      'data-trama-variable': '',
      'data-kind': node.attrs['kind'],
      'data-key': node.attrs['key'],
      class: 'storyVariable',
    }, node.attrs['label']]
  },
})

export const StoryCategory = Node.create({
  name: 'storyCategory',
  group: 'block',
  atom: true,
  selectable: true,
  addAttributes() {
    return {
      key: { default: '', parseHTML: element => element.getAttribute('data-key') },
      label: { default: '', parseHTML: element => element.textContent },
    }
  },
  parseHTML() { return [{ tag: 'div[data-trama-category]' }] },
  renderHTML({ node }) {
    return ['div', {
      'data-trama-category': '',
      'data-key': node.attrs['key'],
      class: 'storyCategory',
    }, node.attrs['label']]
  },
})
