import { storyEditorHtml, storyEditorValue } from './story-editor-html'
import { createStoryEditor } from './story-editor-runtime'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { GameEngineService } from '../../../playground/services/game-engine.service'
import { PlayerService } from '../../../playground/services/player.service'

describe('Legacy story text correction', () => {
  it('converts legacy variables and categories to editable tokens, including non-prefixed refs', () => {
    const html = storyEditorHtml('Gold: #gold, #condition_key, #name\n[inventory]', { gold: { name: 'Gold', type: 'stat' } })
    const document = new DOMParser().parseFromString(html, 'text/html')
    expect(document.querySelector('[data-key="gold"]')?.getAttribute('data-kind')).toBe('stat')
    expect(document.querySelector('[data-key="condition_key"]')?.getAttribute('data-kind')).toBe('condition')
    expect(document.querySelector('[data-key="name"]')?.getAttribute('data-kind')).toBe('property')
    expect(document.querySelector('[data-trama-category]')?.getAttribute('data-key')).toBe('inventory')
  })

  it('preserves interpolation when corrected legacy text is saved as HTML', () => {
    const story = new ActiveStoryService()
    const player = new PlayerService()
    player.playerStats.set([{ id: 'stat_gold', amount: 4 }])
    const engine = new GameEngineService(player, story)
    const corrected = storyEditorHtml('Gold: #stat_gold!')
    expect(engine.getTextWithFinalParameters(corrected)).toBe('<p>Gold: 4!</p>')
  })

  it('preserves legacy category tokens while correcting an inline-only answer', () => {
    const editor = createStoryEditor({ element: document.createElement('div'), content: 'Choose [inventory]',
      label: 'Answer', placeholder: '', inlineOnly: true })
    expect(storyEditorValue(editor)).toContain('data-trama-category=""')
    expect(storyEditorValue(editor)).toContain('data-key="inventory"')
    editor.destroy()
  })

  it('does not reinterpret literal hashes or brackets already authored as rich text', () => {
    const html = '<p title="#name">#name [category]</p>'
    expect(storyEditorHtml(html)).toBe(html)
  })
})
