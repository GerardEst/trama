import { ComponentFixture, TestBed } from '@angular/core/testing'
import { By } from '@angular/platform-browser'
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

  it('should toggle dropdown when button is clicked', () => {
    // Arrange
    const button = fixture.debugElement.query(By.css('button'))

    // Act
    button.triggerEventHandler('click', null)
    fixture.detectChanges()

    // Assert
    let dropdown = fixture.debugElement.query(By.css('.dropdown'))
    expect(dropdown).toBeTruthy()

    // Act
    button.triggerEventHandler('click', null)
    fixture.detectChanges()

    // Assert
    dropdown = fixture.debugElement.query(By.css('.dropdown'))
    expect(dropdown).toBeFalsy()
  })

  it('should close dropdown when dropdown is clicked', () => {
    // Arrange
    const button = fixture.debugElement.query(By.css('button'))
    button.triggerEventHandler('click', null)
    fixture.detectChanges()

    // Act
    const dropdown = fixture.debugElement.query(By.css('.dropdown'))
    dropdown.triggerEventHandler('click', null)
    fixture.detectChanges()

    // Assert
    const dropdownAfterClick = fixture.debugElement.query(By.css('.dropdown'))
    expect(dropdownAfterClick).toBeFalsy()
  })

  it('should close dropdown when mouse leaves', () => {
    // Arrange
    const button = fixture.debugElement.query(By.css('button'))
    button.triggerEventHandler('click', null)
    fixture.detectChanges()

    // Act
    const dropdownContainer = fixture.debugElement.query(By.css('div'))
    dropdownContainer.triggerEventHandler('mouseleave', null)
    fixture.detectChanges()

    // Assert
    const dropdown = fixture.debugElement.query(By.css('.dropdown'))
    expect(dropdown).toBeFalsy()
  })
})
