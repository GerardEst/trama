import { ComponentFixture, TestBed } from '@angular/core/testing'
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
    const boardTextarea = host.querySelector('textarea') as HTMLTextAreaElement
    boardTextarea.value = 'Original answer'
    const focusButton = host.querySelector('.textFocusField__button button') as HTMLButtonElement
    focusButton.click()
    fixture.detectChanges()

    const dialog = host.querySelector('dialog') as HTMLDialogElement
    const textarea = dialog.querySelector('textarea') as HTMLTextAreaElement
    expect(textarea.value).toBe('Original answer')
    textarea.value = 'New answer'
    textarea.dispatchEvent(new Event('input', { bubbles: true }))
    const closed = new Promise<void>((resolve) => dialog.addEventListener('close', () => resolve(), { once: true }))
    dialog.close()
    await closed
    expect(save).toHaveBeenCalledOnceWith('answer_2_0', 'New answer')
  })
})
