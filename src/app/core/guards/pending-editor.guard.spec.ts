import { Component, OnDestroy, ViewChild } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { RouterTestingHarness } from '@angular/router/testing'
import { RichTextFieldComponent } from 'src/app/features/board/components/rich-text/rich-text-field.component'
import { StoryEditorLoader } from 'src/app/features/board/components/rich-text/story-editor-loader.service'
import { pendingEditorGuard } from './pending-editor.guard'

@Component({
  standalone: true,
  imports: [RichTextFieldComponent],
  template: '<polo-rich-text-field label="Node text" text="Before" (saved)="save($event)" />',
})
class EditingPageComponent implements OnDestroy {
  @ViewChild(RichTextFieldComponent) field!: RichTextFieldComponent
  readonly lifecycle: string[] = []

  save(html: string) { this.lifecycle.push(`saved:${html}`) }
  commitEdits() {
    this.lifecycle.push('commit')
    this.field.commit()
  }
  ngOnDestroy() { this.lifecycle.push(`destroyed:${this.field.inlineEditor?.isDestroyed}`) }
}

@Component({ standalone: true, template: 'Other page' })
class OtherPageComponent {}

describe('pendingEditorGuard', () => {
  it('flushes a focused inline draft before its child editor and output subscriptions are destroyed', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([
      { path: 'edit', component: EditingPageComponent, canDeactivate: [pendingEditorGuard] },
      { path: 'other', component: OtherPageComponent },
    ])] })
    await TestBed.inject(StoryEditorLoader).load()
    const harness = await RouterTestingHarness.create()
    const page = await harness.navigateByUrl('/edit', EditingPageComponent)
    page.field.preview!.nativeElement.focus()
    await harness.fixture.whenStable()
    expect(page.field.inlineEditor).toBeDefined()
    page.field.inlineEditor!.commands.setContent('<p>Last unsaved draft</p>')
    expect(page.lifecycle).toEqual([])
    await harness.navigateByUrl('/other', OtherPageComponent)
    expect(page.lifecycle).toEqual(['commit', 'saved:<p>Last unsaved draft</p>', 'destroyed:true'])
  })
})
