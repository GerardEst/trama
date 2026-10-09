import { ComponentFixture, DeferBlockState, TestBed } from '@angular/core/testing'
import { By } from '@angular/platform-browser'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { StoryEditorService } from '../board/services/story-editor.service'
import { RichTextEditorComponent } from '../board/components/rich-text/rich-text-editor.component'
import { PlayerService } from '../playground/services/player.service'
import { LinearEditorComponent } from './linear-editor.component'

const original = '<p>Hello <span data-trama-variable="" data-kind="property" data-key="name">#name</span></p>'

describe('LinearEditorComponent', () => {
  let fixture: ComponentFixture<LinearEditorComponent>
  let component: LinearEditorComponent
  let story: ActiveStoryService
  let editor: jasmine.SpyObj<StoryEditorService>

  async function renderEditors() {
    fixture.changeDetectorRef.markForCheck()
    fixture.detectChanges()
    fixture.detectChanges()
    const blocks = await fixture.getDeferBlocks()
    expect(blocks.length).toBeGreaterThan(0)
    for (const block of blocks) await block.render(DeferBlockState.Complete)
    await fixture.whenStable()
    fixture.changeDetectorRef.markForCheck()
    fixture.detectChanges()
  }

  async function edit() {
    component.toggleEditing()
    await renderEditors()
  }

  function editors() {
    return fixture.debugElement.queryAll(By.directive(RichTextEditorComponent))
      .map(field => field.componentInstance as RichTextEditorComponent)
  }

  beforeEach(() => {
    editor = jasmine.createSpyObj('StoryEditorService', ['updateNodeText', 'updateAnswerText'])
    TestBed.configureTestingModule({
      imports: [LinearEditorComponent],
      providers: [{ provide: StoryEditorService, useValue: editor }],
    })
    story = TestBed.inject(ActiveStoryService)
    story.load('story', 'Story', { nodes: [
      { id: 'node_0', type: 'content', top: 0, left: 0, text: original,
        events: [{ id: 'name', type: 'property', action: 'alterProperty', target: 'name', amount: '', property: 'Ada' }],
        answers: [
          { id: 'answer_0_0', text: 'Next', join: [{ node: 'node_1' }] },
          { id: 'answer_0_1', text: 'Locked answer', requirements: [{ target: 'condition_key', type: 'condition', amount: 1 }] },
        ] },
      { id: 'node_1', type: 'end', top: 0, left: 0, text: 'Ending' },
    ] })
    story.patchConfiguration({ cumulativeMode: true, tracking: true, sharing: true })
    fixture = TestBed.createComponent(LinearEditorComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
    fixture.detectChanges()
  })

  it('previews the configured first scene and blocks a disconnected start until reconnected', () => {
    const nodes = structuredClone(story.entireTree().nodes)
    story.load('configured', 'Story', { nodes, entryPoint: { left: 0, top: 0, targetNodeId: 'node_1' } })
    fixture.detectChanges()
    expect(component.session.currentNodeId()).toBe('node_1')
    expect(fixture.nativeElement.querySelector('.authorSheet')?.textContent).toContain('Ending')
    story.updateTree(draft => { delete draft.entryPoint!.targetNodeId })
    component.restart()
    fixture.detectChanges()
    expect(component.session.currentNodeId()).toBeUndefined()
    expect(fixture.nativeElement.querySelector('[role="status"]')?.textContent).toContain('Connect Start')
    story.updateTree(draft => { draft.entryPoint!.targetNodeId = 'node_0' })
    fixture.detectChanges()
    expect(component.session.currentNodeId()).toBe('node_0')
  })

  it('defaults to a single interpolated preview without authoring controls or public end actions', () => {
    const host = fixture.nativeElement as HTMLElement
    expect(component.editing()).toBeFalse()
    expect(host.querySelectorAll('polo-game-node')).toHaveSize(1)
    expect(host.querySelectorAll('[contenteditable="true"], [role="toolbar"], .answerEditButton')).toHaveSize(0)
    expect(host.textContent).toContain('Hello Ada')
    component.selectAnswer(component.currentNodes()[0].answers![0])
    fixture.detectChanges()
    expect(host.querySelectorAll('polo-game-node')).toHaveSize(1)
    expect(host.querySelector('polo-cumulative-game, polo-game-end-actions')).toBeNull()
    expect(host.querySelector('.authorSheet')!.textContent).not.toContain('Hello')
  })

  it('isolates the test player from the application player', () => {
    expect(TestBed.inject(PlayerService).playerProperties()).toEqual({})
    expect(component.currentNodes()[0].text).toContain('Ada')
  })

  it('enables the passage and every answer as plain writing surfaces with exactly one toolbar', async () => {
    await edit()
    const fields = editors()
    const host = fixture.nativeElement as HTMLElement
    expect(fields).toHaveSize(3)
    expect(fields[0].text()).toBe(original)
    expect(fields[0].editor!.view.dom.textContent).toContain('#name')
    expect(fields[2].text()).toBe('Locked answer')
    expect(host.querySelectorAll('[contenteditable="true"]')).toHaveSize(3)
    expect(host.querySelectorAll('[role="toolbar"]')).toHaveSize(1)
    expect(host.querySelector('dialog, polo-game-answer, .answerEditButton')).toBeNull()
    expect(component.toolbarEditor()).toBe(fields[0])
    const answers = host.querySelector('.authorAnswers')!
    expect(getComputedStyle(answers).borderTopStyle).toBe('solid')
    fields[0].editor!.commands.setContent('<p>Corrected #name</p>')
    fields[2].editor!.commands.setContent('<p>Corrected locked answer</p>')
    component.commitEdits()
    expect(editor.updateNodeText).toHaveBeenCalledWith('node_0', '<p>Corrected #name</p>')
    expect(editor.updateAnswerText).toHaveBeenCalledWith('answer_0_1', '<p>Corrected locked answer</p>')
    expect(component.session.currentNodeId()).toBe('node_0')
  })

  it('routes the shared toolbar to the last focused surface without changing another field', async () => {
    await edit()
    const fields = editors()
    fields[1].editor!.commands.setTextSelection({ from: 1, to: 5 })
    fields[1].focused.emit()
    fixture.detectChanges()
    const host = fixture.nativeElement as HTMLElement
    host.querySelector<HTMLButtonElement>('[aria-label="Bold"]')!.click()
    expect(fields[1].editor!.getHTML()).toBe('<p><strong>Next</strong></p>')
    expect(fields[0].text()).toBe(original)
    expect(host.querySelector<HTMLButtonElement>('[aria-label="Heading 1"]')!.disabled).toBeTrue()
    fields[0].focused.emit()
    fixture.detectChanges()
    expect(host.querySelector<HTMLButtonElement>('[aria-label="Heading 1"]')!.disabled).toBeFalse()
    expect(host.querySelectorAll('[role="toolbar"]')).toHaveSize(1)
  })

  it('flushes all drafts when returning to preview without resetting the visit', async () => {
    await edit()
    editors()[0].editor!.commands.setContent('<p>Passage draft</p>')
    editors()[1].editor!.commands.setContent('<p>Answer draft</p>')
    component.toggleEditing()
    fixture.detectChanges()
    expect(editor.updateNodeText).toHaveBeenCalledWith('node_0', '<p>Passage draft</p>')
    expect(editor.updateAnswerText).toHaveBeenCalledWith('answer_0_0', '<p>Answer draft</p>')
    expect(component.session.currentNodeId()).toBe('node_0')
    expect(component.session.visits()).toHaveSize(1)
    expect(editors()).toHaveSize(0)
    expect(component.toolbarEditor()).toBeUndefined()
  })

  it('does not execute answer navigation while editing', async () => {
    await edit()
    component.selectAnswer(component.currentNodes()[0].answers![0])
    expect(component.session.currentNodeId()).toBe('node_0')
    component.toggleEditing()
    component.selectAnswer(component.currentNodes()[0].answers![0])
    expect(component.session.currentNodeId()).toBe('node_1')
  })

  it('refreshes board corrections in the existing sheet without replaying events', async () => {
    component.selectAnswer(component.currentNodes()[0].answers![0])
    await edit()
    const field = editors()[0]
    story.updateTree(draft => { draft.nodes[1].text = 'Corrected ending' })
    fixture.detectChanges()
    expect(component.session.currentNodeId()).toBe('node_1')
    expect(component.session.visits()).toHaveSize(2)
    expect(editors()[0]).toBe(field)
    expect(field.editor!.getText()).toBe('Corrected ending')
  })

  it('flushes active editors before closing or changing stories', async () => {
    await edit()
    const commit = spyOn(editors()[0], 'commit')
    component.commitEdits()
    component.close()
    expect(commit).toHaveBeenCalledTimes(2)
  })

  it('rejects stale saves and resets to preview when changing stories with matching node IDs', async () => {
    await edit()
    const field = editors()[0]
    story.load('other', 'Other', { nodes: [{ id: 'node_0', type: 'content', text: 'Other', top: 0, left: 0 }] })
    field.saved.emit('Old draft')
    expect(editor.updateNodeText).not.toHaveBeenCalled()
    expect(component.editing()).toBeFalse()
    expect(component.toolbarEditor()).toBeUndefined()
  })

  it('retargets the toolbar when navigating backwards in edit mode', async () => {
    component.selectAnswer(component.currentNodes()[0].answers![0])
    await edit()
    const previous = component.toolbarEditor()
    component.back()
    await renderEditors()
    expect(component.session.currentNodeId()).toBe('node_0')
    expect(component.editing()).toBeTrue()
    expect(component.toolbarEditor()).toBe(editors()[0])
    expect(component.toolbarEditor()).not.toBe(previous)
  })

  it('clears the highlight while not following and restores it to the current visit when enabled', () => {
    const highlight = jasmine.createSpy('highlight')
    component.highlightedNodeChanged.subscribe(highlight)
    component.followNode.set(false)
    fixture.detectChanges()
    expect(highlight).toHaveBeenCalledWith(undefined)

    component.selectAnswer(component.currentNodes()[0].answers![0])
    fixture.detectChanges()
    expect(highlight.calls.mostRecent().args).toEqual([undefined])
    highlight.calls.reset()
    component.locateNode()
    expect(highlight).not.toHaveBeenCalled()

    component.followNode.set(true)
    fixture.detectChanges()
    expect(highlight).toHaveBeenCalledOnceWith('node_1')
    story.load('empty', 'Empty', { nodes: [] })
    fixture.detectChanges()
    fixture.detectChanges()
    expect(highlight.calls.mostRecent().args).toEqual([undefined])
  })

  it('requests board navigation only while following, or on an explicit locate action', () => {
    const reveal = jasmine.createSpy('reveal')
    component.nodeRequested.subscribe(reveal)
    component.followNode.set(false)
    component.selectAnswer(component.currentNodes()[0].answers![0])
    fixture.detectChanges()
    expect(reveal).not.toHaveBeenCalled()
    component.locateNode()
    expect(reveal).toHaveBeenCalledWith('node_1')
  })
})
