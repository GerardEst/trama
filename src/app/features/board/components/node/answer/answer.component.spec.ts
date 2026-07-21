import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'

import { AnswerComponent } from './answer.component'

describe('AnswerComponent', () => {
  let component: AnswerComponent
  let fixture: ComponentFixture<AnswerComponent>

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AnswerComponent],
      providers: [
        {
          provide: ActiveStoryService,
          useValue: {
            getEventsOfAnswer: () => [],
            getRequirementsOfAnswer: () => [],
          },
        },
      ],
    })
    fixture = TestBed.createComponent(AnswerComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
