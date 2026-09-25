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
