import { ComponentFixture, TestBed } from '@angular/core/testing'

import { NodeAddRequirementComponent } from './node-add-requirement.component'
import { ContextHelpService } from 'src/app/shared/context-help/context-help.service'

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

  it('does not replace the editor’s initial focus target with a help button', () => {
    expect(fixture.nativeElement.querySelector('button').classList).toContain('addRequirement__close')
  })

  it('dismisses help before dismissing the requirement editor on Escape', async () => {
    const key = 'polo-context-help'
    const previous = localStorage.getItem(key)
    document.body.appendChild(fixture.nativeElement)
    spyOn(component.onClose, 'emit')
    try {
      TestBed.inject(ContextHelpService).setEnabled(true)
      fixture.detectChanges()
      const trigger = fixture.nativeElement.querySelector('polo-context-help button') as HTMLButtonElement
      trigger.click()
      fixture.detectChanges()
      await new Promise<void>((resolve) => setTimeout(resolve, 0))
      expect(fixture.nativeElement.querySelector('.contextHelp__panel')).not.toBeNull()
      trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      fixture.detectChanges()
      expect(fixture.nativeElement.querySelector('.contextHelp__panel')).toBeNull()
      expect(component.onClose.emit).not.toHaveBeenCalled()
      trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      expect(component.onClose.emit).toHaveBeenCalled()
    } finally {
      fixture.nativeElement.remove()
      if (previous === null) localStorage.removeItem(key)
      else localStorage.setItem(key, previous)
    }
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
