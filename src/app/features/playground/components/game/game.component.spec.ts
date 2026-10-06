import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing'
import { node } from 'src/app/core/interfaces/interfaces'
import { PlayerService } from '../../services/player.service'
import { GameComponent } from './game.component'

const scene = (id: string, overrides: Partial<node> = {}): node => ({ id, type: 'content', top: 0, left: 0, ...overrides })

describe('GameComponent', () => {
  let component: GameComponent
  let fixture: ComponentFixture<GameComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [GameComponent] }).compileComponents()
    fixture = TestBed.createComponent(GameComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  function load(nodes: node[]) {
    component.activeStory.load('story', 'Story', { nodes })
    fixture.detectChanges()
  }

  it('creates the player shell', () => {
    expect(component).toBeTruthy()
  })

  it('releases viewport and scroll tracking when the player is removed', () => {
    const disconnect = spyOn(ResizeObserver.prototype, 'disconnect').and.callThrough()
    const remove = spyOn(component.DOMgame.nativeElement, 'removeEventListener').and.callThrough()
    component.ngOnDestroy()
    expect(disconnect).toHaveBeenCalledTimes(1)
    expect(remove).toHaveBeenCalledWith('scroll', jasmine.any(Function))
  })

  it('applies an answer event only when selected and emits the selection', () => {
    const answer = { id: 'yes', events: [{ id: 'e2', target: 'condition_key', type: 'condition' as const,
      amount: '1', action: 'alterCondition' as const }], join: [{ node: 'node_1' }] }
    load([scene('node_0', { answers: [answer] }), scene('node_1')])
    const emitted = spyOn(component.onSelectAnswer, 'emit')
    expect(TestBed.inject(PlayerService).playerConditions()).toEqual([])
    component.selectAnswer(answer)
    expect(TestBed.inject(PlayerService).playerConditions()).toEqual([{ id: 'condition_key' }])
    expect(component.activeNodes[0].id).toBe('node_1')
    expect(emitted).toHaveBeenCalledWith(answer)
  })

  it('does not apply events or advance for an unconnected answer', () => {
    load([scene('node_0')])
    const apply = spyOn(component.gameEngine, 'applyEvents')
    component.selectAnswer({ id: 'a', join: [], events: [] })
    expect(apply).not.toHaveBeenCalled()
    expect(component.activeNodes[0].id).toBe('node_0')
  })

  it('shows passages and answers immediately and draws two connected answers separately', () => {
    load([scene('node_0', { text: 'Choose your path', answers: [
      { id: 'left', text: 'Go left', join: [{ node: 'node_1' }] },
      { id: 'right', text: 'Go right', join: [{ node: 'node_2' }] },
    ] })])
    expect(fixture.nativeElement.textContent).toContain('Choose your path')
    const buttons = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('.node__answers button')
    expect(Array.from(buttons, button => button.textContent?.trim())).toEqual(['Go left', 'Go right'])
  })

  it('retains automatic passages in the current step but hides empty answers', fakeAsync(() => {
    load([scene('node_0', { text: 'A question', join: [{ node: 'node_1' }, { node: 'node_2' }],
      answers: [{ id: 'empty', text: '', join: [] }] }), scene('node_1', { type: 'end' }), scene('node_2', { type: 'end' })])
    tick()
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelectorAll('.node__answers button')).toHaveSize(0)
    expect(component.activeNodes[0].id).toBe('node_0')
    expect(['node_1', 'node_2']).toContain(component.activeNodes[1].id)
    flush()
  }))

  it('applies arrival events before filtering and interpolating answers and notifies tracking', () => {
    const drawn = spyOn(component.onDrawNode, 'emit')
    load([scene('node_0', { text: '#condition_key', events: [{ id: 'key', target: 'condition_key',
      type: 'condition', amount: '1', action: 'alterCondition' }], answers: [
      { id: 'yes', text: 'Yes', join: [{ node: 'node_1' }], requirements: [{ target: 'condition_key', type: 'condition', amount: 1 }] },
      { id: 'no', text: 'No', join: [{ node: 'node_2' }], requirements: [{ target: 'condition_key', type: 'condition', amount: 0 }] },
    ] })])
    expect(component.activeNodes[0].answers?.map(answer => answer.id)).toEqual(['yes'])
    expect(component.activeNodes[0].text).toBe('true')
    expect(drawn).toHaveBeenCalledWith(jasmine.objectContaining({ text: 'true' }))
  })

  it('isolates the single and cumulative presentations', () => {
    load([scene('node_0', { text: 'First', answers: [{ id: 'a', text: 'Next', join: [{ node: 'node_1' }] }] }),
      scene('node_1', { text: 'Second' })])
    component.selectAnswer(component.activeNodes[0].answers![0])
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('polo-cumulative-game')).not.toBeNull()
    expect(fixture.nativeElement.textContent).toContain('First')
    component.mode = 'single'
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('polo-cumulative-game')).toBeNull()
    expect(fixture.nativeElement.querySelector('polo-single-game')).not.toBeNull()
    expect(fixture.nativeElement.textContent).not.toContain('First')
    expect(fixture.nativeElement.textContent).toContain('Second')
  })
})
