import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { CdkDragHandle } from '@angular/cdk/drag-drop'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { ContextHelpComponent } from 'src/app/shared/context-help/context-help.component'
import { BoardAnchorDirective } from '../../directives/board-anchor.directive'
import { ENTRY_POINT_ORIGIN } from '../../board-interactions'

/** A visual entry marker, deliberately independent of NodeComponent. */
@Component({
  selector: 'polo-entry-point',
  standalone: true,
  imports: [CdkDragHandle, BoardAnchorDirective, TranslatePipe, ContextHelpComponent],
  templateUrl: './entry-point.component.html',
  styleUrl: './entry-point.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntryPointComponent {
  @Input() connected = false
  readonly origin = ENTRY_POINT_ORIGIN
}
