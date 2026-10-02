import { Component, EventEmitter, Input, Output } from '@angular/core'
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms'
import { node_userTextOptions } from 'src/app/core/interfaces/interfaces'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'

@Component({
  selector: 'polo-game-text-input',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './game-text-input.component.html',
  styleUrl: './game-text-input.component.sass',
})
export class GameTextInputComponent {
  @Input() options?: node_userTextOptions
  @Output() submitted = new EventEmitter<string>()

  readonly userText = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(100)],
  })

  submit() {
    this.userText.markAsTouched()
    if (this.userText.invalid) return
    this.submitted.emit(this.userText.value)
  }
}
