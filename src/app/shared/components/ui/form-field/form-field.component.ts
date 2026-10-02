import { ChangeDetectionStrategy, Component, Input } from '@angular/core'

let nextFormFieldId = 0
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'

@Component({
  selector: 'polo-form-field',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.sass',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldComponent {
  @Input() label: string = ''
  @Input() description?: string
  @Input() controlId?: string
  @Input() required: boolean = false
  @Input() showOptional: boolean = true

  readonly descriptionId = `polo-form-field-description-${nextFormFieldId++}`
}
