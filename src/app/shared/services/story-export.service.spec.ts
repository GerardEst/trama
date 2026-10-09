import { fakeAsync, TestBed, tick } from '@angular/core/testing'
import { ActiveStoryService } from './active-story.service'
import { StoryExportService } from './story-export.service'

describe('StoryExportService', () => {
  let service: StoryExportService
  let activeStory: ActiveStoryService
  let createUrl: jasmine.Spy
  let revokeUrl: jasmine.Spy
  let click: jasmine.Spy
  let downloadedAnchor: HTMLAnchorElement

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(StoryExportService)
    activeStory = TestBed.inject(ActiveStoryService)
    createUrl = spyOn(URL, 'createObjectURL').and.returnValue('blob:story-export')
    revokeUrl = spyOn(URL, 'revokeObjectURL')
    click = spyOn(HTMLAnchorElement.prototype, 'click').and.callFake(() => {
      downloadedAnchor = document.querySelector<HTMLAnchorElement>('a[download]')!
      expect(downloadedAnchor.isConnected).toBeTrue()
    })
  })

  it('downloads readable JSON with the complete live tree and configuration', async () => {
    activeStory.load('story-1', 'L’illa deserta', {
      nodes: [{
        id: 'node_0', type: 'content', top: 10, left: 20,
        text: '<p>Què faràs? 🏝️</p>',
        image: { path: 'story-1/island.png' },
        answers: [{
          id: 'node_0_answer_0', text: 'Continua',
          join: [{ node: 'node_1' }],
          requirements: [{ id: 'energy', type: 'stat', amount: 2 }],
          events: [{ id: 'event_0', action: 'alterStat', type: 'stat', amount: '-1', target: 'energy' }],
        }],
      }, { id: 'node_1', type: 'end', top: 30, left: 40 }],
      refs: { energy: { name: 'Energia', type: 'stat', category: 'stats' } },
      categories: [{ id: 'stats', name: 'Estadístiques' }],
      frames: [{ id: 'frame_0', name: 'Inici', nodeIds: ['node_0'], colorId: 'battle' }],
      frameColors: [{ id: 'battle', name: 'Batalla', value: '#aabbcc' }],
      entryPoint: { left: -100, top: 50, targetNodeId: 'node_1' },
    })
    activeStory.updateTree((draft) => { draft.nodes[1].text = 'Canvi encara no desat' })
    activeStory.patchConfiguration({
      customId: 'illa', cumulativeMode: true, tracking: true, sharing: true,
      footer: { text: 'Autora', link: 'https://example.com' },
    })
    const originalTree = activeStory.entireTree()

    fakeAsync(() => {
      service.downloadJson()
      tick(1000)
    })()

    const blob = createUrl.calls.mostRecent().args[0] as Blob
    expect(blob.type).toBe('application/json;charset=utf-8')
    const json = await blob.text()
    const exported = JSON.parse(json)
    expect(exported).toEqual({
      format: 'trama-story', version: 1, exportedAt: jasmine.any(String),
      id: 'story-1', name: 'L’illa deserta',
      tree: originalTree, configuration: activeStory.storyConfiguration(),
    })
    expect(Number.isNaN(Date.parse(exported.exportedAt))).toBeFalse()
    expect(json).toContain('\n  "tree": {')
    expect(exported.tree.frameColors).toEqual([{ id: 'battle', name: 'Batalla', value: '#aabbcc' }])
    expect(activeStory.entireTree()).toBe(originalTree)
    activeStory.load('imported-story', exported.name, exported.tree)
    expect(activeStory.initialNode()?.id).toBe('node_1')
    expect(activeStory.entireTree().entryPoint).toEqual({ left: -100, top: 50, targetNodeId: 'node_1' })
    expect(activeStory.entireTree().frames?.[0].colorId).toBe('battle')
    expect(activeStory.entireTree().frameColors).toEqual(exported.tree.frameColors)
    expect(downloadedAnchor.download).toBe('l-illa-deserta.json')
    expect(click).toHaveBeenCalledTimes(1)
  })

  it('does not download anything without an active story', () => {
    service.downloadJson()
    expect(createUrl).not.toHaveBeenCalled()
    expect(click).not.toHaveBeenCalled()
  })

  it('exports normalized older stories with missing optional fields', async () => {
    activeStory.load('old-story', 'Old story', { nodes: [] })
    fakeAsync(() => {
      service.downloadJson()
      tick(1000)
    })()

    const blob = createUrl.calls.mostRecent().args[0] as Blob
    expect(JSON.parse(await blob.text()).tree).toEqual({
      nodes: [], refs: {}, categories: [], entryPoint: { left: 5000, top: 5000 },
    })
  })

  it('uses a safe file name and falls back for empty names', fakeAsync(() => {
    activeStory.load('story-1', '../ Història / difícil :?', { nodes: [] })
    service.downloadJson()
    expect(downloadedAnchor.download).toBe('historia-dificil.json')
    activeStory.setStoryName('   ')
    service.downloadJson()
    expect(downloadedAnchor.download).toBe('story.json')
    tick(1000)
  }))

  it('removes the temporary link and releases its URL after starting the download', fakeAsync(() => {
    activeStory.load('story-1', 'Story', { nodes: [] })
    service.downloadJson()
    expect(downloadedAnchor.isConnected).toBeFalse()
    expect(revokeUrl).not.toHaveBeenCalled()
    tick(1000)
    expect(revokeUrl).toHaveBeenCalledOnceWith('blob:story-export')
  }))

  it('cleans up even if the download fails', fakeAsync(() => {
    activeStory.load('story-1', 'Story', { nodes: [] })
    click.and.callFake(() => {
      downloadedAnchor = document.querySelector<HTMLAnchorElement>('a[download]')!
      throw new Error('Download failed')
    })
    expect(() => service.downloadJson()).toThrowError('Download failed')
    expect(downloadedAnchor.isConnected).toBeFalse()
    tick(1000)
    expect(revokeUrl).toHaveBeenCalledOnceWith('blob:story-export')
  }))
})
