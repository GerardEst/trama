import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BasicButtonComponent } from 'src/app/components/ui/basic-button/basic-button.component'
@Component({
  selector: 'polo-dropdown-buttons',
  standalone: true,
  imports: [CommonModule, BasicButtonComponent],
  templateUrl: './dropdown-buttons.component.html',
  styleUrls: ['./dropdown-buttons.component.sass'],
})
export class DropdownButtonsComponent {
  @Input() label?: string
  openedDropdown: boolean = false

  toggleDropdown() {
    this.openedDropdown = !this.openedDropdown
  }

  closeDropdown() {
    this.openedDropdown = false
  }
}
