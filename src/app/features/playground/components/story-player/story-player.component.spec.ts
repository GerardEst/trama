import { ComponentFixture, TestBed } from '@angular/core/testing'
import { createGame, Game, StoryTree } from '@trama-app/engine'
import { node } from 'src/app/core/interfaces/interfaces'
import { StoryPlayerComponent } from './story-player.component'

const scene = (id: string, overrides: Partial<node> = {}): node => ({ id, type: 'content', top: 0, left: 0, ...overrides })
const token = (kind: string, key: string) =>
  `<span data-trama-variable="" data-kind="${kind}" data-key="${key}">#${key}</span>`

describe('StoryPlayerComponent', () => {
  let fixture: ComponentFixture<StoryPlayerComponent>
  let component: StoryPlayerComponent
  let game: Game

  function play(storyTree: StoryTree, mode: 'single' | 'cumulative' = 'cumulative') {
    TestBed.configureTestingModule({ imports: [StoryPlayerComponent] })
    // Fixtures start at their first node unless they configure the entry.
    game = createGame({ entryPoint: { targetNodeId: storyTree.nodes?.[0]?.id }, ...storyTree })
    fixture = TestBed.createComponent(StoryPlayerComponent)
    component = fixture.componentInstance
    fixture.componentRef.setInput('game', game)
    fixture.componentRef.setInput('mode', mode)
    fixture.detectChanges()
  }

  const text = () => (fixture.nativeElement as HTMLElement).textContent ?? ''
  const answers = () => Array.from((fixture.nativeElement as HTMLElement)
    .querySelectorAll<HTMLButtonElement>('.node__answers button'), button => button.textContent?.trim())

  it('starts at the configured first scene rather than node_0', () => {
    play({ nodes: [scene('node_0', { text: 'Old first' }), scene('node_1', { text: 'Chosen first' })],
      entryPoint: { left: 0, top: 0, targetNodeId: 'node_1' } })
    expect(text()).toContain('Chosen first')
    expect(text()).not.toContain('Old first')
  })

  it('reports a disconnected start', () => {
    play({ nodes: [scene('node_0', { text: 'Do not start here' })], entryPoint: { left: 0, top: 0 } })
    expect(component.activeNodes()).toEqual([])
    expect(fixture.nativeElement.querySelector('[role="status"]')?.textContent).toContain('no connected starting point')
  })

  it('shows passages and answers immediately and plays a chosen answer', () => {
    play({ nodes: [scene('node_0', { text: 'Choose your path', answers: [
      { id: 'left', text: 'Go left', join: [{ node: 'node_1' }],
        events: [{ id: 'e', target: 'condition_key', type: 'condition', amount: '1', action: 'alterCondition' }] },
      { id: 'right', text: 'Go right', join: [{ node: 'node_1' }] },
    ] }), scene('node_1', { text: 'Left it is' })] })
    expect(text()).toContain('Choose your path')
    expect(answers()).toEqual(['Go left', 'Go right'])
    fixture.nativeElement.querySelector('.node__answers button').click()
    fixture.detectChanges()
    expect(text()).toContain('Left it is')
    expect(game.getState().player.conditions).toEqual(['condition_key'])
  })

  it('ignores unconnected answers', () => {
    play({ nodes: [scene('node_0', { text: 'Stuck', answers: [{ id: 'a', text: 'Nowhere' }] })] })
    component.choose({ id: 'a' })
    expect(game.getState().cursor).toBe(0)
  })

  it('retains automatic passages in the current step but hides empty answers', () => {
    play({ nodes: [scene('node_0', { text: 'A question', join: [{ node: 'node_1' }, { node: 'node_2' }],
      answers: [{ id: 'empty', text: '', join: [] }] }), scene('node_1', { type: 'end' }), scene('node_2', { type: 'end' })] })
    expect(answers()).toEqual([])
    expect(component.activeNodes()[0].id).toBe('node_0')
    expect(['node_1', 'node_2']).toContain(component.activeNodes()[1].id)
  })

  it('applies arrival events before filtering and interpolating answers', () => {
    play({ nodes: [scene('node_0', { text: token('condition', 'condition_key'), events: [{ id: 'key', target: 'condition_key',
      type: 'condition', amount: '1', action: 'alterCondition' }], answers: [
      { id: 'yes', text: 'Yes', join: [{ node: 'node_1' }], requirements: [{ target: 'condition_key', type: 'condition', amount: 1 }] },
      { id: 'no', text: 'No', join: [{ node: 'node_2' }], requirements: [{ target: 'condition_key', type: 'condition', amount: 0 }] },
    ] })] })
    expect(component.activeNodes()[0].answers?.map(answer => answer.id)).toEqual(['yes'])
    expect(component.activeNodes()[0].text).toBe('true')
  })

  it('submits text input', () => {
    play({ nodes: [scene('node_0', { type: 'text', text: 'Name?', userTextOptions: { property: 'name' }, join: [{ node: 'node_1' }] }),
      scene('node_1', { type: 'end', text: `Bye ${token('property', 'name')}` })] })
    component.submitText({ property: 'name', value: 'Ada' })
    fixture.detectChanges()
    expect(text()).toContain('Bye Ada')
  })

  it('keeps earlier steps only in cumulative mode', () => {
    const storyTree = { nodes: [scene('node_0', { text: 'First', answers: [{ id: 'a', text: 'Next', join: [{ node: 'node_1' }] }] }),
      scene('node_1', { text: 'Second' })] }
    play(storyTree)
    component.choose({ id: 'a' })
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('polo-cumulative-game')).not.toBeNull()
    expect(text()).toContain('First')
    fixture.componentRef.setInput('mode', 'single')
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('polo-cumulative-game')).toBeNull()
    expect(fixture.nativeElement.querySelector('polo-single-game')).not.toBeNull()
    expect(text()).not.toContain('First')
    expect(text()).toContain('Second')
  })

  it('releases the game, viewport and scroll tracking when removed', () => {
    play({ nodes: [scene('node_0', { text: 'A', answers: [{ id: 'a', text: 'Again', join: [{ node: 'node_0' }] }] })] })
    const disconnect = spyOn(ResizeObserver.prototype, 'disconnect').and.callThrough()
    const remove = spyOn(component.DOMgame.nativeElement, 'removeEventListener').and.callThrough()
    fixture.destroy()
    expect(disconnect).toHaveBeenCalledTimes(1)
    expect(remove).toHaveBeenCalledWith('scroll', jasmine.any(Function))
    const nodes = component.activeNodes()
    game.choose('a')
    expect(component.activeNodes()).toEqual(nodes)
  })
})
