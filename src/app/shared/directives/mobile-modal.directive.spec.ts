import { Component, signal } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ViewportService } from 'src/app/core/services/viewport.service'
import { MobileModalDirective } from './mobile-modal.directive'

@Component({
  standalone: true,
  imports: [MobileModalDirective],
  template: `
    @if (open) {
      <div class="menu" poloMobileModal (mobileModalDismiss)="open = false">Menu</div>
    }
  `,
})
class HostComponent {
  open = true
}

describe('MobileModalDirective', () => {
  const mobile = signal(false)
  let fixture: ComponentFixture<HostComponent>

  beforeEach(() => {
    mobile.set(false)
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [{ provide: ViewportService, useValue: { mobile } }],
    })
    fixture = TestBed.createComponent(HostComponent)
    document.body.appendChild(fixture.nativeElement)
    fixture.autoDetectChanges(true)
  })

  afterEach(() => {
    fixture.destroy()
    fixture.nativeElement.remove()
  })

  const menu = () => fixture.nativeElement.querySelector('.menu') as HTMLElement | null
  const backdrop = () => document.querySelector<HTMLElement>('.mobileModal__backdrop')

  it('leaves the menu in place on desktop', async () => {
    await fixture.whenStable()
    expect(menu()!.hasAttribute('popover')).toBeFalse()
    expect(backdrop()).toBeNull()
  })

  it('follows the viewport across the breakpoint and closes from its backdrop', async () => {
    await fixture.whenStable()
    mobile.set(true)
    await fixture.whenStable()
    expect(menu()!.matches(':popover-open.mobileModal')).toBeTrue()
    expect(backdrop()!.matches(':popover-open')).toBeTrue()

    mobile.set(false)
    await fixture.whenStable()
    expect(menu()!.hasAttribute('popover')).toBeFalse()
    expect(backdrop()).toBeNull()

    mobile.set(true)
    await fixture.whenStable()
    backdrop()!.click()
    await fixture.whenStable()
    expect(menu()).toBeNull()
    expect(backdrop()).toBeNull()
  })
})
