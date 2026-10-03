import { ComponentFixture, DeferBlockState, TestBed } from '@angular/core/testing'

import { NodeComponent } from './node.component'
import { BoardAnchorRegistryService } from '../../services/board-anchor-registry.service'
import { PanzoomService } from '../../services/panzoom.service'
import { DatabaseService } from 'src/app/core/services/database.service'
import { ApisService } from 'src/app/core/services/apis.service'
import { StoryEditorService } from '../../services/story-editor.service'

describe('NodeComponent', () => {
  let component: NodeComponent
  let fixture: ComponentFixture<NodeComponent>

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NodeComponent],
      providers: [BoardAnchorRegistryService, PanzoomService],
    })
    fixture = TestBed.createComponent(NodeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('reorders only from answer handles, refreshes joins and retains keyboard focus', () => {
    const editor = TestBed.inject(StoryEditorService)
    const reorder = spyOn(editor, 'reorderAnswer').and.returnValue(true)
    const refresh = spyOn(TestBed.inject(BoardAnchorRegistryService), 'invalidate')
    fixture.componentRef.setInput('nodeId', 'node_7')
    const answers = [{ id: 'answer_7_0', text: 'First' }, { id: 'answer_7_1', text: 'Second' }]
    fixture.componentRef.setInput('answers', answers)
    fixture.detectChanges()
    const host = fixture.nativeElement as HTMLElement
    const handle = host.querySelector<HTMLButtonElement>('[data-sortable-handle]')!
    handle.focus()
    handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    expect(reorder).toHaveBeenCalledOnceWith('node_7', 'answer_7_0', 1)
    expect(refresh).toHaveBeenCalled()
    fixture.componentRef.setInput('answers', [...answers].reverse())
    fixture.detectChanges()
    expect(document.activeElement).toBe(handle)
    expect(host.querySelector('[role="status"]')?.textContent).toContain('position 2 of 2')
    expect(host.querySelector('polo-answer')?.getAttribute('data-sortable-id')).toBe('answer_7_1')

    fixture.componentRef.setInput('answers', [answers[0]])
    fixture.detectChanges()
    expect(host.querySelector('[data-sortable-handle]')).toBeNull()
  })

  it('reorders distributor routes, updates numbering and keeps the fallback outside the sortable list', () => {
    const reorder = spyOn(TestBed.inject(StoryEditorService), 'reorderCondition').and.returnValue(true)
    const refresh = spyOn(TestBed.inject(BoardAnchorRegistryService), 'invalidate')
    fixture.componentRef.setInput('nodeId', 'node_7')
    fixture.componentRef.setInput('type', 'distributor')
    const conditions = [{ id: 'condition_7_0', value: 1 }, { id: 'condition_7_1', value: 2 }]
    fixture.componentRef.setInput('conditions', conditions)
    fixture.detectChanges()
    const host = fixture.nativeElement as HTMLElement
    const handle = host.querySelector<HTMLButtonElement>('[data-sortable-handle]')!
    handle.focus()
    handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }))
    expect(reorder).toHaveBeenCalledOnceWith('node_7', 'condition_7_0', 1)
    expect(refresh).toHaveBeenCalled()
    fixture.componentRef.setInput('conditions', [...conditions].reverse())
    fixture.detectChanges()
    expect(document.activeElement).toBe(handle)
    const routes = host.querySelectorAll('[data-sortable-id]')
    expect(routes[0].getAttribute('data-sortable-id')).toBe('condition_7_1')
    expect(routes[0].querySelector('strong')?.textContent).toBe('Route 1')
    expect(routes[1].querySelector('strong')?.textContent).toBe('Route 2')
    expect(host.querySelector('[role="status"]')?.textContent).toContain('position 2 of 2')
    const fallback = host.querySelector('.condition--fallback')!.parentElement!
    expect(fallback.closest('[poloSortableList]')).toBeNull()
    expect(fallback.querySelector('[data-sortable-handle]')).toBeNull()
    fixture.componentRef.setInput('conditions', [conditions[0]])
    fixture.detectChanges()
    expect(host.querySelector('[data-sortable-handle]')).toBeNull()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('shows a saved name above the node type, drags from the name and edits on click', () => {
    const editor = TestBed.inject(StoryEditorService)
    const update = spyOn(editor, 'updateNodeName')
    fixture.componentRef.setInput('nodeId', 'node_7')
    fixture.componentRef.setInput('name', 'The crossroads')
    fixture.componentRef.setInput('type', 'end')
    fixture.detectChanges()

    const host = fixture.nativeElement as HTMLElement
    const input = host.querySelector<HTMLInputElement>('.node__name input')!
    expect(input.value).toBe('The crossroads')
    expect(host.querySelector('.node__type')?.textContent).toBe('End node')
    const pointerDown = jasmine.createSpy('pointerDown')
    host.addEventListener('pointerdown', pointerDown)
    input.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    expect(pointerDown).toHaveBeenCalledTimes(1)
    input.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    fixture.detectChanges()
    expect(document.activeElement).toBe(input)
    expect(input.readOnly).toBeFalse()

    input.value = 'A new ending'
    input.dispatchEvent(new Event('change'))
    expect(update).toHaveBeenCalledOnceWith('node_7', 'A new ending')

    fixture.componentRef.setInput('name', undefined)
    fixture.detectChanges()
    expect(input.placeholder).toBe('node_7')
    expect(getComputedStyle(input, '::placeholder').color).not.toBe(getComputedStyle(input).color)
    fixture.componentRef.setInput('name', 'node_7')
    fixture.detectChanges()
    expect(input.value).toBe('')
    expect(host.querySelector('.node__footer')?.textContent).not.toContain('node_7')
  })

  it('opens the shortcut image input through the existing upload handler', () => {
    const host = fixture.nativeElement as HTMLElement
    const input = host.querySelector<HTMLInputElement>('.node__shortcutImageInput')!
    const picker = spyOn(input, 'click')
    const upload = spyOn(component, 'onAddImage').and.resolveTo()
    expect(component.openImagePicker()).toBeTrue()
    expect(picker).toHaveBeenCalledTimes(1)
    const change = new Event('change')
    input.dispatchEvent(change)
    expect(upload).toHaveBeenCalledWith(change)

    fixture.componentRef.setInput('type', 'distributor')
    fixture.detectChanges()
    expect(component.openImagePicker()).toBeFalse()
    expect(host.querySelector('.node__shortcutImageInput')).toBeNull()
  })

  it('keeps the options menu out of the header drag handle', () => {
    const host = fixture.nativeElement as HTMLElement
    host.querySelector('.node__menuButton')!.dispatchEvent(
      new MouseEvent('click', { bubbles: true })
    )
    fixture.detectChanges()
    const pointerDown = jasmine.createSpy('pointerDown')
    host.addEventListener('pointerdown', pointerDown)

    host.querySelector('.node__header')!.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true })
    )
    expect(pointerDown).toHaveBeenCalledTimes(1)

    host.querySelector('.node__options polo-basic-button')!.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true })
    )
    expect(pointerDown).toHaveBeenCalledTimes(1)
  })

  it('opens a large focus editor and saves the draft when dismissed', async () => {
    const editor = TestBed.inject(StoryEditorService)
    const update = spyOn(editor, 'updateNodeText')
    fixture.componentRef.setInput('nodeId', 'node_7')
    fixture.componentRef.setInput('text', 'Original passage')
    fixture.detectChanges()

    const host = fixture.nativeElement as HTMLElement
    const preview = host.querySelector('.richTextField__preview') as HTMLElement
    expect(preview.textContent).toBe('Original passage')
    const focusButton = host.querySelector('.richTextField__button button') as HTMLButtonElement
    expect(focusButton.title).toBe('Focus on Node text (Ctrl+F / ⌘F)')
    expect(focusButton.querySelector('img')?.getAttribute('src')).toBe('/assets/icons/maximize.svg')
    focusButton.click()
    fixture.detectChanges()
    const [block] = await fixture.getDeferBlocks()
    await block.render(DeferBlockState.Complete)
    fixture.detectChanges()

    const panel = host.querySelector('.focusEditor') as HTMLDialogElement
    const content = panel.querySelector('[contenteditable]') as HTMLElement
    expect(panel.open).toBeTrue()
    expect(content.textContent).toBe('Original passage')
    expect(getComputedStyle(panel).width).toBe(`${window.innerWidth}px`)
    expect(getComputedStyle(panel).height).toBe(`${window.innerHeight}px`)
    content.focus()
    content.textContent = 'A longer passage'
    content.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }))
    const closed = new Promise<void>((resolve) => {
      panel.addEventListener('close', () => resolve(), { once: true })
    })
    const closeButton = panel.querySelector('button') as HTMLButtonElement
    closeButton.click()
    await closed
    fixture.detectChanges()
    expect(host.querySelector('.focusEditor')).toBeNull()
    expect(update).toHaveBeenCalledOnceWith('node_7', '<p>A longer passage</p>')
  })

  it('opens focus on Ctrl+F from the read-only preview', async () => {
    fixture.componentRef.setInput('type', 'text')
    fixture.detectChanges()
    const host = fixture.nativeElement as HTMLElement
    const preview = host.querySelector('.richTextField__preview') as HTMLElement
    const shortcut = new KeyboardEvent('keydown', {
      key: 'f', ctrlKey: true, bubbles: true, cancelable: true,
    })

    preview.focus()
    preview.dispatchEvent(shortcut)
    fixture.detectChanges()
    const [block] = await fixture.getDeferBlocks()
    await block.render(DeferBlockState.Complete)
    fixture.detectChanges()
    expect(shortcut.defaultPrevented).toBeTrue()
    expect(host.querySelector('.focusEditor')).not.toBeNull()
  })

  it('keeps the text-node description a plain text area without focus mode', () => {
    fixture.componentRef.setInput('nodeId', 'node_7')
    fixture.componentRef.setInput('type', 'text')
    fixture.detectChanges()
    const host = fixture.nativeElement as HTMLElement
    const description = host.querySelector('#node_7-description') as HTMLTextAreaElement
    description.focus()
    const shortcut = new KeyboardEvent('keydown', {
      key: 'f', ctrlKey: true, bubbles: true, cancelable: true,
    })
    description.dispatchEvent(shortcut)
    fixture.detectChanges()

    expect(description.tagName).toBe('TEXTAREA')
    expect(shortcut.defaultPrevented).toBeFalse()
    expect(host.querySelector('.focusEditor')).toBeNull()
    expect(description.closest('.formField__control')?.querySelector('polo-basic-button')).toBeNull()
  })

  it('does not offer focus mode for distributor nodes without text', () => {
    fixture.componentRef.setInput('type', 'distributor')
    fixture.detectChanges()
    expect((fixture.nativeElement as HTMLElement).querySelector('.richTextField__button')).toBeNull()
  })

  it('uses labeled form fields for text node settings and saves changes', () => {
    const editor = TestBed.inject(StoryEditorService)
    fixture.componentRef.setInput('nodeId', 'node_7')
    fixture.componentRef.setInput('type', 'text')
    fixture.componentRef.setInput('text', 'What is your name?')
    fixture.componentRef.setInput('userTextOptions', {
      property: 'name',
      placeholder: 'Your name',
      buttonText: 'Continue',
      description: 'Enter a name',
    })
    fixture.detectChanges()

    const fields = [
      { label: 'Property', id: 'property', value: 'alias', method: 'updateNodeProperty' },
      {
        label: 'Placeholder', id: 'placeholder', value: 'Your alias', method: 'updateNodePlaceholder',
      },
      { label: 'Button text', id: 'buttonText', value: 'Next', method: 'updateNodeButtonText' },
      {
        label: 'Description', id: 'description', value: 'A short hint', method: 'updateNodeDescription',
      },
    ] as const

    const descriptions: Record<string, string> = {
      property: "Stores the player's answer under this property for use later in the story.",
      placeholder: "Shown inside the player's text box before they type.",
      buttonText: 'Saved for this node, but the playground currently uses a fixed Continue button.',
      description: 'Saved as extra guidance for this input; not currently shown in the playground.',
    }

    const promptField = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.formField'))
      .find(formField => formField.querySelector('.formField__label')?.textContent?.trim() === 'Prompt')
    const prompt = promptField?.querySelector('.formField__control .richTextField__preview')
    expect(prompt?.textContent).toBe('What is your name?')
    expect(prompt?.getAttribute('aria-label')).toBe('Prompt')
    for (const field of fields) {
      const control = fixture.nativeElement.querySelector(
        `#node_7-${field.id}`
      ) as HTMLInputElement | HTMLTextAreaElement
      const label = fixture.nativeElement.querySelector(
        `label[for="node_7-${field.id}"]`
      ) as HTMLLabelElement
      expect(control).withContext(field.label).not.toBeNull()
      expect(label.textContent?.trim()).toBe(field.label)
      if (field.id in descriptions) {
        const descriptionId = control.getAttribute('aria-describedby')
        expect(descriptionId).toBeTruthy()
        const hint = fixture.nativeElement.querySelector(`#${descriptionId}`) as HTMLElement
        expect(hint?.textContent?.trim()).toBe(descriptions[field.id])
      }

      const update = spyOn(editor, field.method)
      control.value = field.value
      control.dispatchEvent(new Event('change'))
      expect(update).toHaveBeenCalledOnceWith('node_7', field.value)
    }
  })

  it('updates OnPush upload state and resets the selected input on optimization failure', async () => {
    const database = TestBed.inject(DatabaseService)
    const apis = TestBed.inject(ApisService)
    const imageInput = document.createElement('input')
    imageInput.type = 'file'
    Object.defineProperty(imageInput, 'files', {
      value: [new File(['image'], 'image.png', { type: 'image/png' })],
    })
    const valueSetter = spyOnProperty(imageInput, 'value', 'set').and.callThrough()
    spyOn(database.supabase.auth, 'getUser').and.resolveTo({
      data: { user: { id: 'user_1' } },
      error: null,
    } as never)
    spyOn(apis, 'getOptimizedImage').and.resolveTo(false)
    spyOn(console, 'error')

    const upload = component.onAddImage({ target: imageInput } as unknown as Event)

    expect(component.loading()).toBeTrue()
    expect(component.loadingMessage()).toBe('Optimizing image')
    fixture.detectChanges()
    expect(fixture.nativeElement.textContent).toContain('Optimizing image')

    await upload
    fixture.detectChanges()

    expect(component.loading()).toBeFalse()
    expect(component.loadingMessage()).toBe(
      'The image is too big\nTry again with a smaller image.'
    )
    expect(fixture.nativeElement.textContent).toContain('The image is too big')
    expect(valueSetter).toHaveBeenCalledWith('')
  })
})
