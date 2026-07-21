import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'

import { ConditionComponent } from './condition.component'

describe('ConditionComponent', () => {
  let component: ConditionComponent
  let fixture: ComponentFixture<ConditionComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConditionComponent],
      providers: [
        {
          provide: ActiveStoryService,
          useValue: { entireTree: () => ({ refs: {} }) },
        },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(ConditionComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
