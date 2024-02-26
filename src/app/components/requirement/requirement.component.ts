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
import { ContextMenusService } from 'src/app/services/context-menus.service'
import { SelectOrCreateComponent } from 'src/app/context-menus/select-or-create/select-or-create.component'

@Component({
  selector: 'polo-requirement',
  standalone: true,
  imports: [CommonModule, SelectorComponent, SelectOrCreateComponent],
  templateUrl: './requirement.component.html',
  styleUrls: ['./requirement.component.sass'],
})
export class RequirementComponent {
  @Output() onChangeElement: EventEmitter<any> = new EventEmitter()
  @Output() onChangeAmount: EventEmitter<any> = new EventEmitter()
  @Output() onDelete: EventEmitter<any> = new EventEmitter()
  @Input() id?: string
  @Input() amount?: number = 1
  @Input() type?: 'stat' | 'condition'
  // REF-1 @Input() alreadyUsedRequirements?: Array<any>
  @ViewChild('selector') selector?: any
  selectedOptionName?: string

  constructor(
    private storage: StorageService,
    private contextMenu: ContextMenusService
  ) {}

  ngOnInit() {
    this.selectedOptionName = this.id ? this.storage.getRefName(this.id) : ''
  }

  openSelectorFor(clickEvent: Event, refId: string | undefined) {
    const contextMenu = this.contextMenu.launch(
      SelectOrCreateComponent,
      clickEvent.target
    )

    contextMenu.setInput('options', this.getFormattedRefsOfTree())
    contextMenu.setInput('message', `Select a ${this.type} or create new one`)
    contextMenu.setInput('selectedOption', refId)

    contextMenu.instance.onSelectOption.subscribe(
      (event: { value: string; previousValue: string }) => {
        // update the selectedOption of the contextMenu
        contextMenu.setInput('selectedOption', event.value)

        // update selected name of this
        this.selectedOptionName = this.storage.getRefName(event.value)

        // send the event for external calculations
        this.onChangeElement.emit(event)

        this.contextMenu.close()
      }
    )
    contextMenu.instance.onNewOption.subscribe((event: string) => {
      if (!this.type) {
        console.warn('No type defined for this requirement')
        return
      }
      const createdRef = this.storage.createNewRef(event, this.type)
      if (createdRef) {
        if (this.selector) {
          this.selector.selectOption({
            id: createdRef.id,
            name: createdRef.name,
          })
        }
      }

      this.contextMenu.close()
    })
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

  removeRequirement() {
    this.onDelete.emit(this.id)
  }

  getFormattedRefsOfTree() {
    if (!this.type) {
      console.warn('No type defined for this requirement')
      return
    }
    /**
     * REF-1 ->
    /** Tenim els refs possibles a refs, que retorna tot lo que podriem voler posar al selector
     * Tenim els alreadyUsedRequirements amb tot lo que ja hi ha seleccionat al requirement
     *
     * Volem que els refs eliminin el que ja està fet servir, per tant hauria de ser algo com agafar els
     * used i fer un negatiu
     *
     * Ara el problema es que com que no retorna, tampoc emplenem els bujeros del select
     * Ames no s'actualitza al moment
     */

    const refs = this.storage.getRefsFormatted(this.type)

    // if (!this.alreadyUsedRequirements) return refs

    // let usedRefIds = this.alreadyUsedRequirements.map((ref) => ref.id)
    // let result = refs.filter((ref) => !usedRefIds.includes(ref.id))

    return refs
  }
}
