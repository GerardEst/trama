import { ComponentFixture, TestBed } from '@angular/core/testing'

import { NodeAddEventComponent } from './node-add-event.component'

describe('NodeAddEventComponent', () => {
  let component: NodeAddEventComponent
  let fixture: ComponentFixture<NodeAddEventComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NodeAddEventComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(NodeAddEventComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('prevents saving an incomplete event', () => {
    spyOn(component.onSaveEvent, 'emit')

    component.saveEvent()

    expect(component.onSaveEvent.emit).not.toHaveBeenCalled()
    expect(component.canSave).toBeFalse()
  })

  it('clears incompatible values when the event type changes', () => {
    component.target = 'stat_health'
    component.amount = '5'
    component.property = 'old value'

    component.selectType('condition')

    expect(component.type).toBe('condition')
    expect(component.target).toBe('')
    expect(Number(component.amount)).toBe(0)
    expect(component.property).toBeUndefined()
  })

  it('emits a complete event and closes when saved', () => {
    spyOn(component.onSaveEvent, 'emit')
    spyOn(component.onClose, 'emit')
    component.target = 'stat_health'
    component.amount = '5'

    component.saveEvent()

    expect(component.onSaveEvent.emit).toHaveBeenCalledWith({
      target: 'stat_health',
      previousTarget: undefined,
      amount: '5',
      type: 'stat',
      property: undefined,
    })
    expect(component.onClose.emit).toHaveBeenCalled()
  })

  it('deletes the original event even if the target was changed in the editor', () => {
    component.originalTarget = 'condition_old'
    component.target = 'condition_new'
    spyOn(component.onDeleteEvent, 'emit')

    component.deleteEvent()

    expect(component.onDeleteEvent.emit).toHaveBeenCalledWith(
      jasmine.objectContaining({ target: 'condition_old' })
    )
  })

  it('requires confirmation before deleting an event', () => {
    spyOn(component.onDeleteEvent, 'emit')

    component.requestDelete()

    expect(component.confirmingDelete).toBeTrue()
    expect(component.onDeleteEvent.emit).not.toHaveBeenCalled()
  })
})
