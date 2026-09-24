import { ComponentFixture, TestBed } from '@angular/core/testing'

import { NodeAddRequirementComponent } from './node-add-requirement.component'

describe('NodeAddRequirementComponent', () => {
  let component: NodeAddRequirementComponent
  let fixture: ComponentFixture<NodeAddRequirementComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NodeAddRequirementComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(NodeAddRequirementComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('requires a target and a numeric stat threshold', () => {
    component.type = 'stat'
    component.target = 'stat_courage'
    component.amount = ''

    expect(component.canSave).toBeFalse()

    component.amount = '4'

    expect(component.canSave).toBeTrue()
  })

  it('resets incompatible values when changing requirement type', () => {
    component.target = 'stat_courage'
    component.amount = 4

    component.selectType('condition')

    expect(component.target).toBe('')
    expect(component.amount).toBe(1)
  })

  it('deletes the original requirement after selecting another target', () => {
    component.originalTarget = 'condition_old'
    component.target = 'condition_new'
    spyOn(component.onDeleteRequirement, 'emit')

    component.deleteRequirement()

    expect(component.onDeleteRequirement.emit).toHaveBeenCalledWith(
      jasmine.objectContaining({ target: 'condition_old' })
    )
  })

  it('emits a complete requirement when saving', () => {
    spyOn(component.onSaveRequirement, 'emit')
    component.type = 'condition'
    component.target = 'condition_key'
    component.amount = 1

    component.saveRequirement()

    expect(component.onSaveRequirement.emit).toHaveBeenCalledWith({
      target: 'condition_key',
      amount: 1,
      type: 'condition',
    })
  })
})
