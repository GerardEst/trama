import { ComponentFixture, TestBed } from '@angular/core/testing'

import { NodeAddModifyRefComponent } from './node-add-modify-ref.component'

describe('NodeAddModifyEventComponent', () => {
  let component: NodeAddModifyRefComponent
  let fixture: ComponentFixture<NodeAddModifyRefComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NodeAddModifyRefComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(NodeAddModifyRefComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
