import { ComponentFixture, TestBed } from '@angular/core/testing'

import { NodeRequirementComponent } from './node-requirement.component'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'

describe('NodeRequirementComponent', () => {
  let component: NodeRequirementComponent
  let fixture: ComponentFixture<NodeRequirementComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NodeRequirementComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(NodeRequirementComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('shows the referenced name instead of the requirement target ID', () => {
    TestBed.inject(ActiveStoryService).load('story-1', 'Story', {
      refs: { condition_12: { name: 'Ancient key', type: 'condition' } },
      nodes: [],
    })
    component.type = 'condition'
    component.target = 'condition_12'
    component.amount = '1'
    fixture.detectChanges()

    const pill = fixture.nativeElement.querySelector('.node__requirement')
    expect(pill.textContent).toContain('Ancient key')
    expect(pill.textContent).not.toContain('12')
  })

  it('falls back to a readable target when its reference is missing', () => {
    component.type = 'condition'
    component.target = 'condition_ancient_key'
    fixture.detectChanges()

    expect(fixture.nativeElement.querySelector('.node__requirement').textContent)
      .toContain('Ancient key')
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
