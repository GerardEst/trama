import { TestBed } from '@angular/core/testing'
import { BoardPreferencesService } from './board-preferences.service'

describe('BoardPreferencesService', () => {
  let preferences: BoardPreferencesService

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [BoardPreferencesService] })
    preferences = TestBed.inject(BoardPreferencesService)
    localStorage.removeItem('polo-activeNodes')
  })

  it('stores active nodes independently by story', () => {
    preferences.setActiveNode('story-1', 'node_1')
    preferences.setActiveNode('story-2', 'node_4')

    expect(preferences.getActiveNode('story-1')).toBe('node_1')
    expect(preferences.getActiveNode('story-2')).toBe('node_4')
  })

  it('recovers from invalid local storage data', () => {
    localStorage.setItem('polo-activeNodes', 'not-json')

    expect(preferences.getActiveNode('story-1')).toBeUndefined()
  })
})
