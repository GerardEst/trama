import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { boardFrame } from 'src/app/core/interfaces/interfaces'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { ColorPickerComponent } from 'src/app/shared/components/ui/color-picker/color-picker.component'
import { ColorEdit } from 'src/app/shared/utils/color'
import { FrameColorsService } from '../../services/frame-colors.service'

@Component({
  selector: 'polo-frame-color-picker',
  standalone: true,
  imports: [ColorPickerComponent, TranslatePipe],
  templateUrl: './frame-color-picker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FrameColorPickerComponent {
  @Input({ required: true }) frame!: boardFrame

  constructor(public colors: FrameColorsService) {}

  select(color: string) {
    this.colors.setFrameColor(this.frame.id, color)
  }

  save(edit: ColorEdit) {
    this.colors.savePaletteColor(this.frame.id, edit)
  }
}
