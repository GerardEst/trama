import { ComponentFixture, DeferBlockState, TestBed } from '@angular/core/testing'
import { RichTextFieldComponent } from './rich-text-field.component'
import { StoryEditorLoader, StoryEditorRuntime } from './story-editor-loader.service'
import * as runtime from './story-editor-runtime'

const settle = () => new Promise<void>(resolve => setTimeout(resolve, 0))

describe('RichTextFieldComponent', () => {
  let fixture: ComponentFixture<RichTextFieldComponent>

  // Inline editing starts when the preview gets focus, once the editor chunk is loaded.
  async function editInline() {
    fixture.debugElement.nativeElement.querySelector('.richTextField__preview').focus()
    await settle()
  }

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [RichTextFieldComponent] })
    await TestBed.inject(StoryEditorLoader).load()
    fixture = TestBed.createComponent(RichTextFieldComponent)
    fixture.componentRef.setInput('label', 'Node text')
    fixture.componentRef.setInput('text', '<p>Before</p>')
    fixture.detectChanges()
  })

  it('edits inline with Tiptap shortcuts and saves HTML when focus leaves', async () => {
    const field = fixture.componentInstance
    const save = jasmine.createSpy('save')
    field.saved.subscribe(save)
    const preview = (fixture.nativeElement as HTMLElement).querySelector('.richTextField__preview') as HTMLElement
    await editInline()
    const editor = field.inlineEditor!
    expect(editor).toBeDefined()
    expect(editor.view.dom.getAttribute('contenteditable')).toBe('true')
    editor.commands.setContent('<p></p>')
    editor.commands.focus('end')
    editor.view.dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'b', ctrlKey: true, bubbles: true, cancelable: true }))
    editor.commands.insertContent('Bold')
    expect(editor.getHTML()).toContain('<strong>Bold</strong>')
    editor.view.dom.dispatchEvent(new FocusEvent('blur'))
    await Promise.resolve()
    expect(save).toHaveBeenCalledWith('<p><strong>Bold</strong></p>')
    expect(preview.textContent).toBe('Bold')
  })

  it('flushes a focused draft before navigation and does not save it again on blur', async () => {
    const field = fixture.componentInstance
    const save = jasmine.createSpy('save')
    field.saved.subscribe(save)
    await editInline()
    field.inlineEditor!.commands.setContent('<p>Corrected</p>')
    field.commit()
    expect(save).toHaveBeenCalledOnceWith('<p>Corrected</p>')
    field.inlineEditor!.view.dom.dispatchEvent(new FocusEvent('blur'))
    await settle()
    expect(save).toHaveBeenCalledTimes(1)
  })

  it('flushes a focus-mode draft before the field is removed', async () => {
    const field = fixture.componentInstance
    const save = jasmine.createSpy('save')
    field.saved.subscribe(save)
    field.open()
    fixture.detectChanges()
    const [block] = await fixture.getDeferBlocks()
    await block.render(DeferBlockState.Complete)
    fixture.detectChanges()
    field.focusEditor!.editor!.commands.setContent('<p>Focused correction</p>')
    field.commit()
    expect(save).toHaveBeenCalledOnceWith('<p>Focused correction</p>')
    expect(field.openEditor).toBeFalse()
  })

  it('keeps the same line wrapping when inline editing starts', async () => {
    const html = '<p>A moderately long passage where the last few words  should wrap at exactly the same place.</p>'
    fixture.componentRef.setInput('text', html)
    fixture.detectChanges()
    const preview = (fixture.nativeElement as HTMLElement).querySelector('.richTextField__preview') as HTMLElement
    preview.style.width = '200px'
    const paragraph = preview.querySelector('p')!
    const before = paragraph.getBoundingClientRect()
    const fontSize = getComputedStyle(paragraph).fontSize
    const lineHeight = getComputedStyle(paragraph).lineHeight
    const whiteSpace = getComputedStyle(paragraph).whiteSpace
    const wordWrap = getComputedStyle(paragraph).overflowWrap
    await editInline()
    const editedParagraph = preview.querySelector('p')!
    const after = editedParagraph.getBoundingClientRect()
    expect(after.width).toBeCloseTo(before.width, 1)
    expect(after.height).toBeCloseTo(before.height, 1)
    expect(getComputedStyle(editedParagraph).fontSize).toBe(fontSize)
    expect(getComputedStyle(editedParagraph).lineHeight).toBe(lineHeight)
    expect(getComputedStyle(editedParagraph).whiteSpace).toBe(whiteSpace)
    expect(getComputedStyle(editedParagraph).overflowWrap).toBe(wordWrap)
  })

  it('preserves literal newlines from an existing text in inline and focus editing', async () => {
    fixture.componentRef.setInput('text', 'First line\nSecond line\n\nFourth line')
    fixture.detectChanges()
    const field = fixture.componentInstance
    const save = jasmine.createSpy('save')
    field.saved.subscribe(save)
    const expected = '<p>First line<br>Second line<br><br>Fourth line</p>'
    await editInline()
    expect(field.inlineEditor?.getHTML()).toBe(expected)
    field.open()
    fixture.detectChanges()
    const [block] = await fixture.getDeferBlocks()
    await block.render(DeferBlockState.Complete)
    fixture.detectChanges()
    const dialog = (fixture.nativeElement as HTMLElement).querySelector('dialog') as HTMLDialogElement
    expect(dialog.querySelector('.richTextEditor__content')?.innerHTML).toBe(expected)
    const closed = new Promise<void>(resolve => dialog.addEventListener('close', () => resolve(), { once: true }))
    dialog.close()
    await closed
    fixture.detectChanges()
    expect(save).not.toHaveBeenCalled()
  })

  it('preserves visible line breaks inside an existing HTML paragraph', async () => {
    fixture.componentRef.setInput('text', '<p>First line\nSecond line</p>')
    fixture.detectChanges()
    await editInline()
    expect(fixture.componentInstance.inlineEditor?.getHTML()).toBe('<p>First line<br>Second line</p>')
  })

  it('keeps the spacing after a heading with an empty paragraph when editing starts', async () => {
    fixture.componentRef.setInput('text', '<h2>A chapter heading</h2><p></p><p>The passage continues.</p>')
    fixture.detectChanges()
    const preview = (fixture.nativeElement as HTMLElement).querySelector('.richTextField__preview') as HTMLElement
    const before = preview.querySelectorAll('p')[0].getBoundingClientRect().height
    await editInline()
    const after = preview.querySelectorAll('p')[0].getBoundingClientRect().height
    expect(after).toBeCloseTo(before, 1)
  })

  it('does not add an empty line after a heading on entering inline editing', async () => {
    fixture.componentRef.setInput('text', '<h2>A chapter heading</h2>')
    fixture.detectChanges()
    await editInline()
    expect(fixture.componentInstance.inlineEditor?.getHTML()).toBe('<h2>A chapter heading</h2>')
  })

  it('does not save or rewrite rich text just by entering and leaving the field', async () => {
    const field = fixture.componentInstance
    const save = jasmine.createSpy('save')
    field.saved.subscribe(save)
    await editInline()
    field.inlineEditor!.view.dom.focus()
    field.inlineEditor!.view.dom.blur()
    await new Promise<void>(resolve => setTimeout(resolve, 0))
    expect(save).not.toHaveBeenCalled()
    expect(field.currentHtml).toBe('<p>Before</p>')
  })

  it('supports the default Ctrl+I shortcut without an inline toolbar', async () => {
    const field = fixture.componentInstance
    await editInline()
    const editor = field.inlineEditor!
    editor.commands.setContent('<p></p>')
    editor.commands.focus('end')
    editor.view.dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'i', ctrlKey: true, bubbles: true, cancelable: true }))
    editor.commands.insertContent('Italic')
    expect(editor.getHTML()).toContain('<em>Italic</em>')
    expect((fixture.nativeElement as HTMLElement).querySelector('.richTextEditor__toolbar')).toBeNull()
  })

  it('shows the placeholder in an empty preview without making it the field value', async () => {
    fixture.componentRef.setInput('text', '')
    fixture.componentRef.setInput('placeholder', 'Write the ending…')
    fixture.detectChanges()
    const preview = (fixture.nativeElement as HTMLElement).querySelector('.richTextField__preview') as HTMLElement
    expect(preview.textContent).toBe('')
    expect(preview.getAttribute('role')).toBe('textbox')
    expect(preview.getAttribute('aria-placeholder')).toBe('Write the ending…')
    expect(preview.getAttribute('aria-multiline')).toBe('true')
    expect(getComputedStyle(preview, '::before').content).toContain('Write the ending…')
  })

  it('keeps showing the placeholder while inline editing an empty field', async () => {
    fixture.componentRef.setInput('text', '')
    fixture.componentRef.setInput('placeholder', 'Write the ending…')
    fixture.detectChanges()
    await editInline()
    const editor = fixture.componentInstance.inlineEditor!
    const paragraph = editor.view.dom.querySelector('p') as HTMLElement
    expect(paragraph.classList).toContain('is-editor-empty')
    expect(paragraph.getAttribute('data-placeholder')).toBe('Write the ending…')
    expect(getComputedStyle(paragraph, '::before').content).toContain('Write the ending…')
    expect(editor.view.dom.getAttribute('aria-placeholder')).toBe('Write the ending…')
    expect(editor.view.dom.getAttribute('aria-multiline')).toBe('true')
  })

  it('saves an emptied field as empty text so the placeholder comes back', async () => {
    const field = fixture.componentInstance
    const save = jasmine.createSpy('save')
    field.saved.subscribe(save)
    const preview = (fixture.nativeElement as HTMLElement).querySelector('.richTextField__preview') as HTMLElement
    await editInline()
    const editor = field.inlineEditor!
    editor.commands.setContent('<p></p>')
    editor.view.dom.dispatchEvent(new FocusEvent('blur'))
    await Promise.resolve()
    fixture.detectChanges()
    expect(save).toHaveBeenCalledOnceWith('')
    expect(preview.childNodes.length).toBe(0)
  })

  it('opens focus with unsaved inline changes, without losing formatting', async () => {
    const field = fixture.componentInstance
    const save = jasmine.createSpy('save')
    field.saved.subscribe(save)
    await editInline()
    field.inlineEditor!.commands.setContent('<p><em>Rewritten</em></p>')
    field.open()
    expect(field.draft).toBe('<p><em>Rewritten</em></p>')
    expect(save).toHaveBeenCalledOnceWith(field.draft)
    expect(field.openEditor).toBeTrue()
  })
})

