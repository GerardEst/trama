import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'

import { GameNodeComponent } from './game-node.component'
import { GameEngineService } from 'src/app/features/playground/services/game-engine.service'
import { node } from 'src/app/core/interfaces/interfaces'

describe('GameNodeComponent', () => {
  let component: GameNodeComponent
  let fixture: ComponentFixture<GameNodeComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameNodeComponent, NoopAnimationsModule],
    }).compileComponents()

    fixture = TestBed.createComponent(GameNodeComponent)
    component = fixture.componentInstance
    component.data = {
      type: 'node',
      text: 'A story node',
      answers: [],
    }
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('renders formatted text and answers without an editor or unsafe HTML', () => {
    component.data = TestBed.inject(GameEngineService).interpolateNodeTexts({
      id: 'node_0', type: 'content', top: 0, left: 0,
      text: '<p>Hi <strong>reader</strong><img src="x" onerror="alert(1)"></p>',
      answers: [{ id: 'answer_0_0', text: '<p><em>Continue</em></p>' }],
    } as node)
    fixture.detectChanges()
    const host = fixture.nativeElement as HTMLElement
    expect(host.querySelector('.node__text strong')?.textContent).toBe('reader')
    expect(host.querySelector('.node__text img[onerror]')).toBeNull()
    expect(host.querySelector('.answers button em')?.textContent).toBe('Continue')
    expect(host.querySelector('.answers button p')).toBeNull()
  })
})
