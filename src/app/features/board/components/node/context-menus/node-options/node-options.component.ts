import { Component, EventEmitter, Input, Output } from '@angular/core'
import { BasicButtonComponent } from 'src/app/shared/components/ui/basic-button/basic-button.component'
import { PopupBaseComponent } from 'src/app/shared/components/ui/popup-base/popup-base.component'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'

@Component({
  selector: 'polo-node-options',
  standalone: true,
  imports: [BasicButtonComponent, TranslatePipe],
  templateUrl: './node-options.component.html',
  styleUrl: './node-options.component.sass',
})
export class NodeOptionsComponent extends PopupBaseComponent {
  @Input() type?: string
  @Input() nodeId?: string
  @Input() frameName?: string

  @Output() onDuplicateNode = new EventEmitter<void>()
  @Output() onRemoveNode = new EventEmitter<void>()
  @Output() removeFromFrame = new EventEmitter<void>()
  @Output() onAddImage = new EventEmitter<Event>()

  protected override closePopup(): void {
    super.closePopup()
  }
}
