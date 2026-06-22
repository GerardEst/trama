import { ComponentFixture, TestBed } from '@angular/core/testing'

import { LandingLinkComponent } from './landing-link.component'

describe('LandingLinkComponent', () => {
  let component: LandingLinkComponent
  let fixture: ComponentFixture<LandingLinkComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingLinkComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(LandingLinkComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
