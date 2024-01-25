import { TestBed } from '@angular/core/testing';

import { TreeErrorFinderService } from './tree-error-finder.service';

describe('TreeErrorFinderService', () => {
  let service: TreeErrorFinderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TreeErrorFinderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
