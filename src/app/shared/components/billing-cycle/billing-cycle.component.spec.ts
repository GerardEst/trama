import { ComponentFixture, TestBed } from '@angular/core/testing'

import { BillingCycleComponent } from './billing-cycle.component'

describe('BillingCycleComponent', () => {
  let component: BillingCycleComponent
  let fixture: ComponentFixture<BillingCycleComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillingCycleComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(BillingCycleComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('keeps the same appearance inside and outside pricing on the landing', () => {
    const host = fixture.nativeElement as HTMLElement
    const button = host.querySelector('button') as HTMLButtonElement
    const styles = () => [getComputedStyle(button).backgroundColor, getComputedStyle(button).padding]

    const outsideLanding = styles()
    host.classList.add('landing-pricing')
    expect(styles()).toEqual(outsideLanding)
  })

  it('uses native buttons and exposes the selected billing period', () => {
    const buttons = fixture.nativeElement.querySelectorAll(
      'button'
    ) as NodeListOf<HTMLButtonElement>
    expect(buttons.length).toBe(2)
    expect(buttons[0].type).toBe('button')
    expect(buttons[0].getAttribute('aria-pressed')).toBe('true')
    expect(buttons[1].getAttribute('aria-pressed')).toBe('false')
    spyOn(component.onChangePayingPeriod, 'emit')
    buttons[1].click()
    fixture.detectChanges()
    expect(component.onChangePayingPeriod.emit).toHaveBeenCalledWith('annual')
    expect(buttons[1].getAttribute('aria-pressed')).toBe('true')
    expect(buttons[0].getAttribute('aria-pressed')).toBe('false')
  })
})
