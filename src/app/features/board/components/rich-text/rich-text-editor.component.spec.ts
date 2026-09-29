import { ComponentFixture, TestBed } from '@angular/core/testing'
import { RichTextEditorComponent } from './rich-text-editor.component'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'

describe('RichTextEditorComponent', () => {
  let fixture: ComponentFixture<RichTextEditorComponent>

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [RichTextEditorComponent] })
    fixture = TestBed.createComponent(RichTextEditorComponent)
    fixture.componentRef.setInput('label', 'Node text')
    fixture.componentRef.setInput('text', '<p>A passage</p>')
    fixture.componentRef.setInput('placeholder', 'Write a passage…')
    fixture.detectChanges()
  })

  afterEach(async () => {
    const dialog = fixture.componentInstance.dialog.nativeElement
    if (dialog.open) {
      const closed = new Promise<void>(resolve => dialog.addEventListener('close', () => resolve(), { once: true }))
      fixture.componentInstance.close()
      await closed
    }
    fixture.destroy()
  })

  it('offers paragraphs, three heading levels, and both list types in focus mode', () => {
    const host = fixture.nativeElement as HTMLElement
    const toolbar = host.querySelector('.richTextEditor__toolbar') as HTMLElement
    for (const label of ['Bold', 'Italic', 'Paragraph', 'Heading 1', 'Heading 2', 'Heading 3', 'Bullet list', 'Numbered list']) {
      expect(toolbar.querySelector(`button[aria-label="${label}"]`)).withContext(label).not.toBeNull()
    }
    toolbar.querySelector<HTMLButtonElement>('button[aria-label="Heading 1"]')!.click()
    expect(fixture.componentInstance.editor?.getHTML()).toBe('<h1>A passage</h1>')
    toolbar.querySelector<HTMLButtonElement>('button[aria-label="Heading 3"]')!.click()
    expect(fixture.componentInstance.editor?.getHTML()).toBe('<h3>A passage</h3>')
    toolbar.querySelector<HTMLButtonElement>('button[aria-label="Paragraph"]')!.click()
    expect(fixture.componentInstance.editor?.getHTML()).toBe('<p>A passage</p>')
    toolbar.querySelector<HTMLButtonElement>('button[aria-label="Bullet list"]')!.click()
    expect(fixture.componentInstance.editor?.getHTML()).toContain('<ul>')
    toolbar.querySelector<HTMLButtonElement>('button[aria-label="Numbered list"]')!.click()
    expect(fixture.componentInstance.editor?.getHTML()).toContain('<ol>')
  })

  it('keeps empty paragraphs after headings at the same line height as on the board', () => {
    fixture.componentInstance.editor?.commands.setContent('<h2>Title</h2><p></p><p>Body</p>')
    const empty = (fixture.nativeElement as HTMLElement).querySelector('.richTextEditor__content > p') as HTMLElement
    const boardPreview = document.createElement('div')
    boardPreview.className = 'richTextField__preview'
    boardPreview.style.lineHeight = '1.5'
    boardPreview.innerHTML = '<h2>Title</h2><p></p><p>Body</p>'
    document.body.append(boardPreview)
    try {
      const difference = Math.abs(empty.getBoundingClientRect().height - boardPreview.querySelector('p')!.getBoundingClientRect().height)
      expect(difference).toBeLessThan(1)
    } finally {
      boardPreview.remove()
    }
  })

  it('caches available references and refreshes them when the story changes', () => {
    const editor = fixture.componentInstance
    const firstVariables = editor.variables()
    const firstCategories = editor.categories()
    expect(editor.variables()).toBe(firstVariables)
    expect(editor.categories()).toBe(firstCategories)

    TestBed.inject(ActiveStoryService).load('test-story', 'Story', {
      refs: { stat_gold: { name: 'gold', type: 'stat', category: 'inventory' } },
      nodes: [{ id: 'node_0', type: 'text', top: 0, left: 0, userTextOptions: { property: 'alias' } }],
      categories: [{ id: 'inventory', name: 'Inventory' }],
    })
    fixture.detectChanges()

    expect(editor.variables()).not.toBe(firstVariables)
    expect(editor.variables().map(variable => variable.label)).toEqual(['#gold', '#alias'])
    expect(editor.categories().map(category => category.name)).toEqual(['Inventory'])
    expect((fixture.nativeElement as HTMLElement).querySelector('select[aria-label="Insert category"] option[value="inventory"]'))
      .not.toBeNull()
  })

  it('shows the placeholder once the passage is emptied and closes with empty text', async () => {
    const component = fixture.componentInstance
    const closed = jasmine.createSpy('closed')
    component.closed.subscribe(closed)
    const content = component.editor!.view.dom
    expect(content.getAttribute('aria-placeholder')).toBe('Write a passage…')
    expect(content.querySelector('.is-editor-empty')).toBeNull()
    component.editor!.commands.setContent('<p></p>')
    const paragraph = content.querySelector('p') as HTMLElement
    expect(paragraph.classList).toContain('is-editor-empty')
    expect(getComputedStyle(paragraph, '::before').content).toContain('Write a passage…')
    const dialog = component.dialog.nativeElement
    const dialogClosed = new Promise<void>(resolve => dialog.addEventListener('close', () => resolve(), { once: true }))
    component.close()
    await dialogClosed
    expect(closed).toHaveBeenCalledOnceWith('')
  })

  it('leaves space between the toolbar divider and the writing area', () => {
    const surface = (fixture.nativeElement as HTMLElement).querySelector('.richTextEditor__surface') as HTMLElement
    expect(parseFloat(getComputedStyle(surface).marginTop)).toBeGreaterThanOrEqual(18)
  })
})
