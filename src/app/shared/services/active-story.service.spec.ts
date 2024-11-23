import { TestBed } from '@angular/core/testing';

import { ActiveStoryService } from './active-story.service';

describe('ActiveStoryService', () => {
  let service: ActiveStoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActiveStoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
