import {
  ComponentFixture,
  fakeAsync,
  flush,
  TestBed,
  tick,
} from '@angular/core/testing'
import { node } from 'src/app/core/interfaces/interfaces'
import { PlayerService } from 'src/app/features/playground/services/player.service'

import { GameComponent } from './game.component'

describe('GameComponent', () => {
  let component: GameComponent
  let fixture: ComponentFixture<GameComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameComponent],
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
          requirements: [
            { target: 'condition_key', type: 'condition', amount: 1 },
          ],
        },
        {
          id: 'no',
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
