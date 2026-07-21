import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'

import { CreatorPaywallComponent } from './creator-paywall.component'

describe('CreatorPaywallComponent', () => {
  let component: CreatorPaywallComponent
  let fixture: ComponentFixture<CreatorPaywallComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatorPaywallComponent, NoopAnimationsModule],
    }).compileComponents()

    fixture = TestBed.createComponent(CreatorPaywallComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