describe('RichTextFieldComponent while the editor downloads', () => {
  let fixture: ComponentFixture<RichTextFieldComponent>
  let field: RichTextFieldComponent
  let preview: HTMLElement
  let createStoryEditor: jasmine.Spy
  let finishLoading: () => void
  let failLoading: (error: Error) => void
  let load: jasmine.Spy

  function pendingLoad() {
    return new Promise<StoryEditorRuntime>((resolve, reject) => {
      finishLoading = () => resolve({ createStoryEditor } as unknown as StoryEditorRuntime)
      failLoading = reject
    })
  }

  function type(key: string) {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
    preview.dispatchEvent(event)
    return event
  }

  beforeEach(() => {
    createStoryEditor = jasmine.createSpy('createStoryEditor').and.callFake(runtime.createStoryEditor)
    load = jasmine.createSpy('load').and.callFake(pendingLoad)
    TestBed.configureTestingModule({
      imports: [RichTextFieldComponent],
      providers: [{ provide: StoryEditorLoader, useValue: { load, prefetch: () => load() } }],
    })
    fixture = TestBed.createComponent(RichTextFieldComponent)
    fixture.componentRef.setInput('label', 'Node text')
    fixture.componentRef.setInput('text', '<p>Before</p>')
    fixture.detectChanges()
    field = fixture.componentInstance
    preview = (fixture.nativeElement as HTMLElement).querySelector('.richTextField__preview') as HTMLElement
  })

  it('keeps the preview and replays printable keys typed before the editor arrives', async () => {
    preview.focus()
    fixture.detectChanges()
    expect(preview.getAttribute('aria-busy')).toBe('true')
    expect(preview.innerHTML).toBe('<p>Before</p>')
    for (const key of [' ', 'a', 'b']) expect(type(key).defaultPrevented).withContext(key).toBeTrue()
    expect(type('Enter').defaultPrevented).toBeFalse()
    finishLoading()
    await settle()
    fixture.detectChanges()
    expect(preview.getAttribute('aria-busy')).toBeNull()
    expect(field.inlineEditor?.getHTML()).toBe('<p>Before ab</p>')
    // Tiptap sets the selection at once but moves DOM focus on the next animation frame.
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
    expect(document.activeElement).toBe(field.inlineEditor!.view.dom)
  })

  it('starts downloading on pointer down, before focus arrives', () => {
    preview.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    expect(load).toHaveBeenCalled()
    expect(field.loadingEditor).toBeFalse()
  })

  it('does not mount the editor if focus left while it was loading', async () => {
    preview.focus()
    type('x')
    preview.blur()
    finishLoading()
    await settle()
    expect(createStoryEditor).not.toHaveBeenCalled()
    expect(field.inlineEditor).toBeUndefined()
    expect(field.loadingEditor).toBeFalse()
    expect(preview.innerHTML).toBe('<p>Before</p>')
  })

  it('lets focus mode win over an inline editor still loading', async () => {
    preview.focus()
    field.open()
    finishLoading()
    await settle()
    expect(createStoryEditor).not.toHaveBeenCalled()
    expect(field.openEditor).toBeTrue()
    expect(field.draft).toBe('<p>Before</p>')
  })

  it('does not mount into a field destroyed while loading', async () => {
    preview.focus()
    fixture.destroy()
    finishLoading()
    await settle()
    expect(createStoryEditor).not.toHaveBeenCalled()
  })

  it('keeps the preview after a failed load and retries on the next focus', async () => {
    const consoleError = spyOn(console, 'error')
    preview.focus()
    failLoading(new Error('chunk failed'))
    await settle()
    expect(consoleError).toHaveBeenCalled()
    expect(field.loadingEditor).toBeFalse()
    expect(preview.innerHTML).toBe('<p>Before</p>')

    preview.blur()
    preview.focus()
    finishLoading()
    await settle()
    expect(field.inlineEditor?.getHTML()).toBe('<p>Before</p>')
  })
})
