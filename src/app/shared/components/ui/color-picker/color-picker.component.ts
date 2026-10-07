import { A11yModule } from '@angular/cdk/a11y'
import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { ColorEdit, ColorOption, isHexColor } from '../../../utils/color'
import { AnchoredPopoverComponent } from '../anchored-popover/anchored-popover.component'
import { AnchoredPopoverContentDirective } from '../anchored-popover/anchored-popover-content.directive'

@Component({
  selector: 'polo-color-picker',
  standalone: true,
  imports: [A11yModule, FormsModule, TranslatePipe, AnchoredPopoverComponent, AnchoredPopoverContentDirective],
  templateUrl: './color-picker.component.html',
  styleUrl: './color-picker.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorPickerComponent {
  @Input() options: readonly ColorOption[] = []
  @Input() value = ''
  @Input() label = ''
  @Input() hint = ''
  @Output() valueChange = new EventEmitter<string>()
  @Output() colorSave = new EventEmitter<ColorEdit>()
  @ViewChild(AnchoredPopoverComponent) popover!: AnchoredPopoverComponent
  @ViewChild('trigger') trigger!: ElementRef<HTMLButtonElement>
  @ViewChild('createButton') createButton?: ElementRef<HTMLButtonElement>
  @ViewChild('choices') choices?: ElementRef<HTMLElement>
  @ViewChild('nameInput') set nameInput(input: ElementRef<HTMLInputElement> | undefined) {
    if (input) setTimeout(() => {
      if (input.nativeElement.isConnected) input.nativeElement.focus()
    })
  }

  creating = false
  editing?: ColorOption
  name = ''
  hex = '#000000'

  get selectedColor(): ColorOption | undefined {
    return this.options.find((option) => option.value === this.value) ?? this.options[0]
  }

  get canSave(): boolean {
    return !!this.name.trim() && this.name.trim().length <= 40 && isHexColor(this.hex)
  }

  toggle() {
    if (this.popover.isOpen) this.popover.close()
    else {
      this.creating = false
      this.editing = undefined
      this.popover.open()
    }
  }

  select(value: string) {
    this.valueChange.emit(value)
    this.popover.close()
  }

  create() {
    this.editing = undefined
    this.name = ''
    this.hex = this.currentHex()
    this.creating = true
  }

  edit(color: ColorOption, event: Event) {
    if (color.editable === false) return
    this.editing = color
    this.name = color.name
    const button = event.currentTarget as HTMLElement
    const swatch = button.closest('li')?.querySelector<HTMLElement>('.colorPicker__swatch')
    this.hex = isHexColor(color.swatch) ? color.swatch : this.swatchHex(swatch)
    this.creating = true
  }

  private currentHex(): string {
    if (this.selectedColor && isHexColor(this.selectedColor.swatch)) return this.selectedColor.swatch
    return this.swatchHex(this.trigger.nativeElement.querySelector<HTMLElement>('.colorPicker__swatch'))
  }

  private swatchHex(swatch?: HTMLElement | null): string {
    const rgb = swatch && getComputedStyle(swatch).backgroundColor.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    return rgb
      ? '#' + rgb.slice(1, 4).map((channel) => Number(channel).toString(16).padStart(2, '0')).join('')
      : '#000000'
  }

  cancelCreate() {
    const editedKey = this.editing?.value
    this.creating = false
    this.editing = undefined
    setTimeout(() => {
      const button = editedKey
        ? Array.from(this.choices?.nativeElement.querySelectorAll<HTMLButtonElement>('.colorPicker__edit') ?? [])
          .find((item) => item.dataset['key'] === editedKey)
        : this.createButton?.nativeElement
      button?.focus()
    })
  }

  save() {
    if (!this.canSave) return
    this.colorSave.emit({ source: this.editing?.value, name: this.name.trim(), value: this.hex.toLowerCase() })
    this.popover.close()
  }

  navigate(event: KeyboardEvent) {
    if (!(event.target instanceof HTMLButtonElement) ||
      !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
    const list = event.target.closest('.colorPicker__choices')
    if (!list) return
    const buttons = Array.from(list.querySelectorAll<HTMLButtonElement>('.colorPicker__option, .colorPicker__create'))
    const control = event.target.matches('.colorPicker__edit')
      ? event.target.closest('li')?.querySelector<HTMLButtonElement>('.colorPicker__option')
      : event.target
    const index = control ? buttons.indexOf(control) : -1
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 :
      (index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length
    event.preventDefault()
    buttons[next]?.focus()
  }

  @HostListener('pointerdown', ['$event'])
  @HostListener('mousedown', ['$event'])
  @HostListener('touchstart', ['$event'])
  stopDrag(event: Event) {
    event.stopPropagation()
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    // Keep board shortcuts and dragging out of this control.
    event.stopPropagation()
    if (event.key !== 'Escape' || !this.popover.isOpen) return
    event.preventDefault()
    if (this.creating) this.cancelCreate()
    else this.popover.close()
  }
}
