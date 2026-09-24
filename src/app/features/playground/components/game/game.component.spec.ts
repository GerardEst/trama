import {
  ComponentFixture,
  fakeAsync,
  flush,
  TestBed,
  tick,
} from '@angular/core/testing'
import { node } from 'src/app/core/interfaces/interfaces'

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
