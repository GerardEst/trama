import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'polo-dropdown-buttons',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dropdown-buttons.component.html',
  styleUrls: ['./dropdown-buttons.component.sass'],
})
export class DropdownButtonsComponent {
  @Input() label?: string
  openedDropdown: boolean = false

  toggleDropdown() {
    this.openedDropdown = !this.openedDropdown
  }
}
