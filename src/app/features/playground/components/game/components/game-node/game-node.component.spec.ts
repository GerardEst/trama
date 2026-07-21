import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { provideMarkdown } from 'ngx-markdown'

import { GameNodeComponent } from './game-node.component'

describe('GameNodeComponent', () => {
  let component: GameNodeComponent
  let fixture: ComponentFixture<GameNodeComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameNodeComponent, NoopAnimationsModule],
      providers: [provideMarkdown()],
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
})
