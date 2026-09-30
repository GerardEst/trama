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

  it('uses the same passage font size for plain and rich text', () => {
    const host = fixture.nativeElement as HTMLElement
    component.data = { type: 'content', text: 'A passage', answers: [] }
    fixture.detectChanges()
    const plainSize = getComputedStyle(host.querySelector('.node__passage')!).fontSize

    component.data = { type: 'content', text: '<p>A passage</p>', answers: [] }
    fixture.detectChanges()
    const richSize = getComputedStyle(host.querySelector('.node__passage p')!).fontSize

    expect(richSize).toBe(plainSize)
  })

  it('keeps authored headings visually larger than passage paragraphs', () => {
    component.data = {
      type: 'content',
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
