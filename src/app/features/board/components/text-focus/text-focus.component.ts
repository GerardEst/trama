import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, input, output } from '@angular/core'

@Component({
  selector: 'polo-text-focus',
  standalone: true,
  templateUrl: './text-focus.component.html',
  styleUrl: './text-focus.component.sass',
  host: { '(keydown.escape)': 'onEscape($event)' },
})
export class TextFocusComponent implements OnInit, AfterViewInit {
  readonly label = input.required<string>()
  readonly text = input.required<string>()
  readonly closed = output<string>()

  @ViewChild('dialog') dialog!: ElementRef<HTMLDialogElement>
  @ViewChild('editor') editor!: ElementRef<HTMLTextAreaElement>

  draft = ''

  ngOnInit() {
    this.draft = this.text()
  }

  ngAfterViewInit() {
    this.dialog.nativeElement.showModal()
    this.editor.nativeElement.focus()
  }

  updateDraft(event: Event) {
    this.draft = (event.target as HTMLTextAreaElement).value
  }

  close() {
    this.dialog.nativeElement.close()
  }

  onEscape(event: Event) {
    event.preventDefault()
    event.stopPropagation()
    this.close()
  }

  onBackdropPointerDown(event: PointerEvent) {
    if (event.target === this.dialog.nativeElement) this.close()
  }

  onClosed() {
    this.closed.emit(this.draft)
  }
}
