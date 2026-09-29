import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, computed, input, output } from '@angular/core'
import type { Editor } from '@tiptap/core'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { createStoryEditor } from './story-editor-runtime'
import { storyEditorValue } from './story-editor-html'

@Component({
  selector: 'polo-rich-text-editor',
  standalone: true,
  templateUrl: './rich-text-editor.component.html',
  styleUrl: './rich-text-editor.component.sass',
  host: { '(keydown.escape)': 'onEscape($event)' },
})
export class RichTextEditorComponent implements AfterViewInit, OnDestroy {
  readonly label = input.required<string>()
  readonly text = input.required<string>()
  readonly placeholder = input('')
  readonly inlineOnly = input(false)
  readonly closed = output<string>()
  @ViewChild('dialog') dialog!: ElementRef<HTMLDialogElement>
  @ViewChild('surface') surface!: ElementRef<HTMLElement>
  editor?: Editor
  dirty = false

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

  ngAfterViewInit() {
    this.dialog.nativeElement.showModal()
    // Rendered only inside the field's @defer block, so this static import stays lazy.
    this.editor = createStoryEditor({
      element: this.surface.nativeElement,
      content: this.text(),
      label: this.label(),
      placeholder: this.placeholder(),
      inlineOnly: this.inlineOnly(),
      className: 'richTextEditor__content',
      onUpdate: () => { this.dirty = true },
    })
    this.editor.commands.focus('end')
  }

  ngOnDestroy() { this.editor?.destroy() }

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

  close() { this.dialog.nativeElement.close() }
  onEscape(event: Event) {
    event.preventDefault()
    event.stopPropagation()
    this.close()
  }
  onBackdropPointerDown(event: PointerEvent) {
    if (event.target === this.dialog.nativeElement) this.close()
  }
  onClosed() { this.closed.emit(this.dirty && this.editor ? storyEditorValue(this.editor) : this.text()) }
}
