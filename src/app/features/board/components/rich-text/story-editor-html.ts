import type { Editor } from '@tiptap/core'

// An emptied editor still returns '<p></p>'; store it as empty so placeholders and
// "has text" checks treat it as blank.
export function storyEditorValue(editor: Editor): string {
  return editor.isEmpty ? '' : editor.getHTML()
}
