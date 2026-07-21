import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'

import { ModalWindowComponent } from './modal-window.component'

describe('ModalWindowComponent', () => {
  let component: ModalWindowComponent
  let fixture: ComponentFixture<ModalWindowComponent>

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ModalWindowComponent, NoopAnimationsModule],
    })
    fixture = TestBed.createComponent(ModalWindowComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
