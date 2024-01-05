import {
  Component,
  EventEmitter,
  Output,
  Input,
  ViewChild,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { SelectorComponent } from '../ui/selector/selector.component'
import { StorageService } from 'src/app/services/storage.service'

@Component({
  selector: 'polo-requirement',
  standalone: true,
  imports: [CommonModule, SelectorComponent],
  templateUrl: './requirement.component.html',
  styleUrls: ['./requirement.component.sass'],
})
export class RequirementComponent {
  @Output() onChangeElement: EventEmitter<any> = new EventEmitter()
  @Output() onChangeAmount: EventEmitter<any> = new EventEmitter()
  @Output() onDelete: EventEmitter<any> = new EventEmitter()
  @Input() id?: string
  @Input() amount?: number = 3
  @Input() type?: 'stat' | 'condition'
  @ViewChild('selector') selector?: any

  constructor(private storage: StorageService) {}

  changeElement(options: any) {
    this.onChangeElement.emit(options)
  }

  changeAmount(event: any) {
    this.onChangeAmount.emit({ id: this.id, value: event.target.value })
  }

  changeCheckbox(event: any) {
    this.onChangeAmount.emit({
      id: this.id,
      value: Number(event.target.checked),
    })
  }

  newOption(value: string) {
    if (!this.type) {
      console.warn('No type defined for this requirement')
      return
    }
    const createdRef = this.storage.createNewRef(value, this.type)
    if (createdRef) {
      if (this.selector) {
        this.selector.selectOption({
          id: createdRef.id,
          name: createdRef.name,
        })
      }
    }
  }

  removeRequirement() {
    this.onDelete.emit(this.id)
  }

  getFormattedRefsOfTree() {
    if (!this.type) {
      console.warn('No type defined for this requirement')
      return
    }
    return this.storage.getRefsFormatted(this.type)
  }
}
