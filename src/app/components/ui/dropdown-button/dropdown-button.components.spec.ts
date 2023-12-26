import { ComponentFixture, TestBed } from '@angular/core/testing'

import { DropdownButtonsComponent } from './dropdown-buttons.component'

describe('DropdownButtonComponent', () => {
  let component: DropdownButtonsComponent
  let fixture: ComponentFixture<DropdownButtonsComponent>

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DropdownButtonsComponent],
    })
    fixture = TestBed.createComponent(DropdownButtonsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
