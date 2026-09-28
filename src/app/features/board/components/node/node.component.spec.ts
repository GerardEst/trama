import { ComponentFixture, TestBed } from '@angular/core/testing'

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

  it('should create', () => {
    expect(component).toBeTruthy()
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
    const boardTextarea = host.querySelector('.node__text') as HTMLTextAreaElement
    boardTextarea.value = 'Original passage'
    const focusButton = host.querySelector('.textFocusField__button button') as HTMLButtonElement
    expect(focusButton.title).toContain('Ctrl+F')
    expect(host.querySelector('.node__header .node__focusButton')).toBeNull()
    focusButton.click()
    fixture.detectChanges()

    const panel = host.querySelector('.focusEditor') as HTMLDialogElement
    const textarea = panel.querySelector('textarea') as HTMLTextAreaElement
    expect(panel.open).toBeTrue()
    expect(textarea.value).toBe('Original passage')
    expect(getComputedStyle(panel).width).toBe(`${window.innerWidth}px`)
    expect(getComputedStyle(panel).height).toBe(`${window.innerHeight}px`)
    textarea.value = 'A longer passage'
    textarea.dispatchEvent(new Event('input', { bubbles: true }))
    const closed = new Promise<void>((resolve) => {
      panel.addEventListener('close', () => resolve(), { once: true })
    })
    const closeButton = panel.querySelector('button') as HTMLButtonElement
    closeButton.click()
    await closed
    fixture.detectChanges()
    expect(host.querySelector('.focusEditor')).toBeNull()
    expect(boardTextarea.value).toBe('A longer passage')
    expect(update).toHaveBeenCalledOnceWith('node_7', 'A longer passage')
  })

  it('opens focus on Ctrl+F only for the active textarea', () => {
    fixture.componentRef.setInput('type', 'text')
    fixture.detectChanges()
    const host = fixture.nativeElement as HTMLElement
    const textarea = host.querySelector('.node__text') as HTMLTextAreaElement
    const shortcut = new KeyboardEvent('keydown', {
      key: 'f', ctrlKey: true, bubbles: true, cancelable: true,
    })

    textarea.focus()
    textarea.dispatchEvent(shortcut)
    fixture.detectChanges()
    expect(shortcut.defaultPrevented).toBeTrue()
    expect(host.querySelector('.focusEditor')).not.toBeNull()
  })

  it('focuses a text-node description with Ctrl+F and saves that field', async () => {
    const editor = TestBed.inject(StoryEditorService)
    const save = spyOn(editor, 'updateNodeDescription')
    fixture.componentRef.setInput('nodeId', 'node_7')
    fixture.componentRef.setInput('type', 'text')
    fixture.detectChanges()
    const host = fixture.nativeElement as HTMLElement
    const description = host.querySelector('#node_7-description') as HTMLTextAreaElement
    description.focus()
    description.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'f', ctrlKey: true, bubbles: true, cancelable: true,
    }))
    fixture.detectChanges()

    const dialog = host.querySelector('.focusEditor') as HTMLDialogElement
    const editorTextarea = dialog.querySelector('textarea') as HTMLTextAreaElement
    expect(editorTextarea.getAttribute('aria-label')).toBe('Description')
    editorTextarea.value = 'An expanded description'
    editorTextarea.dispatchEvent(new Event('input', { bubbles: true }))
    const closed = new Promise<void>((resolve) => dialog.addEventListener('close', () => resolve(), { once: true }))
    dialog.close()
    await closed
    expect(save).toHaveBeenCalledOnceWith('node_7', 'An expanded description')
  })

  it('does not offer focus mode for distributor nodes without text', () => {
    fixture.componentRef.setInput('type', 'distributor')
    fixture.detectChanges()
    expect((fixture.nativeElement as HTMLElement).querySelector('.textFocusField__button')).toBeNull()
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
      { label: 'Prompt', id: 'prompt', value: 'New prompt', method: 'updateNodeText' },
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
