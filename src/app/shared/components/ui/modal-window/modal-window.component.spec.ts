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

  it('preserves the existing dialog layout when no custom properties are supplied', () => {
    component.mode = 'dialog'
    fixture.detectChanges()
    const host = fixture.nativeElement as HTMLElement
    expect(getComputedStyle(host.querySelector('.modal')!).maxWidth).toBe('900px')
    expect(getComputedStyle(host.querySelector('.modal__body')!).overflowY).toBe('scroll')
    expect(getComputedStyle(host.querySelector('.modal__options')!).display).toBe('flex')
  })

  it('lets a dialog customize its shell without leaking styles to other dialogs', () => {
    component.mode = 'dialog'
    const host = fixture.nativeElement as HTMLElement
    host.style.setProperty('--polo-dialog-width', '400px')
    host.style.setProperty('--polo-modal-padding', '24px')
    host.style.setProperty('--polo-modal-body-overflow', 'auto')
    host.style.setProperty('--polo-modal-empty-options-display', 'none')
    fixture.detectChanges()
    const modal = getComputedStyle(host.querySelector('.modal')!)
    expect(modal.width).toBe('400px')
    expect(modal.paddingTop).toBe('24px')
    expect(getComputedStyle(host.querySelector('.modal__body')!).overflowY).toBe('auto')
    expect(getComputedStyle(host.querySelector('.modal__options')!).display).toBe('none')
  })
})
