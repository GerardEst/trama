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

  it('opens the Edit requirement editor in an anchored popover', async () => {
    component.type = 'condition'
    component.target = 'condition_12'
    component.amount = '1'
    fixture.detectChanges()

    const host: HTMLElement = fixture.nativeElement
    document.body.appendChild(host)
    host.querySelector<HTMLButtonElement>('.node__requirement')!.click()
    fixture.detectChanges()
    await new Promise<void>((resolve) => setTimeout(resolve, 0))

    const panel = host.querySelector<HTMLElement>('.anchoredPopover__panel')!
    expect(panel.matches(':popover-open')).toBeTrue()
    expect(panel.querySelector('[role="dialog"]')).not.toBeNull()

    const outside = document.createElement('button')
    document.body.appendChild(outside)
    outside.click()
    fixture.detectChanges()
    expect(host.querySelector('.anchoredPopover__panel')).toBeNull()
    outside.remove()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
