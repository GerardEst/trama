import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { StoryStatisticsComponent } from './statistics.component'
import { DatabaseService } from 'src/app/core/services/database.service'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'

describe('StoryStatisticsComponent', () => {
  let fixture: ComponentFixture<StoryStatisticsComponent>
  const host = () => fixture.nativeElement as HTMLElement
  const games = [
    { user_name: 'anna', created_at: '2026-11-19T10:00:00Z', path: [{ id: 'node_end', type: 'node' }], result: { stats: { stat_gold: 1 }, conditions: [] } },
    { user_name: 'pau', created_at: '2026-11-18T10:00:00Z', path: [], result: { stats: { stat_gold: 7 }, conditions: [] } },
  ]

  async function render(rows: unknown[] | false, tracking = true) {
    await TestBed.configureTestingModule({
      imports: [StoryStatisticsComponent],
      providers: [provideRouter([])],
    }).compileComponents()
    spyOn(TestBed.inject(DatabaseService), 'getStadisticsOfTree').and.resolveTo(rows as never)
    const activeStory = TestBed.inject(ActiveStoryService)
    activeStory.load('story-1', 'The island', {
      refs: { stat_gold: { name: 'Gold', type: 'stat' } },
      nodes: [{ id: 'node_end', name: 'Home', type: 'end', top: 0, left: 0 }],
    })
    activeStory.patchConfiguration({ tracking })
    fixture = TestBed.createComponent(StoryStatisticsComponent)
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()
  }

  it('sums the games up, then lists how they end and every game', async () => {
    await render(games)
    expect(Array.from(host().querySelectorAll('.total dd')).slice(0, 1).map((dd) => dd.textContent?.trim())).toEqual(['2'])
    expect(Array.from(host().querySelectorAll('.bar__label')).map((label) => label.textContent?.trim()))
      .toEqual(['Home', 'Left before an ending'])
    expect(host().querySelector('.result__value')?.textContent?.trim()).toBe('4')
    expect(host().querySelectorAll('tbody tr').length).toBe(2)
    expect(host().querySelector('.notice')).toBeNull()
  })

  it('sorts the games by any column, saying which and in what direction', async () => {
    await render(games)
    const names = () => Array.from(host().querySelectorAll('tbody tr td:first-child')).map((cell) => cell.textContent?.trim())
    expect(names()).toEqual(['anna', 'pau'])
    const gold = Array.from(host().querySelectorAll<HTMLButtonElement>('th .sort')).find((button) => button.textContent?.includes('Gold'))!
    gold.click()
    fixture.detectChanges()
    expect(names()).toEqual(['pau', 'anna'])
    expect(gold.closest('th')?.getAttribute('aria-sort')).toBe('descending')
    gold.click()
    fixture.detectChanges()
    expect(names()).toEqual(['anna', 'pau'])
    expect(gold.closest('th')?.getAttribute('aria-sort')).toBe('ascending')
  })

  it('explains an empty story and leads to turning tracking on when it is off', async () => {
    await render([], false)
    expect(host().querySelector('.empty__title')?.textContent).toContain('No games yet')
    expect(host().querySelector('.notice')?.textContent).toContain('Tracking is off')
    expect(host().querySelector('.notice a')?.getAttribute('href')).toBe('/story/story-1')
    expect(host().querySelector('table')).toBeNull()
  })

  it('says when the games could not be loaded', async () => {
    await render(false)
    expect(host().querySelector('[role="alert"]')?.textContent).toContain('could not be loaded')
  })
})
