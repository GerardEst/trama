import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'

import { DashboardComponent } from './dashboard.component'

describe('DashboardComponent', () => {
  let component: DashboardComponent
  let fixture: ComponentFixture<DashboardComponent>

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [provideRouter([])],
    })
    fixture = TestBed.createComponent(DashboardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('shows the grouping control before any nodes are selected', () => {
    const button: HTMLButtonElement | null = fixture.nativeElement.querySelector(
      '.groupToolbar button'
    )
    expect(button).not.toBeNull()
    expect(button?.disabled).toBeTrue()
  })
})
