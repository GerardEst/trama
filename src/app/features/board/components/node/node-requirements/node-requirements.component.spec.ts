import { ComponentFixture, TestBed } from '@angular/core/testing'

import { StoryEditorService } from '../../../services/story-editor.service'
import { NodeRequirementsComponent } from './node-requirements.component'

describe('NodeRequirementsComponent', () => {
  let component: NodeRequirementsComponent
  let fixture: ComponentFixture<NodeRequirementsComponent>
  let storyEditor: jasmine.SpyObj<StoryEditorService>

  beforeEach(async () => {
    storyEditor = jasmine.createSpyObj<StoryEditorService>(
      'StoryEditorService',
      ['saveAnswerRequirements']
    )

    await TestBed.configureTestingModule({
      imports: [NodeRequirementsComponent],
      providers: [{ provide: StoryEditorService, useValue: storyEditor }],
    }).compileComponents()

    fixture = TestBed.createComponent(NodeRequirementsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('deletes a legacy requirement and persists the empty list', () => {
    component.answerId = 'answer_0_0'
    component.requirements = [
      { id: 'condition_1', type: 'condition', amount: 1 },
    ]

    component.deleteRequirement('condition_1')

    expect(component.requirements).toEqual([])
    expect(storyEditor.saveAnswerRequirements).toHaveBeenCalledWith(
      'answer_0_0',
      []
    )
  })

  it('updates rather than duplicates a requirement on the same target', () => {
    component.requirements = [{ target: 'stat_1', type: 'stat', amount: 1 }]

    component.saveRequirement({ target: 'stat_1', type: 'stat', amount: '3' })

    expect(component.requirements).toEqual([
      { target: 'stat_1', type: 'stat', amount: 3 },
    ])
  })

  it('replaces a legacy id-only requirement when it is edited', () => {
    component.answerId = 'answer_0_0'
    component.requirements = [{ id: 'stat_1', type: 'stat', amount: 1 }]

    component.saveRequirement({
      target: 'stat_2',
      previousValue: 'stat_1',
      type: 'stat',
      amount: '2',
    })

    expect(component.requirements).toEqual([
      { target: 'stat_2', type: 'stat', amount: 2 },
    ])
    expect(storyEditor.saveAnswerRequirements).toHaveBeenCalledWith(
      'answer_0_0',
      component.requirements
    )
  })
})
