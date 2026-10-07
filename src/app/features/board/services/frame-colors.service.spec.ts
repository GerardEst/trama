import { TestBed } from '@angular/core/testing'
import { DatabaseService } from 'src/app/core/services/database.service'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { StoryMutationService } from 'src/app/shared/services/story-mutation.service'
import { FrameColorsService } from './frame-colors.service'

class DatabaseStub {
  saveTreeToDB = jasmine.createSpy('saveTreeToDB').and.resolveTo(true)
}

describe('FrameColorsService', () => {
  let activeStory: ActiveStoryService
  let colors: FrameColorsService

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ActiveStoryService,
        StoryMutationService,
        FrameColorsService,
        { provide: DatabaseService, useClass: DatabaseStub },
      ],
    })

    activeStory = TestBed.inject(ActiveStoryService)
    colors = TestBed.inject(FrameColorsService)
    activeStory.load('story-1', 'Story', {
      nodes: [
        { id: 'node_0', top: 0, left: 0, type: 'content', join: [{ node: 'node_1' }] },
        { id: 'node_1', top: 100, left: 100, type: 'end' },
      ],
      frames: [{ id: 'frame_0', name: 'Frame', nodeIds: ['node_0', 'node_1'] }],
    })
  })

  it('persists pastel frame colors and restores the default without changing nodes', async () => {
    const save = TestBed.inject(DatabaseService).saveTreeToDB as jasmine.Spy
    const frameId = 'frame_0'
    const nodes = structuredClone(activeStory.entireTree().nodes)
    colors.setFrameColor(frameId, 'rose')
    await Promise.resolve()
    expect(activeStory.entireTree().frames?.[0].colorId).toBe('rose')
    expect(save.calls.mostRecent().args[1].frames[0].colorId).toBe('rose')
    await Promise.resolve()
    save.calls.reset()
    colors.setFrameColor(frameId, 'rose')
    colors.setFrameColor(frameId, 'invalid')
    colors.setFrameColor('missing', 'blue')
    expect(save).not.toHaveBeenCalled()
    colors.setFrameColor(frameId, 'default')
    await Promise.resolve()
    expect(activeStory.entireTree().frames?.[0].colorId).toBeUndefined()
    expect(save.calls.mostRecent().args[1].frames[0].colorId).toBeUndefined()
    expect(activeStory.entireTree().nodes).toEqual(nodes)
    await Promise.resolve()
    save.calls.reset()
    // Custom colors must go through the story palette, never inline on the frame.
    colors.setFrameColor(frameId, '#aabbcc')
    expect(save).not.toHaveBeenCalled()
    expect(activeStory.entireTree().frames?.[0].colorId).toBeUndefined()
  })

  it('shares stable palette IDs across frames and persists edits with the story', async () => {
    const save = TestBed.inject(DatabaseService).saveTreeToDB as jasmine.Spy
    activeStory.load('story-1', 'Story', {
      ...activeStory.entireTree(),
      frames: [
        { id: 'battle-1', name: 'First', nodeIds: ['node_0'] },
        { id: 'battle-2', name: 'Second', nodeIds: ['node_1'] },
      ],
    })
    const nodes = structuredClone(activeStory.entireTree().nodes)
    const id = colors.savePaletteColor('battle-1', { name: 'Battle', value: '#aabbcc' })!
    expect(id).toBeTruthy()
    colors.setFrameColor('battle-2', id)
    colors.savePaletteColor('battle-1', { source: id, name: 'Conversation', value: '#112233' })
    await Promise.resolve()
    expect(activeStory.entireTree().frames?.map(frame => frame.colorId)).toEqual([id, id])
    expect(activeStory.entireTree().frameColors).toEqual([{ id, name: 'Conversation', value: '#112233' }])
    expect(activeStory.entireTree().nodes).toEqual(nodes)
    expect(save.calls.mostRecent().args[1].frameColors).toEqual(activeStory.entireTree().frameColors)
    activeStory.load('story-1', 'Reloaded', save.calls.mostRecent().args[1])
    expect(activeStory.entireTree().frames?.[1].colorId).toBe(id)
    activeStory.load('story-2', 'Other story', { nodes: [] })
    expect(activeStory.entireTree().frameColors).toBeUndefined()
  })

  it('edits presets for every frame using them, including frames inside groups', () => {
    activeStory.load('story-1', 'Story', {
      ...activeStory.entireTree(),
      frames: [
        { id: 'first', name: 'First', nodeIds: ['node_0'] },
        { id: 'second', name: 'Second', nodeIds: ['node_1'], colorId: 'mint', groupId: 'group-1' },
        { id: 'other', name: 'Other', nodeIds: [], colorId: 'blue' },
      ],
    })
    const save = TestBed.inject(DatabaseService).saveTreeToDB as jasmine.Spy
    expect(colors.savePaletteColor('first', { source: 'mint', name: 'Battle', value: '#ABCDEF' })).toBe('mint')
    expect(save).toHaveBeenCalledTimes(1)
    expect(activeStory.entireTree().frameColors).toEqual([{ id: 'mint', name: 'Battle', value: '#abcdef' }])
    expect(activeStory.entireTree().frames?.map(frame => frame.colorId)).toEqual(['mint', 'mint', 'blue'])
    colors.setFrameColor('first', 'default')
    expect(activeStory.entireTree().frames?.[0].colorId).toBeUndefined()
    expect(activeStory.entireTree().frameColors).toHaveSize(1)
  })

  it('keeps distinct named colors even when their hex values match', () => {
    const frameId = 'frame_0'
    const battle = colors.savePaletteColor(frameId, { name: 'Battle', value: '#112233' })!
    const conversation = colors.savePaletteColor(frameId, { name: 'Conversation', value: '#112233' })!
    expect(conversation).not.toBe(battle)
    expect(activeStory.entireTree().frameColors).toHaveSize(2)
    colors.savePaletteColor(frameId, { source: battle, name: 'Battle renamed', value: '#445566' })
    expect(activeStory.entireTree().frameColors?.find(color => color.id === conversation)?.value).toBe('#112233')
  })

  it('rejects invalid edits, unknown references and attempts to edit the default', () => {
    const frameId = 'frame_0'
    const before = activeStory.entireTree()
    for (const edit of [
      { source: 'default', name: 'Default', value: '#123456' },
      { source: 'missing', name: 'Missing', value: '#123456' },
      { source: '#123456', name: 'Inline hex', value: '#123456' },
      { name: ' ', value: '#123456' },
      { name: 'x'.repeat(41), value: '#123456' },
      { name: 'Invalid', value: 'url(example)' },
    ]) {
      expect(colors.savePaletteColor(frameId, edit)).toBeUndefined()
    }
    expect(colors.savePaletteColor('missing', { name: 'Battle', value: '#123456' })).toBeUndefined()
    colors.setFrameColor(frameId, 'missing')
    expect(activeStory.entireTree()).toBe(before)
  })

  it('rebuilds options and tokens only when the palette itself changes', () => {
    const options = colors.options()
    activeStory.updateTree((tree) => { tree.nodes[0].left = 50 })
    expect(colors.options()).toBe(options)
    const id = colors.savePaletteColor('frame_0', { name: 'Battle', value: '#aabbcc' })!
    expect(colors.options()).not.toBe(options)
    expect(colors.token(id)).toBe('#aabbcc')
    expect(colors.token('mint')).toBe('var(--polo-color-frame-mint)')
    expect(colors.token(undefined)).toBe('var(--polo-color-border-hover)')
    expect(colors.token('missing')).toBe('var(--polo-color-border-hover)')
  })
})
