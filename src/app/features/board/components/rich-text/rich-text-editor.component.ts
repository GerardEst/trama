import { NgTemplateOutlet } from '@angular/common'
import { AfterViewInit, Component, ElementRef, OnChanges, OnDestroy, SimpleChanges, ViewChild, computed, input, output } from '@angular/core'
import type { Editor } from '@tiptap/core'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { createStoryEditor } from './story-editor-runtime'
import { storyEditorHtml, storyEditorValue } from './story-editor-html'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { RichTextToolbarComponent } from './rich-text-toolbar.component'

@Component({
  selector: 'polo-rich-text-editor',
  standalone: true,
  imports: [NgTemplateOutlet, RichTextToolbarComponent, TranslatePipe],
  templateUrl: './rich-text-editor.component.html',
  styleUrl: './rich-text-editor.component.css',
  host: { '(keydown.escape)': 'onEscape($event)' },
})
export class RichTextEditorComponent implements AfterViewInit, OnChanges, OnDestroy {
  readonly label = input.required<string>()
  readonly text = input.required<string>()
  readonly placeholder = input('')
  readonly inlineOnly = input(false)
  readonly embedded = input(false)
  readonly autoFocus = input(false)
  readonly showToolbar = input(true)
  readonly closed = output<string>()
  readonly saved = output<string>()
  readonly focused = output<void>()
  readonly ready = output<void>()
  @ViewChild('dialog') dialog?: ElementRef<HTMLDialogElement>
  @ViewChild('surface') surface!: ElementRef<HTMLElement>
  editor?: Editor
  dirty = false
  private lastText = ''
  private saveTimer?: ReturnType<typeof setTimeout>

  constructor(public activeStory: ActiveStoryService) {}

  readonly variables = computed(() => {
    const story = this.activeStory.entireTree()
    const refs = Object.entries(story.refs).filter(([, ref]) => ref.type === 'stat' || ref.type === 'condition')
      .map(([key, ref]) => ({ kind: ref.type, key, label: `#${ref.name}` }))
    const properties = story.nodes.filter(node => node.type === 'text')
      .map(node => node.userTextOptions?.property).filter((key): key is string => !!key)
    return [...refs, ...[...new Set(properties)].map(key => ({ kind: 'property', key, label: `#${key}` }))]
  })
  readonly categories = computed(() => this.activeStory.entireTree().categories)

  ngOnChanges(changes: SimpleChanges) {
    if (changes['text'] && this.editor && this.text() !== this.lastText) {
      this.cancelSave()
      this.dirty = false
      this.lastText = this.text()
      this.editor.commands.setContent(storyEditorHtml(this.text(), this.activeStory.entireTree().refs), { emitUpdate: false })
    }
  }

  ngAfterViewInit() {
    this.dialog?.nativeElement.showModal()
    this.lastText = this.text()
    // Both the focus dialog and the linear sheet load this through @defer.
    this.editor = createStoryEditor({
      element: this.surface.nativeElement,
      content: this.text(),
      refs: this.activeStory.entireTree().refs,
      label: this.label(),
      placeholder: this.placeholder(),
      inlineOnly: this.inlineOnly(),
      className: 'richTextEditor__content',
      onUpdate: () => {
        this.dirty = true
        if (this.embedded()) {
          this.cancelSave()
          this.saveTimer = setTimeout(() => this.commit(), 300)
        }
      },
      onBlur: () => {
        if (this.embedded()) this.commit()
        this.activeStory.endHistoryCoalescing()
      }
    })
    this.editor.on('focus', () => this.focused.emit())
    queueMicrotask(() => { if (this.editor && !this.editor.isDestroyed) this.ready.emit() })
    if (!this.embedded() || this.autoFocus()) this.editor.commands.focus('end')
  }

  ngOnDestroy() {
    this.cancelSave()
    this.editor?.destroy()
  }

  /** Flush an embedded sheet before navigation removes it. */
  commit() {
    this.cancelSave()
    if (!this.embedded() || !this.dirty || !this.editor) return
    this.lastText = storyEditorValue(this.editor)
    this.dirty = false
    this.saved.emit(this.lastText)
  }

  private cancelSave() {
    if (this.saveTimer !== undefined) clearTimeout(this.saveTimer)
    this.saveTimer = undefined
  }

  heading(level: 1 | 2 | 3) {
    this.editor?.chain().focus().toggleHeading({ level }).run()
  }

  paragraph() {
    this.editor?.chain().focus().setParagraph().run()
  }

  toggle(format: 'bold' | 'italic' | 'bulletList' | 'orderedList') {
    const chain = this.editor?.chain().focus()
    if (format === 'bold') chain?.toggleBold().run()
    if (format === 'italic') chain?.toggleItalic().run()
    if (format === 'bulletList') chain?.toggleBulletList().run()
    if (format === 'orderedList') chain?.toggleOrderedList().run()
  }

  insertVariable(value: string, select: HTMLSelectElement) {
    select.value = ''
    const variable = this.variables().find(item => `${item.kind}:${item.key}` === value)
    if (variable) this.editor?.chain().focus().insertContent({ type: 'storyVariable', attrs: variable }).run()
  }

  insertCategory(key: string, select: HTMLSelectElement) {
    select.value = ''
    const category = this.categories().find(item => item.id === key)
    if (category) this.editor?.chain().focus().insertContent({ type: 'storyCategory', attrs: { key, label: `[${category.name}]` } }).run()
  }

  close() { this.dialog?.nativeElement.close() }
  onEscape(event: Event) {
    if (this.embedded()) return
    event.preventDefault()
    event.stopPropagation()
    this.close()
  }
  onBackdropPointerDown(event: PointerEvent) {
    if (event.target === this.dialog?.nativeElement) this.close()
  }
  onClosed() { this.closed.emit(this.dirty && this.editor ? storyEditorValue(this.editor) : this.text()) }
}
