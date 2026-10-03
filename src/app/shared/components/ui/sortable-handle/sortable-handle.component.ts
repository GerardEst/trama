import { ChangeDetectionStrategy, Component, Input } from '@angular/core'

@Component({
  selector: 'polo-sortable-handle',
  standalone: true,
  templateUrl: './sortable-handle.component.html',
  styleUrl: './sortable-handle.component.sass',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortableHandleComponent {
  @Input({ required: true }) label = ''
}
