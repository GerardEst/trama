import { Component, ElementRef, OnChanges, OnDestroy, SimpleChanges, ViewChild, input, output } from '@angular/core'
import type { Editor } from '@tiptap/core'
import { BasicButtonComponent } from 'src/app/shared/components/ui/basic-button/basic-button.component'
import { RichTextEditorComponent } from './rich-text-editor.component'
import { StoryEditorLoader, StoryEditorRuntime } from './story-editor-loader.service'
import { storyEditorValue } from './story-editor-html'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { I18nService } from 'src/app/core/i18n/i18n.service'

@Component({
  selector: 'polo-rich-text-field',
  standalone: true,
  imports: [BasicButtonComponent, RichTextEditorComponent, TranslatePipe],
  templateUrl: './rich-text-field.component.html',
  styleUrl: './rich-text-field.component.sass',
})
export class RichTextFieldComponent implements OnChanges, OnDestroy {
  readonly label = input.required<string>()
  readonly text = input('')
  readonly placeholder = input<string>()
  readonly inlineOnly = input(false)
  readonly saved = output<string>()
  @ViewChild('preview') preview?: ElementRef<HTMLElement>
  openEditor = false
  draft = ''
  currentHtml = ''
  inlineEditor?: Editor
  loadingEditor = false
  private inlineDirty = false
  // Bumped to invalidate an editor load still in flight (focus mode opened, destroyed…).
  private loadGeneration = 0
  // Characters typed on the preview while the editor chunk is still downloading.
  private pendingText = ''

  constructor(
    private editorLoader: StoryEditorLoader,
    private i18n: I18nService
  ) {}

  placeholderText() {
    return this.placeholder() ?? this.i18n.t('board.editor.placeholder')
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['text'] && !this.inlineEditor) this.currentHtml = this.text()
  }

  ngOnDestroy() {
    this.cancelEditorLoad()
    this.inlineEditor?.destroy()
  }

  focusPreview() { this.preview?.nativeElement.focus() }

  // A press on the preview comes just before its focus; start downloading the editor then.
  prepareInlineEdit() { this.editorLoader.prefetch() }

  async startInlineEdit() {
    if (this.inlineEditor || this.openEditor || this.loadingEditor || !this.preview) return
    const generation = ++this.loadGeneration
    this.loadingEditor = true
    let runtime: StoryEditorRuntime
    try {
      runtime = await this.editorLoader.load()
    } catch (error) {
      if (generation === this.loadGeneration) this.cancelEditorLoad()
      console.error('Could not load the text editor', error)
      return
    }
    if (generation !== this.loadGeneration) return
    const pendingText = this.pendingText
    this.cancelEditorLoad()
    // The preview keeps its content until here, so leaving the field while loading changes nothing.
    const preview = this.preview?.nativeElement
    if (this.inlineEditor || this.openEditor || !preview || document.activeElement !== preview) return

    this.inlineDirty = false
    preview.replaceChildren()
    const editor = runtime.createStoryEditor({
      element: preview,
      content: this.currentHtml,
      label: this.label(),
      placeholder: this.placeholderText(),
      inlineOnly: this.inlineOnly(),
      onUpdate: () => { this.inlineDirty = true },
      onBlur: () => {
        if (this.inlineDirty) {
          this.currentHtml = storyEditorValue(editor)
          this.saved.emit(this.currentHtml)
          this.inlineDirty = false
        }
        queueMicrotask(() => {
          if (this.inlineEditor === editor && !editor.isFocused) this.destroyInlineEditor()
        })
      },
    })
    this.inlineEditor = editor
    editor.commands.focus('end')
    if (pendingText) editor.commands.insertContent(pendingText)
  }

  private cancelEditorLoad() {
    this.loadGeneration++
    this.loadingEditor = false
    this.pendingText = ''
  }

  private destroyInlineEditor() {
    this.inlineEditor?.destroy()
    this.inlineEditor = undefined
    if (this.preview) this.preview.nativeElement.innerHTML = this.currentHtml
  }

  open() {
    if (this.openEditor) return
    if (this.loadingEditor) this.cancelEditorLoad()
    if (this.inlineEditor) {
      if (this.inlineDirty) {
        this.currentHtml = storyEditorValue(this.inlineEditor)
        this.saved.emit(this.currentHtml)
      }
      this.destroyInlineEditor()
    }
    this.draft = this.currentHtml
    this.openEditor = true
  }

  onKeydown(event: KeyboardEvent) {
    const modifier = event.ctrlKey || event.metaKey
    if (modifier && !event.altKey && !event.shiftKey && event.key.toLowerCase() === 'f') {
      event.preventDefault()
      this.open()
      return
    }
    // Only printable characters are replayed; Enter, Backspace and shortcuts pressed
    // while the editor downloads are not.
    if (this.loadingEditor && event.target === this.preview?.nativeElement &&
      event.key.length === 1 && !modifier && !event.altKey && !event.isComposing) {
      event.preventDefault()
      this.pendingText += event.key
    }
  }

  onClosed(html: string) {
    this.openEditor = false
    if (html !== this.draft) {
      this.currentHtml = html
      this.saved.emit(html)
    }
  }
}
