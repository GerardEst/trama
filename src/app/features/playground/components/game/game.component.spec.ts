import {
  ComponentFixture,
  fakeAsync,
  flush,
  TestBed,
  tick,
} from '@angular/core/testing'
import { node } from 'src/app/core/interfaces/interfaces'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { PlayerService } from 'src/app/features/playground/services/player.service'

import { GameComponent } from './game.component'

describe('GameComponent', () => {
  let component: GameComponent
  let fixture: ComponentFixture<GameComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameComponent, NoopAnimationsModule],
    }).compileComponents()

    fixture = TestBed.createComponent(GameComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('applies an answer event only when the answer is selected', () => {
    const answer = {
      id: 'yes',
      events: [
        {
          id: 'e2',
          target: 'condition_key',
          type: 'condition' as const,
          amount: '1',
          action: 'alterCondition' as const,
        },
      ],
      join: [{ node: 'node_2' }],
    }
    const apply = spyOn(component.gameEngine, 'applyEvents')
    const nextStep = spyOn(component, 'nextStep')

    expect(apply).not.toHaveBeenCalled()
    component.selectAnswer(answer)

    expect(apply).toHaveBeenCalledOnceWith(answer.events)
    expect(nextStep).toHaveBeenCalledWith(answer.join)
  })

  it('does not apply events or advance for an unconnected answer', () => {
    const answer = {
      id: 'answer_0_0',
      text: '',
      events: [
        {
          id: 'e', target: 'stat_gold', type: 'stat' as const,
          amount: '1', action: 'alterStat' as const,
        },
      ],
      join: [],
    }
    const apply = spyOn(component.gameEngine, 'applyEvents')
    const nextStep = spyOn(component, 'nextStep')

    component.selectAnswer(answer)

    expect(apply).not.toHaveBeenCalled()
    expect(nextStep).not.toHaveBeenCalled()
  })

  it('does not show an empty answer when a node randomly joins two endings', fakeAsync(() => {
    const nodes: Record<string, node> = {
      node_0: {
        id: 'node_0', type: 'content', top: 0, left: 0,
        text: 'A question',
        join: [{ node: 'node_1' }, { node: 'node_2' }],
        answers: [{ id: 'answer_0_0', text: '', join: [] }],
      },
      node_1: { id: 'node_1', type: 'end', top: 0, left: 0 },
      node_2: { id: 'node_2', type: 'end', top: 0, left: 0 },
    }
    spyOn(component.gameEngine, 'buildNextNodeFromJoin').and.callFake(
      (storyJoin) => structuredClone(nodes[storyJoin.node])
    )

    component.nextStep([{ node: 'node_0' }])
    tick(1200)
    fixture.detectChanges()

    expect(fixture.nativeElement.querySelectorAll('.answers button').length)
      .toBe(0)
    expect(component.activeNodes[0].id).toBe('node_0')

    tick(1200)
    expect(['node_1', 'node_2']).toContain(component.activeNodes[1].id)
    flush()
  }))

  it('shows a passage and its answers without waiting for an animation', () => {
    const storyNode: node = {
      id: 'node_0', type: 'content', top: 0, left: 0,
      text: 'Choose your path',
      answers: [{ id: 'left', text: 'Left', join: [{ node: 'node_1' }] }],
    }
    spyOn(component.gameEngine, 'buildNextNodeFromJoin').and.returnValue(storyNode)

    component.nextStep([{ node: 'node_0' }])
    fixture.detectChanges()

    expect(fixture.nativeElement.textContent).toContain('Choose your path')
    expect(fixture.nativeElement.textContent).toContain('Left')
  })

  it('renders two connected answers as separate choices', () => {
    const storyNode: node = {
      id: 'node_0', type: 'content', top: 0, left: 0,
      text: 'Which path?',
      answers: [
        { id: 'left', text: 'Go left', join: [{ node: 'node_1' }] },
        { id: 'right', text: 'Go right', join: [{ node: 'node_2' }] },
      ],
    }
    spyOn(component.gameEngine, 'buildNextNodeFromJoin').and.returnValue(storyNode)

    component.nextStep([{ node: 'node_0' }])
    fixture.detectChanges()

    const buttons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('.node__answers button')
    expect(Array.from(buttons, button => button.textContent?.trim())).toEqual(['Go left', 'Go right'])
  })

  it('applies distributor events before choosing a condition branch', fakeAsync(() => {
    const player = TestBed.inject(PlayerService)
    player.playerStats.set([])

    const distributor: node = {
      id: 'node_1',
      type: 'distributor',
      top: 0,
      left: 0,
      events: [
        {
          id: 'event_gold',
          target: 'stat_gold',
          type: 'stat',
          amount: '1',
          action: 'alterStat',
        },
      ],
      conditions: [
        {
          id: 'condition_1_0',
          ref: 'stat_gold',
          comparator: 'equalto',
          value: 1,
          join: [{ node: 'node_2' }],
        },
      ],
      fallbackCondition: {
        id: 'condition_1_fallback',
        join: [{ node: 'node_3' }],
      },
    }
    const matchedNode: node = { id: 'node_2', type: 'end', top: 0, left: 0 }
    const fallbackNode: node = { id: 'node_3', type: 'end', top: 0, left: 0 }
    spyOn(component.gameEngine, 'buildNextNodeFromJoin').and.callFake(
      (storyJoin) => {
        if (storyJoin.node === 'node_1') return distributor
        return storyJoin.node === 'node_2' ? matchedNode : fallbackNode
      }
    )

    component.nextStep([{ node: 'node_1' }])
    tick(1200)

    expect(player.playerStats()).toEqual([{ id: 'stat_gold', amount: 1 }])
    expect(
      component.activeNodes.map((activeNode: node) => activeNode.id)
    ).toEqual(['node_2'])
    flush()
  }))

  it('applies the arrival event before showing and interpolating answers', fakeAsync(() => {
    const storyNode: node = {
      id: 'node_1',
      type: 'content',
      top: 0,
      left: 0,
      text: '#condition_key',
      events: [
        {
          id: 'e1',
          target: 'condition_key',
          type: 'condition',
          amount: '1',
          action: 'alterCondition',
        },
      ],
      answers: [
        {
          id: 'yes',
          join: [{ node: 'node_2' }],
          requirements: [
            { target: 'condition_key', type: 'condition', amount: 1 },
          ],
        },
        {
          id: 'no',
          join: [{ node: 'node_3' }],
          requirements: [
            { target: 'condition_key', type: 'condition', amount: 0 },
          ],
        },
      ],
    }
    spyOn(component.gameEngine, 'buildNextNodeFromJoin').and.returnValue(
      storyNode
    )
    const drawn = spyOn(component.onDrawNode, 'emit')

    component.nextStep([{ node: 'node_1' }])
    tick(1200)

    expect(
      component.activeNodes[0].answers.map(
        (answer: { id: string }) => answer.id
      )
    ).toEqual(['yes'])
    expect(component.activeNodes[0].text).toBe('true')
    expect(drawn).toHaveBeenCalledWith(
      jasmine.objectContaining({ text: 'true' })
    )
    flush()
  }))
})
