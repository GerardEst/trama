import { ComponentFixture, TestBed } from '@angular/core/testing'

import { NodeAddModifyEventComponent } from './node-add-modify-ref.component'

describe('NodeAddModifyEventComponent', () => {
  let component: NodeAddModifyEventComponent
  let fixture: ComponentFixture<NodeAddModifyEventComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NodeAddModifyEventComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(NodeAddModifyEventComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
