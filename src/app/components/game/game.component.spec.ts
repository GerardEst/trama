import { ComponentFixture, TestBed } from '@angular/core/testing'

import { FlowComponent } from './game.component'

describe('FlowComponent', () => {
  let component: FlowComponent
  let fixture: ComponentFixture<FlowComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlowComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(FlowComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
