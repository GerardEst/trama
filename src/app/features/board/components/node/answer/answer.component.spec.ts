import { ComponentFixture, DeferBlockState, TestBed } from '@angular/core/testing'
import { StoryEditorService } from '../../../services/story-editor.service'

import { AnswerComponent } from './answer.component'
import { BoardAnchorRegistryService } from '../../../services/board-anchor-registry.service'
import { PanzoomService } from '../../../services/panzoom.service'

describe('AnswerComponent', () => {
  let component: AnswerComponent
  let fixture: ComponentFixture<AnswerComponent>

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AnswerComponent],
      providers: [
        BoardAnchorRegistryService,
        PanzoomService,
        {
          provide: StoryEditorService,
          useValue: {
            getEventsOfAnswer: () => [],
            getRequirementsOfAnswer: () => [],
            updateAnswerText: () => undefined,
          },
        },
      ],
    })
    fixture = TestBed.createComponent(AnswerComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('offers focus editing for answer text', async () => {
    const editor = TestBed.inject(StoryEditorService)
    const save = spyOn(editor, 'updateAnswerText')
    fixture.componentRef.setInput('answerId', 'answer_2_0')
    fixture.detectChanges()
    const host = fixture.nativeElement as HTMLElement
    fixture.componentRef.setInput('text', 'Original answer')
    fixture.detectChanges()
    const preview = host.querySelector('.richTextField__preview') as HTMLElement
    expect(preview.textContent).toBe('Original answer')
    const focusButton = host.querySelector<HTMLButtonElement>('.richTextField__button button')!
    expect(focusButton.title).toContain('Focus on Answer text')
    focusButton.click()
    fixture.detectChanges()
    const [block] = await fixture.getDeferBlocks()
    await block.render(DeferBlockState.Complete)
    fixture.detectChanges()

    const dialog = host.querySelector('dialog') as HTMLDialogElement
    const content = dialog.querySelector('[contenteditable]') as HTMLElement
    expect(content.textContent).toBe('Original answer')
    content.textContent = 'New answer'
    content.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }))
    const closed = new Promise<void>((resolve) => dialog.addEventListener('close', () => resolve(), { once: true }))
    dialog.close()
    await closed
    expect(save).toHaveBeenCalledOnceWith('answer_2_0', '<p>New answer</p>')
  })
})
