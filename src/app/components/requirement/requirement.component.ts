import { Component, EventEmitter, Output, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SelectorComponent } from '../ui/selector/selector.component'
import { ActiveStoryService } from 'src/app/services/active-story.service'
import { ContextMenusService } from 'src/app/services/context-menus.service'
import { SelectOrCreateComponent } from 'src/app/context-menus/select-or-create/select-or-create.component'
import { BasicButtonComponent } from 'src/app/components/ui/basic-button/basic-button.component'
@Component({
  selector: 'polo-requirement',
  standalone: true,
  imports: [
    CommonModule,
    SelectorComponent,
    SelectOrCreateComponent,
    BasicButtonComponent,
  ],
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

  selectedOptionName?: string

  constructor(
    private activeStory: ActiveStoryService,
    private contextMenu: ContextMenusService
  ) {}

  ngOnInit() {
    this.selectedOptionName = this.id
      ? this.activeStory.getRefName(this.id)
      : ''
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
        contextMenu.setInput('selectedOption', event.value)
        this.selectedOptionName = this.activeStory.getRefName(event.value)
        this.onChangeElement.emit(event)

        this.contextMenu.close()
      }
    )
    contextMenu.instance.onNewOption.subscribe((event: string) => {
      if (!this.type) {
        console.log('No type defined for this requirement')
        return
      }

      const createdRef = this.activeStory.createNewRef(event, this.type)
      if (createdRef) {
        this.selectedOptionName = this.activeStory.getRefName(createdRef.id)
        this.onChangeElement.emit({
          value: createdRef.id,
          previousValue: contextMenu.instance.selectedOption,
        })
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
      console.log('No type defined for this requirement')
      return
    }

    return this.activeStory.getRefsFormatted(this.type)
  }
}
