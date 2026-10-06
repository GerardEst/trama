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
      id: 'node_0', top: 0, left: 0, type: 'content',
      text: 'A story node',
      answers: [],
    }
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('shows disconnected answers disabled and does not select them', () => {
    component.data = {
      id: 'node_0', top: 0, left: 0, type: 'content', text: 'Keep going',
      answers: [
        { id: 'unfinished', text: 'ccc' },
        { id: 'connected', text: 'Continue', join: [{ node: 'node_2' }] },
      ],
    }
    const selected = spyOn(component.onSelectAnswer, 'emit')
    fixture.detectChanges()
    const buttons = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('polo-game-answer button')

    expect(buttons[0].textContent).toContain('ccc')
    expect(buttons[0].disabled).toBeTrue()
    expect(buttons[1].disabled).toBeFalse()
    buttons[0].click()
    component.chooseAnswer(component.data.answers![0])
    expect(selected).not.toHaveBeenCalled()
    expect(component.data.selectedAnswerId).toBeUndefined()
  })

  it('places answers at the bottom of a taller host without overlapping long passages', () => {
    const host = fixture.nativeElement as HTMLElement
    host.style.height = '500px'
    component.data = {
      id: 'node_0', top: 0, left: 0, type: 'content', text: 'A short passage',
      answers: [{ id: 'answer_0_0', text: 'Continue', join: [{ node: 'node_1' }] }],
    }
    fixture.detectChanges()
    const content = host.querySelector('.node__content')!
    const answers = host.querySelector('.node__answers')!
    const padding = parseFloat(getComputedStyle(content).paddingBottom)
    expect(host.getBoundingClientRect().bottom - answers.getBoundingClientRect().bottom).toBeCloseTo(padding, 0)

    component.data = { ...component.data, text: 'A much longer passage.\n'.repeat(100) }
    fixture.detectChanges()
    expect(answers.getBoundingClientRect().top).toBeGreaterThanOrEqual(host.querySelector('.node__passage')!.getBoundingClientRect().bottom)
  })

  it('uses the same passage font size for plain and rich text', () => {
    const host = fixture.nativeElement as HTMLElement
    component.data = { id: 'node_0', top: 0, left: 0, type: 'content', text: 'A passage', answers: [] }
    fixture.detectChanges()
    const plainSize = getComputedStyle(host.querySelector('.node__passage')!).fontSize

    component.data = { id: 'node_0', top: 0, left: 0, type: 'content', text: '<p>A passage</p>', answers: [] }
    fixture.detectChanges()
    const richSize = getComputedStyle(host.querySelector('.node__passage p')!).fontSize

    expect(richSize).toBe(plainSize)
  })

  it('keeps authored headings visually larger than passage paragraphs', () => {
    component.data = {
      id: 'node_0', top: 0, left: 0, type: 'content',
      text: '<h1>Chapter</h1><h2>Scene</h2><h3>Moment</h3><p>The passage continues.</p>',
    }
    fixture.detectChanges()
    const passage = (fixture.nativeElement as HTMLElement).querySelector('.node__passage')!
    const size = (selector: string) =>
      parseFloat(getComputedStyle(passage.querySelector(selector)!).fontSize)

    expect(size('h3')).toBeGreaterThan(size('p') * 1.2)
    expect(size('h2')).toBeGreaterThan(size('h3'))
    expect(size('h1')).toBeGreaterThan(size('h2'))
  })

  it('renders formatted text and answers without an editor or unsafe HTML', () => {
    component.data = TestBed.inject(GameEngineService).interpolateNodeTexts({
      id: 'node_0', type: 'content', top: 0, left: 0,
      text: '<p>Hi <strong>reader</strong><img src="x" onerror="alert(1)"></p>',
      answers: [{ id: 'answer_0_0', text: '<p><em>Continue</em></p>' }],
    } as node)
    fixture.detectChanges()
    const host = fixture.nativeElement as HTMLElement
    expect(host.querySelector('.node__passage strong')?.textContent).toBe('reader')
    expect(host.querySelector('.node__passage img[onerror]')).toBeNull()
    expect(host.querySelector('polo-game-answer button em')?.textContent).toBe('Continue')
    expect(host.querySelector('polo-game-answer button p')).toBeNull()
  })
})
