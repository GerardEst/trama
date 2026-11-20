import { Component, ViewChild } from '@angular/core'
import { RouterLink } from '@angular/router'
import { A11yModule } from '@angular/cdk/a11y'
import { ModalWindowComponent } from 'src/app/shared/components/ui/modal-window/modal-window.component'
import { DialogHeaderComponent } from 'src/app/shared/components/dialog-header/dialog-header.component'
import { StoryOptionsComponent } from 'src/app/shared/components/story-options/story-options.component'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'

/**
 * The open story's options, in a dialog from the editor, as a shortcut for what is changed while
 * trying the story. Every other setting, its data and deleting it are in the story's General page.
 */
@Component({
  selector: 'polo-story-options-modal',
  standalone: true,
  imports: [ModalWindowComponent, DialogHeaderComponent, StoryOptionsComponent, TranslatePipe, A11yModule, RouterLink],
  templateUrl: './story-options-modal.component.html',
  styleUrl: './story-options-modal.component.css',
})
export class StoryOptionsModalComponent {
  @ViewChild(ModalWindowComponent) window?: ModalWindowComponent

  constructor(public activeStory: ActiveStoryService) {}
}
