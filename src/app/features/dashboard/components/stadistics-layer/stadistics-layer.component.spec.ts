import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing'

import { StadisticsLayerComponent } from './stadistics-layer.component'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { StatisticsService } from 'src/app/shared/services/statistics.service'

describe('StadisticsLayerComponent', () => {
  let component: StadisticsLayerComponent
  let fixture: ComponentFixture<StadisticsLayerComponent>
  const gamesOf: Record<string, unknown[]> = { a: [{ user_name: 'Anna', path: [] }], b: [{ user_name: 'Bru', path: [] }] }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StadisticsLayerComponent],
      providers: [{ provide: StatisticsService, useValue: { getGamesOf: async (storyId: string) => gamesOf[storyId] } }],
    }).compileComponents()

    fixture = TestBed.createComponent(StadisticsLayerComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('shows the games of the story the board switches to, not those of the previous one', fakeAsync(() => {
    const activeStory = TestBed.inject(ActiveStoryService)
    const names = () => Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.gamesList__game p'))
      .map((name) => name.textContent)

    activeStory.load('a', 'A', { nodes: [] })
    fixture.detectChanges()
    flushMicrotasks()
    fixture.detectChanges()
    expect(names()).toEqual(['Anna'])

    activeStory.load('b', 'B', { nodes: [] })
    fixture.detectChanges()
    flushMicrotasks()
    fixture.detectChanges()
    expect(names()).toEqual(['Bru'])
  }))
})
