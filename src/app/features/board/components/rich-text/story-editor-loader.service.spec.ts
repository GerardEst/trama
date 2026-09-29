import { TestBed } from '@angular/core/testing'
import { StoryEditorLoader } from './story-editor-loader.service'

describe('StoryEditorLoader', () => {
  it('downloads the editor runtime once and shares it', async () => {
    const loader = TestBed.inject(StoryEditorLoader)
    const first = loader.load()
    expect(loader.load()).toBe(first)
    const runtime = await first
    expect(typeof runtime.createStoryEditor).toBe('function')
  })
})
