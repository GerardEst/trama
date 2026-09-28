import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, input, output } from '@angular/core'

@Component({
  selector: 'polo-node-full',
  standalone: true,
  templateUrl: './node-full.component.html',
  styleUrl: './node-full.component.sass',
})
export class NodeFullComponent implements OnInit, AfterViewInit {
  readonly nodeId = input.required<string>()
  readonly type = input.required<'text' | 'content' | 'end'>()
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

  onBackdropPointerDown(event: PointerEvent) {
    if (event.target === this.dialog.nativeElement) this.close()
  }

  onClosed() {
    this.closed.emit(this.draft)
  }
}
