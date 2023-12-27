import { TestBed } from '@angular/core/testing';

import { PopupManagerService } from './popup-manager.service';

describe('PopupManagerService', () => {
  let service: PopupManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PopupManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
