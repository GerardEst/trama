import { Editor } from '@tiptap/core'
import { storyEditorExtensions } from './story-token.extensions'
import { storyEditorHtml } from './story-editor-html'
import type { ref } from 'src/app/core/interfaces/interfaces'

export interface StoryEditorOptions {
  element: HTMLElement
  content: string
  refs?: Record<string, ref>
  label: string
  placeholder: string
  inlineOnly: boolean
  className?: string
  onUpdate?: () => void
  onBlur?: () => void
}

// The only module that imports Tiptap at runtime. Load it through StoryEditorLoader so
// pages that merely show a board (like the landing) never download the editor.
export function createStoryEditor(options: StoryEditorOptions): Editor {
  return new Editor({
    element: options.element,
    extensions: storyEditorExtensions(options.inlineOnly, options.placeholder),
    content: storyEditorHtml(options.content, options.refs),
    editorProps: {
      attributes: {
        role: 'textbox',
        'aria-label': options.label,
        'aria-multiline': 'true',
        ...(options.placeholder ? { 'aria-placeholder': options.placeholder } : {}),
        ...(options.className ? { class: options.className } : {}),
      },
    },
    onUpdate: () => options.onUpdate?.(),
    onBlur: () => options.onBlur?.(),
  })
}
